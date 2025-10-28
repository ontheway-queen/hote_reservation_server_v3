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
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
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
                const { user, restaurant, staffs } = req.body;
                console.log({ staffs });
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
                const restaurantStaffModel = this.restaurantModel.restaurantStaffModel(trx);
                const employeeModel = this.Model.employeeModel(trx);
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
                // create role
                const [roleRes] = yield restaurantAdminModel.createRole({
                    hotel_code,
                    res_id: newRestaurant.id,
                    name: "Restaurant Admin",
                    created_by: admin_id,
                    init_role: true,
                });
                // Need to check the role and permission before creating the admin user & restaurant.
                yield restaurantAdminModel.createRestaurantAdmin({
                    restaurant_id: newRestaurant.id,
                    hotel_code,
                    email: user.email,
                    name: user.name,
                    photo: user.photo,
                    phone: user.phone,
                    role_id: roleRes.id,
                    password: hashPass,
                    created_by: admin_id,
                    owner: true,
                });
                const getAllResPermisson = yield restaurantAdminModel.getHotelAllResPermissionByHotel({
                    hotel_code,
                });
                if (!getAllResPermisson.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "No permission found to assign the role",
                    };
                }
                if (getAllResPermisson && getAllResPermisson.length > 0) {
                    const permissionPayload = getAllResPermisson.map((perm) => ({
                        role_id: roleRes.id,
                        res_permission_id: perm.id,
                        read: 1,
                        write: 1,
                        update: 1,
                        delete: 1,
                        hotel_code,
                        created_by: admin_id,
                    }));
                    yield restaurantAdminModel.insertInRolePermission(permissionPayload);
                }
                if (staffs) {
                    for (const staff of staffs) {
                        const checkEmployee = yield employeeModel.getSingleEmployee(staff, hotel_code);
                        if (!checkEmployee) {
                            throw new customEror_1.default(`The requested employee with ID: ${staff} does not exist`, this.StatusCode.HTTP_NOT_FOUND);
                        }
                        yield restaurantStaffModel.insertStaffData({
                            employee_id: staff,
                            hotel_code,
                            restaurant_id: newRestaurant.id,
                        });
                    }
                }
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
            const restaurant = yield this.restaurantModel
                .restaurantModel()
                .getRestaurantWithAdmin({
                restaurant_id: parseInt(id),
                hotel_code,
            });
            const { data } = yield this.restaurantModel
                .restaurantStaffModel()
                .getAllStaffs({ restaurant_id: parseInt(id), hotel_code });
            if (!restaurant) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Restaurant not found",
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, restaurant), { staffs: data }),
            };
        });
    }
    assignFoodIngredientsToRestaurant(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const payload = req.body.productIds.map((item) => {
                return {
                    hotel_code,
                    product_id: item,
                };
            });
            yield this.restaurantModel
                .restaurantModel()
                .assignFoodIngredientsToRestaurant(payload);
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    getAssignFoodIngredientsToRestaurant(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const data = yield this.restaurantModel
                .restaurantModel()
                .getAssignFoodIngredientsToRestaurant(hotel_code);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    deleteAssignFoodIngredientsToRestaurant(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            yield this.restaurantModel
                .restaurantModel()
                .deleteAssignFoodIngredientsToRestaurant(hotel_code, Number(req.params.id));
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
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
    addStaffs(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const body = req.body;
                const employeeModel = this.Model.employeeModel(trx);
                const restaurantStaffModel = this.restaurantModel.restaurantStaffModel(trx);
                for (const staff of body) {
                    const checkEmployee = yield employeeModel.getSingleEmployee(staff.employee_id, hotel_code);
                    if (!checkEmployee) {
                        throw new customEror_1.default(`The requested employee does not exist`, this.StatusCode.HTTP_NOT_FOUND);
                    }
                    const checkStaff = yield restaurantStaffModel.getSingleStaff({
                        employee_id: staff.employee_id,
                        restaurant_id: staff.restaurant_id,
                        hotel_code,
                    });
                    if (checkStaff) {
                        throw new customEror_1.default(`The requested employee is already added to the restaurant`, this.StatusCode.HTTP_CONFLICT);
                    }
                    const newdata = yield restaurantStaffModel.insertStaffData(Object.assign(Object.assign({}, staff), { hotel_code }));
                    console.log({ newdata });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Staff added successfully",
                };
            }));
        });
    }
    removeStaff(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { staff_id, restaurant_id } = req.params;
                const { hotel_code } = req.hotel_admin;
                const restaurantStaffModel = this.restaurantModel.restaurantStaffModel(trx);
                const checkStaff = yield restaurantStaffModel.getSingleStaff({
                    id: Number(staff_id),
                    restaurant_id: Number(restaurant_id),
                    hotel_code,
                });
                if (!checkStaff) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Staff not found in the restaurant",
                    };
                }
                yield restaurantStaffModel.removeStaff({
                    id: Number(staff_id),
                    restaurant_id: Number(restaurant_id),
                    hotel_code,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Staff removed successfully",
                };
            }));
        });
    }
}
exports.default = HotelRestaurantService;
//# sourceMappingURL=restaurant.hotel.service.js.map