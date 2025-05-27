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
exports.SettingRootService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class SettingRootService extends abstract_service_1.default {
    constructor() {
        super();
    }
    insertAccomodation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const _a = req.body, { child_age_policies, has_child_rates } = _a, rest = __rest(_a, ["child_age_policies", "has_child_rates"]);
                const model = this.Model.settingModel(trx);
                // get accomodation
                const getAccomodation = yield model.getAccomodation(hotel_code);
                if (getAccomodation.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.HTTP_CONFLICT,
                    };
                }
                // insert in accomodation
                const res = yield model.insertAccomodationSetting(Object.assign(Object.assign({}, rest), { hotel_code,
                    has_child_rates }));
                // insert in child age policies
                if (has_child_rates && child_age_policies) {
                    const payload = child_age_policies.map((item) => {
                        return {
                            hotel_code,
                            age_from: item.age_from,
                            age_to: item.age_to,
                            charge_type: item.charge_type,
                            acs_id: res[0].id,
                        };
                    });
                    yield model.insertChildAgePolicies(payload);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
    getAccomodation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const getAccomodation = yield this.Model.settingModel().getAccomodation(hotel_code);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: getAccomodation.length ? getAccomodation[0] : {},
                };
            }));
        });
    }
    updateAccomodation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const _a = req.body, { add_child_age_policies, has_child_rates, remove_child_age_policies } = _a, rest = __rest(_a, ["add_child_age_policies", "has_child_rates", "remove_child_age_policies"]);
                const model = this.Model.settingModel(trx);
                // get accomodation
                const getAccomodation = yield model.getAccomodation(hotel_code);
                if (!getAccomodation.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield model.updateAccomodationSetting(hotel_code, Object.assign(Object.assign({}, rest), { has_child_rates }));
                // insert in child age policies
                if (has_child_rates && add_child_age_policies) {
                    const payload = add_child_age_policies.map((item) => {
                        return {
                            hotel_code,
                            age_from: item.age_from,
                            age_to: item.age_to,
                            charge_type: item.charge_type,
                            acs_id: getAccomodation[0].id,
                        };
                    });
                    yield model.insertChildAgePolicies(payload);
                }
                if (remove_child_age_policies) {
                    yield model.deleteChildAgePolicies(hotel_code, remove_child_age_policies);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    insertCancellationPolicy(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { policy_name, description, rules } = req.body;
                const model = this.Model.settingModel(trx);
                // get cancellation policy
                const getCancellationPolicy = yield model.getAllCancellationPolicy({
                    hotel_code,
                    search: policy_name,
                });
                if (getCancellationPolicy.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.HTTP_CONFLICT,
                    };
                }
                // insert in accomodation
                const res = yield model.insertCancellationPolicy({
                    policy_name,
                    hotel_code,
                    description,
                });
                const payload = rules.map((item) => {
                    return Object.assign({ cancellation_policy_id: res[0].id }, item);
                });
                yield model.insertCancellationPolicyRules(payload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    getAllCancellationPolicy(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const data = yield this.Model.settingModel().getAllCancellationPolicy({
                    hotel_code,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    data: data,
                };
            }));
        });
    }
    getSingleCancellationPolicy(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const data = yield this.Model.settingModel().getSingleCancellationPolicy(hotel_code, parseInt(req.params.id));
                if (!data.length) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: data[0],
                };
            }));
        });
    }
    updateCancellationPolicy(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { policy_name, description, add_rules, remove_rules } = req.body;
                const model = this.Model.settingModel(trx);
                if (policy_name) {
                    // get cancellation policy
                    const getCancellationPolicy = yield model.getAllCancellationPolicy({
                        hotel_code,
                        search: policy_name,
                    });
                    if (getCancellationPolicy.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: this.ResMsg.HTTP_CONFLICT,
                        };
                    }
                }
                if (policy_name || description) {
                    yield model.updateCancellationPolicy(hotel_code, parseInt(req.params.id), {
                        policy_name,
                        description,
                    });
                }
                if (add_rules) {
                    const payload = add_rules.map((item) => {
                        return Object.assign({ cancellation_policy_id: parseInt(req.params.id) }, item);
                    });
                    yield model.insertCancellationPolicyRules(payload);
                }
                if (remove_rules === null || remove_rules === void 0 ? void 0 : remove_rules.length) {
                    yield model.deleteCancellationPolicyRules(parseInt(req.params.id), remove_rules);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    deleteSingleCancellationPolicy(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const data = yield this.Model.settingModel().getSingleCancellationPolicy(hotel_code, parseInt(req.params.id));
                if (!data.length) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield this.Model.settingModel().updateCancellationPolicy(hotel_code, parseInt(req.params.id), {
                    is_deleted: true,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: data[0],
                };
            }));
        });
    }
    getAllMealPlan(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.settingModel().getAllMealPlan({});
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getAllMealItems(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.settingModel(trx);
                const mealInfo = yield model.getMealOptions(req.hotel_admin.hotel_code);
                const mealItems = yield model.getAllMealItems({});
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: {
                        is_possible_book_meal_opt_with_room: mealInfo
                            ? mealInfo.is_possible_book_meal_opt_with_room
                            : false,
                        mealItems,
                    },
                };
            }));
        });
    }
    insertMealOptions(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { is_possible_book_meal_opt_with_room, add_meal_items, remove_meal_items, update_meal_items, } = req.body;
                console.log(add_meal_items);
                const model = this.Model.settingModel(trx);
                // Retrieve current meal options and existing meal items
                const existingMealOption = yield model.getMealOptions(hotel_code);
                const existingMealItems = yield model.getAllMealItems({ hotel_code });
                // Handle meal item insertion if no existing items and new items are provided
                if (!existingMealItems.length && (add_meal_items === null || add_meal_items === void 0 ? void 0 : add_meal_items.length)) {
                    const newMealPlanIds = add_meal_items.map((item) => item.meal_plan_id);
                    const mealPlans = yield model.getAllMealPlan({ ids: newMealPlanIds });
                    if (mealPlans.length !== newMealPlanIds.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Invalid meal plans provided.",
                        };
                    }
                    const newItemsPayload = add_meal_items.map((item) => (Object.assign({ hotel_code }, item)));
                    console.log({ newItemsPayload });
                    yield model.insertMealItems(newItemsPayload);
                }
                else if (existingMealItems.length && (add_meal_items === null || add_meal_items === void 0 ? void 0 : add_meal_items.length)) {
                    const newMealPlanIds = add_meal_items.map((item) => item.meal_plan_id);
                    const mealPlans = yield model.getAllMealPlan({ ids: newMealPlanIds });
                    if (mealPlans.length !== newMealPlanIds.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Invalid meal plans provided.",
                        };
                    }
                    const newItemsPayload = add_meal_items.map((item) => (Object.assign({ hotel_code }, item)));
                    console.log({ newItemsPayload });
                    yield model.insertMealItems(newItemsPayload);
                }
                // Insert or update meal option flag
                if (!existingMealOption) {
                    yield model.insertMealsOptions({
                        hotel_code,
                        is_possible_book_meal_opt_with_room,
                    });
                }
                else if (typeof is_possible_book_meal_opt_with_room === "boolean") {
                    yield model.updateMealOption(hotel_code, {
                        is_possible_book_meal_opt_with_room,
                    });
                }
                // Handle meal item updates
                if (Array.isArray(update_meal_items) && update_meal_items.length > 0) {
                    yield Promise.all(update_meal_items.map((item) => {
                        const { meal_plan_id, price, vat } = item;
                        return model.updateMealItems({ price, vat }, hotel_code, [
                            meal_plan_id,
                        ]);
                    }));
                }
                // Handle meal item soft-deletion
                if (Array.isArray(remove_meal_items) && remove_meal_items.length > 0) {
                    yield model.updateMealItems({ is_deleted: true }, hotel_code, remove_meal_items);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    getAllSources(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const data = yield this.Model.settingModel().getAllSources({});
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    data,
                };
            }));
        });
    }
    getChildAgePolicies(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.settingModel().getChildAgePolicies(req.hotel_admin.hotel_code);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data ? data : {},
            };
        });
    }
}
exports.SettingRootService = SettingRootService;
//# sourceMappingURL=setting.root.service.js.map