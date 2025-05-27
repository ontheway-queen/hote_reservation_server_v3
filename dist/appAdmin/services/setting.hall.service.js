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
const Setting_Model_1 = __importDefault(require("../../models/reservationPanel/Setting.Model"));
class HallSettingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //=================== Hall Amenities ======================//
    // create Hall Amenities
    createHallAmenities(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { name, description } = req.body;
                // Hall amenities check
                const settingModel = this.Model.settingModel();
                const { data } = yield settingModel.getAllHallAmenities({
                    name: req.body.name,
                    hotel_code,
                });
                if (data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: " Hall Amenities name already exists",
                    };
                }
                // model
                const model = new Setting_Model_1.default(trx);
                yield model.createHallAmenities({
                    hotel_code,
                    name,
                    description,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Hall Amenities created successfully.",
                };
            }));
        });
    }
    // Get All Hall Amenities
    getAllHallAmenities(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, name, description, status } = req.query;
            const model = this.Model.settingModel();
            const { data, total } = yield model.getAllHallAmenities({
                status: status,
                limit: limit,
                skip: skip,
                name: name,
                description: description,
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
    // Update Hall Amenities
    updateHallAmenities(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { id } = req.params;
                const updatePayload = req.body;
                const model = this.Model.settingModel(trx);
                // Hall amenities check
                const settingModel = this.Model.settingModel();
                const { data } = yield settingModel.getAllHallAmenities({
                    name: updatePayload.name,
                    hotel_code,
                    excludeId: parseInt(req.params.id),
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Hall Amenities already exists",
                    };
                }
                yield model.updateHallAmenities(parseInt(id), hotel_code, {
                    name: updatePayload.name,
                    description: updatePayload.description,
                    status: updatePayload.status,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Hall Amenities updated successfully",
                };
            }));
        });
    }
    // Delete Hall Amenities
    deleteHallAmenities(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { id } = req.params;
                const model = this.Model.settingModel(trx);
                yield model.deleteHallAmenities(parseInt(id), hotel_code);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Hall Amenities deleted successfully",
                };
            }));
        });
    }
}
exports.default = HallSettingService;
//# sourceMappingURL=setting.hall.service.js.map