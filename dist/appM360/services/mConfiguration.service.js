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
    // create permission
    createPermission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.admin;
            yield this.Model.mConfigurationModel().createPermission({
                name: req.body.name,
                created_by: id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    // get all permission
    getAllPermission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.mConfigurationModel();
            const data = yield model.getAllPermission();
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