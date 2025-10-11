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
class RestaurantMeasurementService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createMeasurement(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, restaurant_id, hotel_code } = req.restaurant_admin;
                const body = req.body;
                const restaurantModel = this.Model.restaurantModel(trx);
                yield restaurantModel.createMeasurement(Object.assign(Object.assign({}, body), { hotel_code,
                    restaurant_id, created_by: id }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Measurement created successfully.",
                };
            }));
        });
    }
    getMeasurements(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { limit, skip, name } = req.query;
            const data = yield this.Model.restaurantModel().getMeasurements({
                hotel_code,
                restaurant_id,
                limit: Number(limit),
                skip: Number(skip),
                name: name,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_SUCCESSFUL }, data);
        });
    }
    updateMeasurement(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const body = req.body;
                const restaurantModel = this.Model.restaurantModel(trx);
                const isMeasurementExists = yield restaurantModel.getMeasurements({
                    hotel_code,
                    restaurant_id,
                    id: parseInt(id),
                });
                if (isMeasurementExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Measurement not found.",
                    };
                }
                const newMeasurement = yield restaurantModel.updateMeasurement({
                    id: parseInt(id),
                    payload: body,
                });
                if (!newMeasurement) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Failed to update measurement.",
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Measurement updated successfully.",
                };
            }));
        });
    }
    deleteMeasurement(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const restaurantModel = this.Model.restaurantModel(trx);
                const isMeasurementExists = yield restaurantModel.getMeasurements({
                    hotel_code,
                    restaurant_id,
                    id: parseInt(id),
                });
                if (isMeasurementExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Measurement not found.",
                    };
                }
                const newMeasurement = yield restaurantModel.deleteMeasurement({
                    id: parseInt(id),
                });
                if (!newMeasurement) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Failed to delete measurement.",
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Measurement deleted successfully.",
                };
            }));
        });
    }
}
exports.default = RestaurantMeasurementService;
//# sourceMappingURL=measurement.service.js.map