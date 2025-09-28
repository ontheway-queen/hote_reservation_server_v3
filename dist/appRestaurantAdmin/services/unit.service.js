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
class RestaurantUnitService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createUnit(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, restaurant_id, hotel_code } = req.restaurant_admin;
                const body = req.body;
                const restaurantModel = this.Model.restaurantModel(trx);
                yield restaurantModel.createUnit(Object.assign(Object.assign({}, body), { hotel_code,
                    restaurant_id, created_by: id }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Unit created successfully.",
                };
            }));
        });
    }
    getUnits(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { limit, skip, name } = req.query;
            const data = yield this.Model.restaurantModel().getUnits({
                hotel_code,
                restaurant_id,
                limit: Number(limit),
                skip: Number(skip),
                name: name,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_SUCCESSFUL }, data);
        });
    }
    updateUnit(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const body = req.body;
                const restaurantModel = this.Model.restaurantModel(trx);
                const isUnitExists = yield restaurantModel.getUnits({
                    hotel_code,
                    restaurant_id,
                    id: parseInt(id),
                });
                if (isUnitExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Unit not found.",
                    };
                }
                yield restaurantModel.updateUnit({
                    id: parseInt(id),
                    payload: body,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Unit updated successfully.",
                };
            }));
        });
    }
    deleteUnit(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const restaurantModel = this.Model.restaurantModel(trx);
                const isUnitExists = yield restaurantModel.getUnits({
                    hotel_code,
                    restaurant_id,
                    id: parseInt(id),
                });
                if (isUnitExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Unit not found.",
                    };
                }
                yield restaurantModel.deleteUnit({
                    id: parseInt(id),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Unit deleted successfully.",
                };
            }));
        });
    }
}
exports.default = RestaurantUnitService;
//# sourceMappingURL=unit.service.js.map