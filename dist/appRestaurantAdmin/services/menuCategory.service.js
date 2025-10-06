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
class RestaurantMenuCategoryService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createMenuCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, restaurant_id, hotel_code } = req.restaurant_admin;
                const body = req.body;
                const restaurantMenuCategoryModel = this.restaurantModel.restaurantCategoryModel(trx);
                const isCategoryExists = yield restaurantMenuCategoryModel.getMenuCategories({
                    hotel_code,
                    restaurant_id,
                    name: body.name,
                });
                if (isCategoryExists.data.length > 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Menu Category already exists.",
                    };
                }
                yield restaurantMenuCategoryModel.createMenuCategory(Object.assign(Object.assign({}, body), { hotel_code, created_by: id, restaurant_id }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Menu Category created successfully.",
                };
            }));
        });
    }
    getMenuCategories(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { limit, skip, name, status } = req.query;
            const data = yield this.restaurantModel
                .restaurantCategoryModel()
                .getMenuCategories({
                hotel_code,
                restaurant_id,
                limit: Number(limit),
                skip: Number(skip),
                name: name,
                status: status,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_SUCCESSFUL }, data);
        });
    }
    updateMenuCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const body = req.body;
                const restaurantMenuCategoryModel = this.restaurantModel.restaurantCategoryModel(trx);
                const isCategoryExists = yield restaurantMenuCategoryModel.getMenuCategories({
                    id: parseInt(id),
                    hotel_code,
                    restaurant_id,
                });
                if (isCategoryExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Menu Category not found.",
                    };
                }
                const newCategory = yield restaurantMenuCategoryModel.updateMenuCategory({
                    id: parseInt(id),
                    payload: body,
                });
                if (!newCategory) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Menu Category not found.",
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Menu Category updated successfully.",
                };
            }));
        });
    }
    deleteMenuCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const restaurantMenuCategoryModel = this.restaurantModel.restaurantCategoryModel(trx);
                const isCategoryExists = yield restaurantMenuCategoryModel.getMenuCategories({
                    id: parseInt(id),
                    hotel_code,
                    restaurant_id,
                });
                if (isCategoryExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Menu Category not found.",
                    };
                }
                const newCategory = yield restaurantMenuCategoryModel.deleteMenuCategory({
                    id: parseInt(id),
                });
                if (!newCategory) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Menu Category not found.",
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Menu Category deleted successfully.",
                };
            }));
        });
    }
}
exports.default = RestaurantMenuCategoryService;
//# sourceMappingURL=menuCategory.service.js.map