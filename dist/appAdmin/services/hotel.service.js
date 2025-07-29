"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class HotelService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // get my hotel
    getMyHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const checkHotel = yield this.Model.HotelModel().getSingleHotel({
                hotel_code,
            });
            if (!checkHotel) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: checkHotel,
            };
        });
    }
    // update my hotel
    updateHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const _a = req.body, { fax, phone, website_url, hotel_email, remove_hotel_images, expiry_date, optional_phone1, hotel_name } = _a, hotelData = __rest(_a, ["fax", "phone", "website_url", "hotel_email", "remove_hotel_images", "expiry_date", "optional_phone1", "hotel_name"]);
                const { id } = req.params;
                const parsedId = parseInt(id);
                const files = req.files || [];
                if (expiry_date && new Date(expiry_date) < new Date()) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: "Expiry date cannot be earlier than today",
                    };
                }
                const model = this.Model.HotelModel(trx);
                const existingHotel = yield model.getSingleHotel({ id: parsedId });
                if (!existingHotel) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { hotel_code } = existingHotel;
                // Filter out only defined fields for update
                const filteredUpdateData = Object.fromEntries(Object.entries(Object.assign(Object.assign({}, hotelData), { expiry_date, name: hotel_name })).filter(([_, value]) => value !== undefined));
                if (Object.keys(filteredUpdateData).length > 0) {
                    yield model.updateHotel(filteredUpdateData, { id: parsedId });
                }
                // === Handle file uploads ===
                let logoFilename;
                const hotelImages = [];
                for (const file of files) {
                    const { fieldname, filename } = file;
                    if (fieldname === "logo") {
                        logoFilename = filename;
                    }
                    else {
                        hotelImages.push({
                            hotel_code,
                            image_url: filename,
                            image_caption: undefined,
                            main_image: fieldname === "main_image" ? "Y" : "N",
                        });
                    }
                }
                // === Update hotel contact details ===
                const contactUpdates = {
                    email: hotel_email,
                    fax,
                    phone,
                    website_url,
                    optional_phone1,
                };
                if (logoFilename) {
                    contactUpdates.logo = logoFilename;
                }
                const hasContactUpdates = Object.values(contactUpdates).some((val) => val !== undefined);
                if (hasContactUpdates) {
                    yield model.updateHotelContactDetails(contactUpdates, hotel_code);
                }
                // === Insert new hotel images ===
                if (hotelImages.length > 0) {
                    yield model.insertHotelImages(hotelImages);
                }
                // === Remove selected hotel images ===
                if (Array.isArray(remove_hotel_images) &&
                    remove_hotel_images.length > 0) {
                    yield model.deleteHotelImage(remove_hotel_images, hotel_code);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Hotel updated successfully",
                };
            }));
        });
    }
}
exports.default = HotelService;
//# sourceMappingURL=hotel.service.js.map