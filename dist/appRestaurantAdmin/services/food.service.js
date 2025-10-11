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
class RestaurantFoodService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createFood(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, restaurant_id, hotel_code } = req.restaurant_admin;
                const food = req.body.food;
                const files = req.files || [];
                if (Array.isArray(files)) {
                    for (const file of files) {
                        food.photo = file.filename;
                    }
                }
                const restaurantMenuCategoryModel = this.restaurantModel.restaurantCategoryModel(trx);
                const restaurantUnitModel = this.restaurantModel.restaurantUnitModel(trx);
                const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
                const isMenuCategoryExists = yield restaurantMenuCategoryModel.getMenuCategories({
                    hotel_code,
                    restaurant_id,
                    id: food.menu_category_id,
                });
                if (isMenuCategoryExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Menu Category not found.",
                    };
                }
                const isUnitExists = yield restaurantUnitModel.getUnits({
                    hotel_code,
                    restaurant_id,
                    id: food.unit_id,
                });
                if (isUnitExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Unit not found.",
                    };
                }
                yield restaurantFoodModel.createFood(Object.assign(Object.assign({}, food), { hotel_code,
                    restaurant_id, created_by: id }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Food created successfully.",
                };
            }));
        });
    }
    getFoods(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { limit, skip, name, category_id } = req.query;
            const data = yield this.restaurantModel.restaurantFoodModel().getFoods({
                hotel_code,
                restaurant_id,
                limit: Number(limit),
                skip: Number(skip),
                name: name,
                menu_category_id: Number(category_id),
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_OK }, data);
        });
    }
    updateFood(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const body = req.body.food;
                const files = req.files || [];
                if (Array.isArray(files)) {
                    for (const file of files) {
                        body.photo = file.filename;
                    }
                }
                const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
                const restaurantCategoryModel = this.restaurantModel.restaurantCategoryModel(trx);
                const restaurantUnitModel = this.restaurantModel.restaurantUnitModel(trx);
                const isFoodExists = yield restaurantFoodModel.getFoods({
                    id: parseInt(id),
                    hotel_code,
                    restaurant_id,
                });
                if (isFoodExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Food not found.",
                    };
                }
                if (body.menu_category_id) {
                    const isMenuCategoryExists = yield restaurantCategoryModel.getMenuCategories({
                        hotel_code,
                        restaurant_id,
                        id: body.menu_category_id,
                    });
                    if (isMenuCategoryExists.data.length === 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Menu Category not found.",
                        };
                    }
                }
                if (body.unit_id) {
                    const isUnitExists = yield restaurantUnitModel.getUnits({
                        hotel_code,
                        restaurant_id,
                        id: body.unit_id,
                    });
                    if (isUnitExists.data.length === 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Unit not found.",
                        };
                    }
                }
                yield restaurantFoodModel.updateFood({
                    where: { id: parseInt(id) },
                    payload: body,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Food updated successfully.",
                };
            }));
        });
    }
    deleteFood(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
                const isFoodExists = yield restaurantFoodModel.getFoods({
                    id: parseInt(id),
                    hotel_code,
                    restaurant_id,
                });
                if (isFoodExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Food not found.",
                    };
                }
                yield restaurantFoodModel.deleteFood({
                    id: Number(id),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Food deleted successfully.",
                };
            }));
        });
    }
}
exports.default = RestaurantFoodService;
//# sourceMappingURL=food.service.js.map