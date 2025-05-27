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
class RoomSettingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //=================== Room Type ======================//
    // create room type
    createRoomType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const _a = req.body, { beds, rt_amenities, categories_type_id } = _a, rest = __rest(_a, ["beds", "rt_amenities", "categories_type_id"]);
                const configModel = this.Model.mConfigurationModel(trx);
                const settingModel = this.Model.settingModel(trx);
                // check room type by name
                const { data: roomTypeData } = yield settingModel.getAllRoomType({
                    search: rest.name,
                    hotel_code,
                });
                if (roomTypeData.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Room type name is already exist",
                    };
                }
                // bed type check
                const bedIds = beds.map((item) => item.bed_type_id);
                const bedTypeData = yield settingModel.getAllBedType({
                    bedIds: bedIds,
                    hotel_code,
                });
                if (bedTypeData.data.length !== bedIds.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Bed Type not found",
                    };
                }
                // insert in room type
                const roomTypeRes = yield settingModel.createRoomType({
                    base_occupancy: rest.base_occupancy,
                    bed_count: rest.bed_count,
                    description: rest.description,
                    hotel_code,
                    max_adults: rest.max_adults,
                    max_children: rest.max_children,
                    max_occupancy: rest.max_occupancy,
                    categories_type_id,
                    name: rest.name,
                    room_info: rest.room_info,
                    area: rest.area,
                });
                console.log({ roomTypeRes });
                // photos
                const room_type_photos = [];
                const files = req.files || [];
                if (files.length) {
                    files.forEach((item) => {
                        room_type_photos.push({
                            hotel_code,
                            photo_url: item.filename,
                            room_type_id: roomTypeRes[0].id,
                        });
                    });
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Room type photos have to be given",
                    };
                }
                console.log({ room_type_photos });
                yield settingModel.insertRoomTypePhotos(room_type_photos);
                // room type beds
                const roomTypeBedsPayload = beds.map((item) => {
                    return {
                        bed_type_id: item.bed_type_id,
                        room_type_id: roomTypeRes[0].id,
                        quantity: item.quantity,
                    };
                });
                yield settingModel.insertRoomTypeBeds(roomTypeBedsPayload);
                yield settingModel.insertRoomTypeAmenities({
                    hotel_code,
                    room_type_id: roomTypeRes[0].id,
                    rt_amenities,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Room Type created successfully.",
                };
            }));
        });
    }
    // Get all room type
    getAllRoomType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, search, status } = req.query;
            const { data, total } = yield this.Model.settingModel().getAllRoomType({
                is_active: status,
                limit: limit,
                skip: skip,
                search: search,
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
    // get single room type
    getSingleRoomType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.settingModel().getSingleRoomType(parseInt(req.params.id), req.hotel_admin.hotel_code);
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0],
            };
        });
    }
    // Update room type
    updateRoomType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.settingModel().getSingleRoomType(parseInt(req.params.id), req.hotel_admin.hotel_code);
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const _a = req.body, { beds, rt_amenities, remove_photos, categories_type_id, remove_beds } = _a, rest = __rest(_a, ["beds", "rt_amenities", "remove_photos", "categories_type_id", "remove_beds"]);
                const settingModel = this.Model.settingModel(trx);
                if (rest.name) {
                    // check room type by name
                    const { data: roomTypeData } = yield settingModel.getAllRoomType({
                        search: rest.name,
                        hotel_code,
                    });
                    if (roomTypeData.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Room type name is already exist",
                        };
                    }
                }
                if (beds) {
                    // bed type check
                    const bedIds = beds.map((item) => item.bed_type_id);
                    const bedTypeData = yield settingModel.getAllBedType({
                        bedIds: bedIds,
                        hotel_code,
                    });
                    if (bedTypeData.data.length !== bedIds.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Bed Type not found",
                        };
                    }
                }
                const restData = Object.keys(rest);
                if (restData.length) {
                    // insert in room type
                    yield settingModel.updateRoomType(parseInt(req.params.id), hotel_code, {
                        base_occupancy: rest.base_occupancy,
                        bed_count: rest.bed_count,
                        description: rest.description,
                        max_adults: rest.max_adults,
                        max_children: rest.max_children,
                        max_occupancy: rest.max_occupancy,
                        categories_type_id,
                        name: rest.name,
                        room_info: rest.room_info,
                        area: rest.area,
                    });
                }
                // photos
                const room_type_photos = [];
                const files = req.files || [];
                if (files === null || files === void 0 ? void 0 : files.length) {
                    files.forEach((item) => {
                        room_type_photos.push({
                            hotel_code,
                            photo_url: item.filename,
                            room_type_id: parseInt(req.params.id),
                        });
                    });
                }
                // insert photos
                if (room_type_photos === null || room_type_photos === void 0 ? void 0 : room_type_photos.length) {
                    yield settingModel.insertRoomTypePhotos(room_type_photos);
                }
                // insert bed
                if (beds === null || beds === void 0 ? void 0 : beds.length) {
                    // room type beds
                    const roomTypeBedsPayload = beds === null || beds === void 0 ? void 0 : beds.map((item) => {
                        return {
                            bed_type_id: item.bed_type_id,
                            room_type_id: parseInt(req.params.id),
                            quantity: item.quantity,
                        };
                    });
                    yield settingModel.insertRoomTypeBeds(roomTypeBedsPayload);
                }
                // insert room amenities
                if (rt_amenities) {
                    yield settingModel.insertRoomTypeAmenities({
                        hotel_code,
                        room_type_id: parseInt(req.params.id),
                        rt_amenities,
                    });
                }
                // remove beds
                if (remove_beds === null || remove_beds === void 0 ? void 0 : remove_beds.length) {
                    yield settingModel.deleteBedsOfRoomType(parseInt(req.params.id), remove_beds);
                }
                // remove photos
                if (remove_photos === null || remove_photos === void 0 ? void 0 : remove_photos.length) {
                    yield settingModel.deletePhotosOfRoomType(parseInt(req.params.id), remove_photos);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Room Type updated successfully.",
                };
            }));
        });
    }
    // Delete room type
    deleteRoomType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { id } = req.params;
                const model = this.Model.settingModel(trx);
                yield model.deleteRoomType(parseInt(id), hotel_code);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Room Type deleted successfully",
                };
            }));
        });
    }
    getAllRoomTypeAmenities(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, search, status } = req.query;
            const model = this.Model.settingModel();
            const { data } = yield model.getAllRoomTypeAmenities({
                status: status,
                limit: limit,
                skip: skip,
                search: search,
                hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    //=================== Room Type Categories ======================//
    // create room type
    createRoomTypeCategories(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { name } = req.body;
                // room type check
                const settingModel = this.Model.settingModel(trx);
                const data = yield settingModel.getAllRoomTypeCategories({
                    exact_match: name,
                    hotel_code,
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Room Type Categories already exists",
                    };
                }
                yield settingModel.createRoomTypeCategories({
                    hotel_code,
                    name,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Room type categories created successfully.",
                };
            }));
        });
    }
    // Get all room type
    getAllRoomTypeCategories(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, room_type, status } = req.query;
            const data = yield this.Model.settingModel().getAllRoomTypeCategories({
                status: status,
                limit: limit,
                skip: skip,
                search: room_type,
                hotel_code,
                is_deleted: false,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    // Update room type
    updateRoomTypeCategories(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { hotel_code } = req.hotel_admin;
                const model = this.Model.settingModel(trx);
                // get single room type categories
                const data = yield model.getSingleRoomTypeCategories(parseInt(req.params.id), hotel_code);
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Room Type Categories not found",
                    };
                }
                if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.name) {
                    const data = yield model.getAllRoomTypeCategories({
                        exact_match: req.body.name,
                        hotel_code,
                    });
                    if (data.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Room Type already exists",
                        };
                    }
                }
                yield model.updateRoomTypeCategories(parseInt(req.params.id), hotel_code, req.body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Room type categories updated successfully",
                };
            }));
        });
    }
    // Delete room type
    deleteRoomTypeCategories(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const model = this.Model.settingModel();
            // get single room type categories
            const data = yield model.getSingleRoomTypeCategories(parseInt(req.params.id), hotel_code);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Room Type Categories not found",
                };
            }
            yield model.updateRoomTypeCategories(parseInt(req.params.id), hotel_code, {
                is_deleted: true,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Room Type deleted successfully",
            };
        });
    }
    //=================== Bed Type ======================//
    // create bed type
    createBedType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                // bed type check
                const model = this.Model.settingModel(trx);
                const { data } = yield model.getAllBedType({
                    search: req.body.name,
                    hotel_code,
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Bed Type already exists",
                    };
                }
                yield model.createBedType(Object.assign({ hotel_code }, req.body));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Bed Type created successfully.",
                };
            }));
        });
    }
    // Get all bed type
    getAllBedType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, search, status } = req.query;
            const model = this.Model.settingModel();
            const { data } = yield model.getAllBedType({
                status: status,
                limit: limit,
                skip: skip,
                search: search,
                hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    // Update bed type
    updateBedType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { hotel_code } = req.hotel_admin;
                const { id } = req.params;
                const model = this.Model.settingModel(trx);
                if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.name) {
                    const { data } = yield model.getAllBedType({
                        search: req.body.name,
                        hotel_code,
                    });
                    if (data.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Bed Type already exists",
                        };
                    }
                }
                yield model.updateBedType(parseInt(id), hotel_code, req.body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Bed Type updated successfully",
                };
            }));
        });
    }
    // Delete bed type
    deleteBedType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { id } = req.params;
                const model = this.Model.settingModel(trx);
                yield model.updateBedType(parseInt(id), hotel_code, {
                    is_deleted: true,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Bed Type deleted successfully",
                };
            }));
        });
    }
}
exports.default = RoomSettingService;
//# sourceMappingURL=setting.room.service%20copy.js.map