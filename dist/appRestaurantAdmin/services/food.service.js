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
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
class RestaurantFoodService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getAllProduct(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.restaurant_admin;
            const { data, total } = yield this.Model.inventoryModel().getAllProduct({
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
    // public async createFood(req: Request) {
    //   return await this.db.transaction(async (trx) => {
    //     const { id, restaurant_id, hotel_code } = req.restaurant_admin;
    //     const food = (req.body as any).food as IFoodRequest;
    //     const ingredients = (req.body as any).ingredients as {
    //       product_id: number;
    //       quantity_per_unit: number;
    //     }[];
    //     const files = (req.files as Express.Multer.File[]) || [];
    //     if (Array.isArray(files)) {
    //       for (const file of files) {
    //         food.photo = file.filename;
    //       }
    //     }
    //     const restaurantMenuCategoryModel =
    //       this.restaurantModel.restaurantCategoryModel(trx);
    //     const restaurantUnitModel = this.restaurantModel.restaurantUnitModel(trx);
    //     const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
    //     const inventoryModel = this.Model.inventoryModel(trx);
    //     const isMenuCategoryExists =
    //       await restaurantMenuCategoryModel.getMenuCategories({
    //         hotel_code,
    //         restaurant_id,
    //         id: food.menu_category_id,
    //       });
    //     if (isMenuCategoryExists.data.length === 0) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_CONFLICT,
    //         message: "Menu Category not found.",
    //       };
    //     }
    //     const isUnitExists = await restaurantUnitModel.getUnits({
    //       hotel_code,
    //       restaurant_id,
    //       id: food.unit_id,
    //     });
    //     if (isUnitExists.data.length === 0) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_CONFLICT,
    //         message: "Unit not found.",
    //       };
    //     }
    //     const newFoodId = await restaurantFoodModel.createFood({
    //       name: food.name,
    //       photo: food.photo,
    //       menu_category_id: food.menu_category_id,
    //       unit_id: food.unit_id,
    //       retail_price: food.retail_price,
    //       measurement_per_unit: food.measurement_per_unit,
    //       hotel_code,
    //       restaurant_id,
    //       created_by: id,
    //     });
    //     for (const ingredient of ingredients) {
    //       const { data: isProductExists } = await inventoryModel.getAllProduct({
    //         hotel_code,
    //         pd_ids: [ingredient.product_id],
    //       });
    //       if (isProductExists.length === 0) {
    //         throw new CustomError(
    //           "Product not found in the inventory.",
    //           this.StatusCode.HTTP_NOT_FOUND
    //         );
    //       }
    //       await restaurantFoodModel.insertFoodIngredients({
    //         food_id: newFoodId[0].id,
    //         product_id: ingredient.product_id,
    //         quantity_per_unit: ingredient.quantity_per_unit,
    //       });
    //     }
    //     return {
    //       success: true,
    //       code: this.StatusCode.HTTP_SUCCESSFUL,
    //       message: "Food created successfully.",
    //     };
    //   });
    // }
    createFoodV2(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, restaurant_id, hotel_code } = req.restaurant_admin;
                const { food, recipe_type, ingredients } = req.body;
                // const ingredients = req.body.ingredients as {
                //   product_id: number;
                //   quantity_per_unit: number;
                // }[];
                const restaurantMenuCategoryModel = this.restaurantModel.restaurantCategoryModel(trx);
                const restaurantUnitModel = this.restaurantModel.restaurantUnitModel(trx);
                const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
                const inventoryModel = this.Model.inventoryModel(trx);
                const files = req.files || [];
                if (Array.isArray(files)) {
                    for (const file of files) {
                        food.photo = file.filename;
                    }
                }
                const isMenuCategoryExists = yield restaurantMenuCategoryModel.getMenuCategories({
                    hotel_code,
                    restaurant_id,
                    id: food.menu_category_id,
                });
                if (!isMenuCategoryExists.data.length) {
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
                if (!isUnitExists.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Unit not found.",
                    };
                }
                if (recipe_type === "non-ingredients") {
                    const newFoodId = yield restaurantFoodModel.createFood({
                        name: food.name,
                        photo: food.photo,
                        menu_category_id: food.menu_category_id,
                        unit_id: food.unit_id,
                        retail_price: food.retail_price,
                        serving_quantity: food.serving_quantity,
                        hotel_code,
                        restaurant_id,
                        created_by: id,
                        recipe_type,
                    });
                }
                else if (recipe_type === "ingredients") {
                    if (!ingredients || ingredients.length === 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Ingredients are required for ingredients recipe type.",
                        };
                    }
                    const newFoodId = yield restaurantFoodModel.createFood({
                        name: food.name,
                        photo: food.photo,
                        menu_category_id: food.menu_category_id,
                        unit_id: food.unit_id,
                        retail_price: food.retail_price,
                        serving_quantity: food.serving_quantity,
                        hotel_code,
                        restaurant_id,
                        created_by: id,
                        recipe_type,
                    });
                    // insert food ingredients
                    const ingredientPayload = [];
                    for (const ingredient of ingredients) {
                        const { data: isProductExists } = yield inventoryModel.getAllProduct({
                            hotel_code,
                            pd_ids: [ingredient.product_id],
                        });
                        if (isProductExists.length === 0) {
                            throw new customEror_1.default("Product not found in the inventory.", this.StatusCode.HTTP_NOT_FOUND);
                        }
                        ingredientPayload.push({
                            food_id: newFoodId[0].id,
                            product_id: ingredient.product_id,
                            quantity_per_unit: ingredient.quantity_per_unit,
                        });
                    }
                    yield restaurantFoodModel.insertFoodIngredients(ingredientPayload);
                }
                else if (recipe_type === "stock") {
                    const checkLinkedProductFromInventory = yield inventoryModel.getSingleInventoryDetails({
                        hotel_code,
                        product_id: food.linked_inventory_item_id,
                    });
                    if (!checkLinkedProductFromInventory) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Linked inventory item not found.",
                        };
                    }
                    yield restaurantFoodModel.createFood({
                        name: food.name,
                        photo: food.photo,
                        menu_category_id: food.menu_category_id,
                        unit_id: food.unit_id,
                        retail_price: food.retail_price,
                        linked_inventory_item_id: food.linked_inventory_item_id,
                        hotel_code,
                        restaurant_id,
                        created_by: id,
                        recipe_type,
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Food created successfully.",
                };
            }));
        });
    }
    insertPreparedFood(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { prepared_food } = req.body;
            const restaurantFoodModel = this.restaurantModel.restaurantFoodModel();
            const insertStockPayload = [];
            for (const item of prepared_food) {
                const foodDetails = yield restaurantFoodModel.getFood({
                    id: item.food_id,
                    hotel_code,
                    restaurant_id,
                });
                if (!foodDetails) {
                    throw new customEror_1.default(`Food with ID ${item.food_id} not found.`, this.StatusCode.HTTP_NOT_FOUND);
                }
                if (foodDetails.recipe_type !== "non-ingredients") {
                    throw new customEror_1.default(`Food with ID ${item.food_id} is not of 'non-ingredients' recipe type.`, this.StatusCode.HTTP_BAD_REQUEST);
                }
                const existInStock = yield restaurantFoodModel.getSingleStockWithFoodAndDate({
                    food_id: item.food_id,
                    hotel_code,
                    restaurant_id,
                    stock_date: new Date().toISOString(),
                });
                if (existInStock) {
                    throw new customEror_1.default(`Stock for Food ID ${item.food_id} already exists for today.`, this.StatusCode.HTTP_CONFLICT);
                }
                insertStockPayload.push({
                    food_id: item.food_id,
                    quantity: item.quantity,
                    hotel_code,
                    restaurant_id,
                    stock_date: new Date().toISOString(),
                    created_by: req.restaurant_admin.id,
                });
            }
            // insert into stock
            yield restaurantFoodModel.insertInStocks(insertStockPayload);
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Prepared food stock inserted successfully.",
            };
        });
    }
    getFoods(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { limit, skip, name, category_id, status, recipe_type } = req.query;
            const data = yield this.restaurantModel.restaurantFoodModel().getFoods({
                hotel_code,
                restaurant_id,
                limit: Number(limit),
                skip: Number(skip),
                name: name,
                menu_category_id: Number(category_id),
                recipe_type: recipe_type,
                status: status,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_OK }, data);
        });
    }
    getFood(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { id } = req.params;
            const data = yield this.restaurantModel.restaurantFoodModel().getFood({
                hotel_code,
                restaurant_id,
                id: Number(id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    // public async updateFood(req: Request) {
    //   return await this.db.transaction(async (trx) => {
    //     const { id } = req.params;
    //     const { restaurant_id, hotel_code } = req.restaurant_admin;
    //     const food = (req.body as any).food as Partial<IFoodRequest>;
    //     const ingredients = (req.body as any).ingredients as
    //       | {
    //           product_id: number;
    //           quantity_per_unit: number;
    //         }[]
    //       | [];
    //     const remove_ingredients = (req.body as any).remove_ingredients as
    //       | number[]
    //       | [];
    //     const files = (req.files as Express.Multer.File[]) || [];
    //     if (Array.isArray(files)) {
    //       for (const file of files) {
    //         food.photo = file.filename;
    //       }
    //     }
    //     console.log(1);
    //     const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
    //     const restaurantCategoryModel =
    //       this.restaurantModel.restaurantCategoryModel(trx);
    //     const restaurantUnitModel = this.restaurantModel.restaurantUnitModel(trx);
    //     const inventoryModel = this.Model.inventoryModel(trx);
    //     const isFoodExists = await restaurantFoodModel.getFood({
    //       id: Number(id),
    //       hotel_code,
    //       restaurant_id,
    //     });
    //     if (!isFoodExists) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_CONFLICT,
    //         message: "Food not found.",
    //       };
    //     }
    //     if (food?.menu_category_id) {
    //       const isMenuCategoryExists =
    //         await restaurantCategoryModel.getMenuCategories({
    //           hotel_code,
    //           restaurant_id,
    //           id: food.menu_category_id,
    //         });
    //       if (isMenuCategoryExists.data.length === 0) {
    //         return {
    //           success: false,
    //           code: this.StatusCode.HTTP_CONFLICT,
    //           message: "Menu Category not found.",
    //         };
    //       }
    //     }
    //     if (food?.unit_id) {
    //       const isUnitExists = await restaurantUnitModel.getUnits({
    //         hotel_code,
    //         restaurant_id,
    //         id: food.unit_id,
    //       });
    //       if (isUnitExists.data.length === 0) {
    //         return {
    //           success: false,
    //           code: this.StatusCode.HTTP_CONFLICT,
    //           message: "Unit not found.",
    //         };
    //       }
    //     }
    //     if (Array.isArray(ingredients) && ingredients.length > 0) {
    //       for (const ingredient of ingredients) {
    //         const isIngredientsExistsInFood =
    //           await restaurantFoodModel.getFoodIngredients({
    //             food_id: isFoodExists.id,
    //             product_id: ingredient.product_id,
    //           });
    //         if (isIngredientsExistsInFood.length > 0) {
    //           await restaurantFoodModel.updateFoodIngredients({
    //             where: {
    //               product_id: ingredient.product_id,
    //               food_id: isFoodExists.id,
    //             },
    //             payload: {
    //               quantity_per_unit: ingredient.quantity_per_unit,
    //             },
    //           });
    //         } else {
    //           const { data: isIngredientsExists } =
    //             await inventoryModel.getAllProduct({
    //               hotel_code,
    //               pd_ids: [ingredient.product_id],
    //             });
    //           if (isIngredientsExists.length === 0) {
    //             throw new CustomError(
    //               "Ingredients not found in inventory",
    //               this.StatusCode.HTTP_NOT_FOUND
    //             );
    //           }
    //           await restaurantFoodModel.insertFoodIngredients({
    //             food_id: isFoodExists.id,
    //             product_id: ingredient.product_id,
    //             quantity_per_unit: ingredient.quantity_per_unit,
    //           });
    //         }
    //       }
    //     }
    //     if (Array.isArray(remove_ingredients) && remove_ingredients.length > 0) {
    //       for (const id of remove_ingredients) {
    //         const isDeleted = await restaurantFoodModel.deleteFoodIngredients({
    //           id: id,
    //           food_id: isFoodExists.id,
    //         });
    //         if (isDeleted === 0) {
    //           throw new CustomError(
    //             "Ingredient not found for this food.",
    //             this.StatusCode.HTTP_BAD_REQUEST
    //           );
    //         }
    //       }
    //     }
    //     if (food) {
    //       await restaurantFoodModel.updateFood({
    //         where: { id: parseInt(id) },
    //         payload: food,
    //       });
    //     }
    //     return {
    //       success: true,
    //       code: this.StatusCode.HTTP_SUCCESSFUL,
    //       message: "Food updated successfully.",
    //     };
    //   });
    // }
    // update food v2 like create food v2
    updateFood(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const { food, recipe_type, ingredients } = req.body;
                const files = req.files || [];
                if (Array.isArray(files)) {
                    for (const file of files) {
                        food.photo = file.filename;
                    }
                }
                const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
                const restaurantCategoryModel = this.restaurantModel.restaurantCategoryModel(trx);
                const restaurantUnitModel = this.restaurantModel.restaurantUnitModel(trx);
                const inventoryModel = this.Model.inventoryModel(trx);
                const isFoodExists = yield restaurantFoodModel.getFood({
                    id: Number(id),
                    hotel_code,
                    restaurant_id,
                });
                if (!isFoodExists) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Food not found.",
                    };
                }
                if (food === null || food === void 0 ? void 0 : food.menu_category_id) {
                    const isMenuCategoryExists = yield restaurantCategoryModel.getMenuCategories({
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
                }
                if (food === null || food === void 0 ? void 0 : food.unit_id) {
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
                }
                yield restaurantFoodModel.updateFood({
                    where: { id: parseInt(id) },
                    payload: Object.assign(Object.assign({}, food), { recipe_type }),
                });
                // handle ingredients if recipe_type is ingredients
                if (recipe_type === "ingredients" && Array.isArray(ingredients)) {
                    // first delete existing ingredients
                    yield restaurantFoodModel.deleteFoodIngredientsByFood({
                        food_id: isFoodExists.id,
                        hotel_code,
                    });
                    // insert new ingredients
                    for (const ingredient of ingredients) {
                        const { data: isIngredientsExists } = yield inventoryModel.getAllProduct({
                            hotel_code,
                            pd_ids: [ingredient.product_id],
                        });
                        if (isIngredientsExists.length === 0) {
                            throw new customEror_1.default("Ingredients not found in inventory", this.StatusCode.HTTP_NOT_FOUND);
                        }
                        yield restaurantFoodModel.insertFoodIngredients({
                            food_id: isFoodExists.id,
                            product_id: ingredient.product_id,
                            quantity_per_unit: ingredient.quantity_per_unit,
                        });
                    }
                }
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
    getFoodStocks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, restaurant_id } = req.restaurant_admin;
            const data = yield this.restaurantModel.restaurantFoodModel().getStocks({
                hotel_code,
                restaurant_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
}
exports.default = RestaurantFoodService;
//# sourceMappingURL=food.service.js.map