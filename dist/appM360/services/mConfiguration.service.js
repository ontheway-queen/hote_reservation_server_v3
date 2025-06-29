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
class MConfigurationService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createPermissionGroup(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.admin;
            const model = this.Model.mConfigurationModel();
            // get all permission group
            const checkGroup = yield model.getAllRolePermissionGroup({
                name: req.body.name,
            });
            if (checkGroup.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: this.ResMsg.HTTP_CONFLICT,
                };
            }
            yield model.createPermissionGroup(Object.assign(Object.assign({}, req.body), { created_by: id }));
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    getPermissionGroup(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.mConfigurationModel();
            const data = yield model.getAllRolePermissionGroup({});
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    // create permission
    createPermission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.admin;
            const { permission_group_id, name } = req.body;
            // check group
            const check = yield this.Model.mConfigurationModel().getSinglePermissionGroup(permission_group_id);
            if (!check.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Invalid group ID",
                };
            }
            const insertObj = name.map((item) => {
                return {
                    permission_group_id,
                    name: item,
                    created_by: id,
                };
            });
            yield this.Model.mConfigurationModel().createPermission(insertObj);
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    getSingleHotelPermission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.params;
            const data = yield this.Model.mConfigurationModel().getAllPermissionByHotel(parseInt(hotel_code));
            const { permissions } = data[0];
            const groupedPermissions = {};
            permissions === null || permissions === void 0 ? void 0 : permissions.forEach((entry) => {
                const permission_group_id = entry.permission_group_id;
                const permission = {
                    permission_id: entry.permission_id,
                    permission_name: entry.permission_name,
                };
                if (!groupedPermissions[permission_group_id]) {
                    groupedPermissions[permission_group_id] = {
                        permission_group_id: permission_group_id,
                        permissionGroupName: entry.permission_group_name,
                        permissions: [permission],
                    };
                }
                else {
                    groupedPermissions[permission_group_id].permissions.push(permission);
                }
            });
            const result = Object.values(groupedPermissions);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: result,
            };
        });
    }
    updateSingleHotelPermission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const hotel_code = parseInt(req.params.hotel_code);
                const { added = [], deleted = [] } = req.body;
                const model = this.Model.mConfigurationModel(trx);
                const checkHotelPermission = yield model.getAllPermissionByHotel(hotel_code);
                const existingPermissions = ((_a = checkHotelPermission[0]) === null || _a === void 0 ? void 0 : _a.permissions) || [];
                const existingPermissionIds = new Set(existingPermissions.map((perm) => perm.permission_id));
                const existingHPermissionMap = new Map();
                existingPermissions.forEach((perm) => existingHPermissionMap.set(perm.permission_id, perm.h_permission_id));
                // Filter only new permissions to add
                const newPermissionIds = added.filter((permId) => !existingPermissionIds.has(permId));
                if (newPermissionIds.length > 0) {
                    const insertPayload = newPermissionIds.map((permId) => ({
                        hotel_code: hotel_code,
                        permission_id: permId,
                    }));
                    yield model.addedHotelPermission(insertPayload);
                }
                if (deleted.length > 0) {
                    const hPermissionIdsToDelete = deleted
                        .map((permId) => existingHPermissionMap.get(permId))
                        .filter((id) => id !== undefined);
                    if (hPermissionIdsToDelete.length > 0) {
                        yield model.deleteHotelRolePermission(hotel_code, hPermissionIdsToDelete);
                    }
                    yield model.deleteHotelPermission(hotel_code, deleted);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Successfully Permission Updated",
                };
            }));
        });
    }
    getAllPermission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.mConfigurationModel().getAllPermission({});
            const groupedPermissions = {};
            data.forEach((entry) => {
                const permission_group_id = entry.permission_group_id;
                const permission = {
                    permission_id: entry.permission_id,
                    permission_name: entry.permission_name,
                };
                if (!groupedPermissions[permission_group_id]) {
                    groupedPermissions[permission_group_id] = {
                        permission_group_id: permission_group_id,
                        permissionGroupName: entry.permission_group_name,
                        permissions: [permission],
                    };
                }
                else {
                    groupedPermissions[permission_group_id].permissions.push(permission);
                }
            });
            const result = Object.values(groupedPermissions);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: result,
            };
        });
    }
    //---------------------------
    getAllAccomodation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.mConfigurationModel().getAllAccomodation({
                status: req.query.status,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getSingleAccomodation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.mConfigurationModel().getAllAccomodation({
                status: req.query.status,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getAllCity(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.mConfigurationModel().getAllCity({
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.limit),
                search: req.query.search,
                country_code: req.query.country_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    insertCity(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const getLastCityCode = yield this.Model.mConfigurationModel().getLastCityCode();
            yield this.Model.mConfigurationModel().insertCity(Object.assign(Object.assign({}, req.body), { city_code: getLastCityCode + 1 }));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    getAllCountry(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.mConfigurationModel().getAllCountry({
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.limit),
                search: req.query.search,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    //=================== Room type Amenities ======================//
    // create Room Amenities head
    createRoomTypeAmenitiesHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                // room amenities
                const model = this.Model.mConfigurationModel(trx);
                const { data } = yield model.getAllRoomTypeAmenitiesHead({
                    search: req.body.name,
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Room type amenities head already exists",
                    };
                }
                yield model.createRoomTypeAmenitiesHead(req.body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Room Amenities head created successfully.",
                };
            }));
        });
    }
    // Get All Room Amenities head
    getAllRoomTypeAmenitiesHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, search, status } = req.query;
            const { data } = yield this.Model.mConfigurationModel().getAllRoomTypeAmenitiesHead({
                status: status,
                limit: limit,
                skip: skip,
                search: search,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    // Update Room type Amenities head
    updateRoomTypeAmenitiesHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const model = this.Model.mConfigurationModel(trx);
                const { data } = yield model.getAllRoomTypeAmenitiesHead({
                    search: req.body.name,
                });
                console.log({ data });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Room type amenities head already exists",
                    };
                }
                console.log({ id });
                yield model.updateRoomTypeAmenitiesHead(parseInt(id), req.body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Room amenities head updated successfully",
                };
            }));
        });
    }
    // create Room Amenities
    createRoomTypeAmenities(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const files = req.files || [];
                if (files.length) {
                    req.body["icon"] = files[0].filename;
                }
                // room amenities
                const settingModel = this.Model.mConfigurationModel(trx);
                const { data } = yield settingModel.getAllRoomTypeAmenities({
                    search: req.body.name,
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Room type amenities already exists",
                    };
                }
                yield settingModel.createRoomTypeAmenities(req.body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Room Amenities created successfully.",
                };
            }));
        });
    }
    // Get All Room Amenities
    getAllRoomTypeAmenities(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, search, status } = req.query;
            const model = this.Model.mConfigurationModel();
            const { data, total } = yield model.getAllRoomTypeAmenities({
                status: status,
                limit: limit,
                skip: skip,
                search: search,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // Update Room Amenities
    updateRoomTypeAmenities(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { id } = req.params;
                const model = this.Model.mConfigurationModel(trx);
                const files = req.files || [];
                if (files.length) {
                    req.body["icon"] = files[0].filename;
                }
                if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.name) {
                    const { data } = yield model.getAllRoomTypeAmenities({
                        search: req.body.name,
                    });
                    if (data.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: " Room Amenities already exists",
                        };
                    }
                }
                yield model.updateRoomTypeAmenities(parseInt(id), req.body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Room Amenities updated successfully",
                };
            }));
        });
    }
    // Delete Room Amenities
    deleteRoomTypeAmenities(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const model = this.Model.mConfigurationModel(trx);
                yield model.deleteRoomTypeAmenities(parseInt(id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Room Amenities deleted successfully",
                };
            }));
        });
    }
}
exports.default = MConfigurationService;
//# sourceMappingURL=mConfiguration.service.js.map