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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class GuestService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Create Guest
    createGuest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { name, email, city, country_id } = req.body;
                const model = this.Model.guestModel(trx);
                const checkUser = yield model.getSingleGuest({
                    email,
                    hotel_code,
                });
                if (checkUser.length > 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Email already exists, give another unique email address",
                    };
                }
                let userRes;
                // Create user
                userRes = yield model.createGuest({
                    first_name: name,
                    last_name: name,
                    email,
                    city,
                    country_id,
                    hotel_code,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Guest created successfully.",
                };
            }));
        });
    }
    // get All guest service
    getAllGuest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, email, limit, skip, status } = req.query;
            const { hotel_code } = req.hotel_admin;
            const { data, total } = yield this.Model.guestModel().getAllGuest({
                status: status,
                key: search,
                email: email,
                limit: limit,
                skip: skip,
                hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getSingleGuest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const singleGuest = yield this.Model.guestModel().getSingleGuest({
                hotel_code: req.hotel_admin.hotel_code,
                id: parseInt(req.params.id),
            });
            if (!singleGuest.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: singleGuest[0],
            };
        });
    }
    updateSingleGuestValidator(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { first_name, last_name, email, address, phone, country_id } = req.body;
            console.log(req.body);
            const { hotel_code } = req.hotel_admin;
            // Model
            const model = this.Model.guestModel();
            // Check if user already exists
            const checkUser = yield model.getSingleGuest({
                hotel_code,
                id: parseInt(req.params.id),
            });
            if (checkUser.length === 0) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Guest not found",
                };
            }
            // Update guest
            yield model.updateSingleGuest({
                id: parseInt(req.params.id),
                hotel_code,
            }, {
                first_name,
                last_name,
                email,
                address,
                phone,
                country_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Guest updated successfully",
            };
        });
    }
}
exports.GuestService = GuestService;
exports.default = GuestService;
//# sourceMappingURL=guest.service.js.map