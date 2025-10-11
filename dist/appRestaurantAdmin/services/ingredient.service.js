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
class RestaurantIngredientService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createMeasurement(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, restaurant_id, hotel_code } = req.restaurant_admin;
                const body = req.body;
                const restaurantModel = this.Model.restaurantModel(trx);
                const isMeasurementExists = yield restaurantModel.getMeasurements({
                    hotel_code,
                    restaurant_id,
                    id: body.measurement_id,
                });
                if (isMeasurementExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Measurement not found.",
                    };
                }
                yield restaurantModel.createIngredient(Object.assign(Object.assign({}, body), { hotel_code,
                    restaurant_id, created_by: id }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Ingredient created successfully.",
                };
            }));
        });
    }
    getIngredients(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { limit, skip, name } = req.query;
            const data = yield this.Model.restaurantModel().getIngredients({
                hotel_code,
                restaurant_id,
                limit: Number(limit),
                skip: Number(skip),
                name: name,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_OK }, data);
        });
    }
    updateIngredient(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const body = req.body;
                const restaurantModel = this.Model.restaurantModel(trx);
                const isIngredientExists = yield restaurantModel.getIngredients({
                    id: parseInt(id),
                    hotel_code,
                    restaurant_id,
                });
                if (isIngredientExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Ingredient not found.",
                    };
                }
                if (body.measurement_id) {
                    const isMeasurementExists = yield restaurantModel.getMeasurements({
                        hotel_code,
                        restaurant_id,
                        id: body.measurement_id,
                    });
                    if (isMeasurementExists.data.length === 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Measurement not found.",
                        };
                    }
                }
                yield restaurantModel.updateIngredient({
                    id: Number(id),
                    payload: body,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Ingredient updated successfully.",
                };
            }));
        });
    }
    deleteIngredient(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const restaurantModel = this.Model.restaurantModel(trx);
                const isIngredientExists = yield restaurantModel.getIngredients({
                    id: parseInt(id),
                    hotel_code,
                    restaurant_id,
                });
                if (isIngredientExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Ingredient not found.",
                    };
                }
                yield restaurantModel.deleteIngredient({
                    id: Number(id),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Ingredient deleted successfully.",
                };
            }));
        });
    }
}
exports.default = RestaurantIngredientService;
//# sourceMappingURL=ingredient.service.js.map