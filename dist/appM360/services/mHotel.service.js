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
const mHotelUserCredentials_template_1 = require("../../templates/mHotelUserCredentials.template");
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const constants_1 = require("../../utils/miscellaneous/constants");
class MHotelService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { hotel_email, user_name, password, accommodation_type_id, hotel_name, address, chain_name, city_code, country_code, description, expiry_date, latitude, longitude, postal_code, star_category, fax, phone, website_url, } = req.body;
                console.log(req.body);
                const expiry = new Date(expiry_date);
                if (expiry < new Date()) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: "Expiry date must be later than the current date",
                    };
                }
                const files = req.files || [];
                const model = this.Model.HotelModel(trx);
                const administrationModel = this.Model.rAdministrationModel(trx);
                //  check hotel admin by hotel email
                const checkHotelAdmin = yield administrationModel.getSingleAdmin({
                    email: hotel_email,
                });
                if (checkHotelAdmin.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Admin email already exists",
                    };
                }
                const hashPass = yield lib_1.default.hashPass(password);
                // get last hotel id
                const lastHotelId = yield model.getHotelLastId();
                const now = new Date();
                const hotel_code = parseInt(`${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(lastHotelId).padStart(4, "0")}`, 10);
                let logoFilename = "";
                const hotelImages = [];
                files.forEach((file) => {
                    if (file.fieldname === "logo") {
                        logoFilename = file.filename;
                    }
                    else if (file.fieldname === "hotel_images") {
                        hotelImages.push({
                            hotel_code,
                            image_url: file.filename,
                            image_caption: undefined,
                            main_image: "N",
                        });
                    }
                    else if (file.fieldname === "main_image") {
                        hotelImages.push({
                            hotel_code,
                            image_url: file.filename,
                            image_caption: undefined,
                            main_image: "Y",
                        });
                    }
                });
                // get single accommodation type
                const getSingleAccomodationType = yield this.Model.mConfigurationModel().getSingleAccomodation(accommodation_type_id);
                // create hotel
                yield model.createHotel({
                    name: hotel_name,
                    hotel_code,
                    accommodation_type_id,
                    accommodation_type_name: (_a = getSingleAccomodationType[0]) === null || _a === void 0 ? void 0 : _a.name,
                    city_code,
                    country_code,
                    latitude,
                    longitude,
                    star_category,
                    address,
                    chain_name,
                    description,
                    postal_code,
                    expiry_date,
                });
                // insert others info
                yield model.insertHotelContactDetails({
                    logo: logoFilename,
                    email: hotel_email,
                    fax,
                    phone,
                    hotel_code,
                    website_url,
                });
                if (hotelImages.length)
                    yield model.insertHotelImages(hotelImages);
                // insert Role
                const roleRes = yield administrationModel.createRole({
                    name: "super-admin",
                    hotel_code,
                    init_role: true,
                });
                // insert user admin
                yield administrationModel.createAdmin({
                    email: hotel_email,
                    name: user_name,
                    password: hashPass,
                    role: roleRes[0].id,
                    hotel_code,
                    owner: true,
                });
                yield lib_1.default.sendEmail(hotel_email, constants_1.OTP_FOR_CREDENTIALS, (0, mHotelUserCredentials_template_1.newHotelUserAccount)(hotel_email, password, hotel_name));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    getAllHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { status, from_date, to_date, key, limit, skip } = req.query;
            const model = this.Model.HotelModel();
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const { data, total } = yield model.getAllHotel({
                name: key,
                status: status,
                from_date: from_date,
                to_date: endDate,
                limit: limit,
                skip: skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getSingleHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.HotelModel();
            const getSingleHotel = yield model.getSingleHotel({ id: parseInt(id) });
            if (!getSingleHotel.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            // const data: IhotelPermissions[] =
            //   await this.Model.mConfigurationModel().getAllPermissionByHotel(
            //     parseInt(id)
            //   );
            // const { permissions } = data[0];
            // const groupedPermissions: any = {};
            // permissions?.forEach((entry) => {
            //   const permission_group_id = entry.permission_group_id;
            //   const permission = {
            //     permission_id: entry.permission_id,
            //     permission_name: entry.permission_name,
            //   };
            //   if (!groupedPermissions[permission_group_id]) {
            //     groupedPermissions[permission_group_id] = {
            //       permission_group_id: permission_group_id,
            //       permissionGroupName: entry.permission_group_name,
            //       permissions: [permission],
            //     };
            //   } else {
            //     groupedPermissions[permission_group_id].permissions.push(permission);
            //   }
            // });
            // const result = Object.values(groupedPermissions);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: getSingleHotel[0],
                // data: { ...rest, permissions: result },
            };
        });
    }
    updateHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const _a = req.body, { fax, phone, website_url, hotel_email, remove_hotel_images, expiry_date, hotel_name } = _a, hotelData = __rest(_a, ["fax", "phone", "website_url", "hotel_email", "remove_hotel_images", "expiry_date", "hotel_name"]);
                console.log(req.body, "request body");
                const { id } = req.params;
                const parsedId = parseInt(id);
                if (expiry_date && new Date(expiry_date) < new Date()) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: "Expiry date cannot be earlier than today",
                    };
                }
                const files = req.files || [];
                const model = this.Model.HotelModel(trx);
                const existingHotel = yield model.getSingleHotel({
                    id: parsedId,
                });
                if (!existingHotel || existingHotel.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { hotel_code } = existingHotel[0];
                const filteredUpdateData = Object.fromEntries(Object.entries(Object.assign(Object.assign({}, hotelData), { expiry_date, name: hotel_name })).filter(([_, value]) => value !== undefined));
                if (Object.keys(filteredUpdateData).length > 0) {
                    yield model.updateHotel(filteredUpdateData, { id: parsedId });
                }
                // Process uploaded files
                let logoFilename = "";
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
                if (logoFilename || hotel_email || fax || phone || website_url)
                    yield model.updateHotelContactDetails({
                        logo: logoFilename,
                        email: hotel_email,
                        fax,
                        phone,
                        website_url,
                    }, hotel_code);
                if (hotelImages.length > 0) {
                    yield model.insertHotelImages(hotelImages);
                }
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
exports.default = MHotelService;
//# sourceMappingURL=mHotel.service.js.map