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
class RoomRatesService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Get all room rate
    createRoomRate(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { cancellation_policy_id, meal_plan_items, room_type_prices, sources, name, } = req.body;
                console.log(meal_plan_items);
                const settingModel = this.Model.settingModel(trx);
                // Validate meal plan items
                const checkMealItems = yield settingModel.getAllMealPlan({
                    ids: meal_plan_items,
                });
                if (meal_plan_items.length !== checkMealItems.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid meal plan items",
                    };
                }
                // Validate sources
                const checkSources = yield settingModel.getAllSources({
                    ids: sources,
                });
                if (checkSources.length !== sources.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid Sources",
                    };
                }
                // Validate cancellation policy
                const cancellationPolicyData = yield settingModel.getSingleCancellationPolicy(hotel_code, cancellation_policy_id);
                if (!cancellationPolicyData.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Invalid cancellation policy",
                    };
                }
                // Validate room types
                const room_type_ids = room_type_prices.map((item) => item.room_type_id);
                const { data: check_room_types } = yield settingModel.getAllRoomType({
                    ids: room_type_ids,
                    is_active: "true",
                    hotel_code,
                });
                if (room_type_ids.length !== check_room_types.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid room types",
                    };
                }
                // Insert rate plan
                const ratePlanRes = yield settingModel.insertInRatePlans({
                    hotel_code,
                    cancellation_policy_id,
                    name,
                });
                const ratePlanDetailsPayload = [];
                room_type_prices.forEach((item) => {
                    ratePlanDetailsPayload.push({
                        hotel_code,
                        base_rate: item.base_rate,
                        rate_plan_id: ratePlanRes[0].id,
                        room_type_id: item.room_type_id,
                    });
                });
                // Insert rate plan details (base pricing) for each room type.
                yield settingModel.insertInRatePlanDetails(ratePlanDetailsPayload);
                // Prepare meal mappings
                const mealMappingPayload = meal_plan_items.map((item) => ({
                    rate_plan_id: ratePlanRes[0].id,
                    meal_plan_id: item,
                    included: true,
                }));
                yield settingModel.insertInRatePlanMealMapping(mealMappingPayload);
                // Prepare source mappings
                const sourcePayload = sources.map((item) => ({
                    rate_plan_id: ratePlanRes[0].id,
                    source_id: item,
                }));
                yield settingModel.insertInRatePlanSourceMapping(sourcePayload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Room rates created successfully.",
                };
            }));
        });
    }
    getAllRoomRate(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, search, status } = req.query;
            const { data, total } = yield this.Model.settingModel().getAllRoomRate({
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
    getSingleRoomRate(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const raw = yield this.Model.settingModel().getSingleRoomRate(hotel_code, parseInt(req.params.id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign({}, raw),
            };
        });
    }
    updateRoomRate(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const rate_plan_id = Number(req.params.id);
                const { cancellation_policy_id, meal_plan_items, room_type_prices, sources, name, } = req.body;
                const settingModel = this.Model.settingModel(trx);
                // Validate meal plan items
                const checkMealItems = yield settingModel.getAllMealPlan({
                    ids: meal_plan_items,
                });
                if (meal_plan_items.length !== checkMealItems.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid meal plan items",
                    };
                }
                // Validate sources
                const checkSources = yield settingModel.getAllSources({
                    ids: sources,
                });
                if (checkSources.length !== sources.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid sources",
                    };
                }
                // Validate cancellation policy
                const cancellationPolicyData = yield settingModel.getSingleCancellationPolicy(hotel_code, cancellation_policy_id);
                if (!cancellationPolicyData.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Invalid cancellation policy",
                    };
                }
                // Validate room types
                const room_type_ids = room_type_prices.map((item) => item.room_type_id);
                const { data: check_room_types } = yield settingModel.getAllRoomType({
                    ids: room_type_ids,
                    is_active: "true",
                    hotel_code,
                });
                if (room_type_ids.length !== check_room_types.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid room types",
                    };
                }
                // update rate plan
                yield settingModel.updateInRatePlans({ name, cancellation_policy_id }, rate_plan_id, hotel_code);
                // delete meal mapping
                yield settingModel.deleteInRatePlanMealMapping(rate_plan_id);
                //  insert new meal mapping
                const mealMappingPayload = meal_plan_items.map((item) => ({
                    rate_plan_id,
                    meal_plan_id: item,
                    included: true,
                }));
                if (mealMappingPayload.length) {
                    yield settingModel.insertInRatePlanMealMapping(mealMappingPayload);
                }
                //delete  source mapping
                yield settingModel.deleteInRatePlanSourceMapping(rate_plan_id);
                const sourcePayload = sources.map((item) => ({
                    rate_plan_id,
                    source_id: item,
                }));
                if (sourcePayload.length) {
                    yield settingModel.insertInRatePlanSourceMapping(sourcePayload);
                }
                const ratePlanDetailsPayload = [];
                room_type_prices.forEach((item) => {
                    // Insert base/default pricing for each room type in this rate plan:
                    ratePlanDetailsPayload.push({
                        hotel_code,
                        base_rate: item.base_rate,
                        rate_plan_id,
                        room_type_id: item.room_type_id,
                    });
                });
                // delete rate plan details
                yield settingModel.deleteInRatePlanDetails(rate_plan_id);
                // Insert new rate plan details
                if (ratePlanDetailsPayload.length) {
                    yield settingModel.insertInRatePlanDetails(ratePlanDetailsPayload);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Room rate updated successfully.",
                };
            }));
        });
    }
}
exports.default = RoomRatesService;
//# sourceMappingURL=setting.room_rates.service.js.map