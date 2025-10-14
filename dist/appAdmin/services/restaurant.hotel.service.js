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
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const restaurantCredential_template_1 = require("../../templates/restaurantCredential.template");
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const constants_1 = require("../../utils/miscellaneous/constants");
class HotelRestaurantService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createRestaurant(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { user, restaurant } = req.body;
                const files = req.files;
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "restaurant_photo":
                            restaurant.photo = filename;
                            break;
                        case "user_photo":
                            user.photo = filename;
                            break;
                        default:
                            break;
                    }
                }
                const restaurantModel = this.restaurantModel.restaurantModel(trx);
                const restaurantAdminModel = this.restaurantModel.restaurantAdminModel(trx);
                const checkRestaurant = yield restaurantModel.getAllRestaurant({
                    hotel_code,
                });
                let emailExists = false;
                let nameExists = false;
                if (checkRestaurant && checkRestaurant.data) {
                    emailExists = checkRestaurant.data.some((res) => res.email === restaurant.email);
                    nameExists = checkRestaurant.data.some((res) => res.name === restaurant.name);
                    if (emailExists) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Restaurant Email already exists with this hotel.",
                        };
                    }
                    if (nameExists) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Restaurant name already exists with this hotel.",
                        };
                    }
                }
                const adminEmailExists = yield restaurantAdminModel.getAllRestaurantAdminEmail({
                    email: user.email,
                    hotel_code,
                });
                if (adminEmailExists) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Restaurant Admin's email already exists with this hotel.",
                    };
                }
                const hashPass = yield lib_1.default.hashPass(user.password);
                // get account heads parentID
                const hotelModel = this.Model.HotelModel(trx);
                const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                    "FIXED_ASSET_HEAD_ID",
                ]);
                console.log({ heads, hotel_code });
                const asset_head = heads.find((h) => h.config === "FIXED_ASSET_HEAD_ID");
                if (!asset_head) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Group head is not found",
                    };
                }
                //   insert account head
                const accIds = yield lib_1.default.createAccountHeads({
                    trx,
                    payload: {
                        group_code: constants_1.ASSET_GROUP,
                        hotel_code,
                        name: [restaurant.name],
                        parent_id: asset_head.head_id,
                    },
                });
                const [newRestaurant] = yield restaurantModel.createRestaurant(Object.assign(Object.assign({}, restaurant), { hotel_code, created_by: admin_id }));
                // Need to check the role and permission before creating the admin user & restaurant.
                yield restaurantAdminModel.createRestaurantAdmin({
                    restaurant_id: newRestaurant.id,
                    hotel_code,
                    email: user.email,
                    name: user.name,
                    photo: user.photo,
                    phone: user.phone,
                    role_id: user.role,
                    password: hashPass,
                    created_by: admin_id,
                    owner: true,
                });
                yield lib_1.default.sendEmail(user.email, constants_1.OTP_FOR_CREDENTIALS, (0, restaurantCredential_template_1.newResutaurantUserAccount)(user.email, user.password, user.name));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Restaurant created successfully.",
                };
            }));
        });
    }
    getAllRestaurant(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { limit, skip, key } = req.query;
                const { data, total } = yield this.restaurantModel
                    .restaurantModel(trx)
                    .getAllRestaurant({
                    key: key,
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
            }));
        });
    }
    getRestaurantWithAdmin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { id } = req.params;
            const data = yield this.restaurantModel
                .restaurantModel()
                .getRestaurantWithAdmin({
                restaurant_id: parseInt(id),
                hotel_code,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Restaurant not found",
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateHotelRestaurantAndAdmin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { id } = req.params;
                let { user = {}, restaurant = {}, } = req.body;
                const restaurantModel = this.restaurantModel.restaurantModel(trx);
                const restaurantAdminModel = this.restaurantModel.restaurantAdminModel(trx);
                const files = req.files || [];
                for (const { fieldname, filename } of files) {
                    if (fieldname === "restaurant_photo")
                        restaurant.photo = filename;
                    if (fieldname === "user_photo")
                        user.photo = filename;
                }
                const checkRestaurant = yield restaurantModel.getRestaurantWithAdmin({
                    restaurant_id: Number(id),
                    hotel_code,
                });
                if (!checkRestaurant) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Restaurant not found",
                    };
                }
                if ((user === null || user === void 0 ? void 0 : user.email) && user.email !== checkRestaurant.admin_email) {
                    const emailExists = yield restaurantAdminModel.getAllRestaurantAdminEmail({
                        email: user.email,
                        hotel_code,
                    });
                    if (emailExists) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Restaurant Admin's email already exists with this hotel.",
                        };
                    }
                }
                const keep = (val, fallback) => val !== null && val !== void 0 ? val : fallback;
                const updatedRestaurant = {
                    name: keep(restaurant === null || restaurant === void 0 ? void 0 : restaurant.name, checkRestaurant.name),
                    email: keep(restaurant === null || restaurant === void 0 ? void 0 : restaurant.email, checkRestaurant.email),
                    phone: keep(restaurant === null || restaurant === void 0 ? void 0 : restaurant.phone, checkRestaurant.phone),
                    photo: keep(restaurant === null || restaurant === void 0 ? void 0 : restaurant.photo, checkRestaurant.photo),
                    address: keep(restaurant === null || restaurant === void 0 ? void 0 : restaurant.address, checkRestaurant.address),
                    city: keep(restaurant === null || restaurant === void 0 ? void 0 : restaurant.city, checkRestaurant.city),
                    country: keep(restaurant === null || restaurant === void 0 ? void 0 : restaurant.country, checkRestaurant.country),
                    bin_no: keep(restaurant === null || restaurant === void 0 ? void 0 : restaurant.bin_no, checkRestaurant.bin_no),
                    status: keep(restaurant === null || restaurant === void 0 ? void 0 : restaurant.status, checkRestaurant.status),
                };
                const updatedAdmin = {
                    name: keep(user === null || user === void 0 ? void 0 : user.name, checkRestaurant.name),
                    email: keep(user === null || user === void 0 ? void 0 : user.email, checkRestaurant.email),
                    phone: keep(user === null || user === void 0 ? void 0 : user.phone, checkRestaurant.phone),
                    photo: keep(user === null || user === void 0 ? void 0 : user.photo, checkRestaurant.photo),
                };
                yield restaurantModel.updateRestaurant({
                    id: Number(id),
                    payload: updatedRestaurant,
                });
                yield restaurantAdminModel.updateRestaurantAdmin({
                    id: checkRestaurant.admin_id,
                    payload: updatedAdmin,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Restaurant updated successfully",
                };
            }));
        });
    }
}
exports.default = HotelRestaurantService;
//# sourceMappingURL=restaurant.hotel.service.js.map