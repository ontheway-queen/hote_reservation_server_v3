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
class RestaurantTableService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createTable(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, restaurant_id, hotel_code } = req.restaurant_admin;
                const body = req.body;
                const restaurantTableModel = this.restaurantModel.restaurantTableModel(trx);
                const isTableExists = yield restaurantTableModel.getTables({
                    hotel_code,
                    restaurant_id,
                    name: body.name,
                });
                if (isTableExists.data.length > 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Table already exists.",
                    };
                }
                yield restaurantTableModel.createTable(Object.assign(Object.assign({}, body), { hotel_code, created_by: id, restaurant_id }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Table created successfully.",
                };
            }));
        });
    }
    getTables(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { limit, skip, name, status } = req.query;
            const data = yield this.restaurantModel.restaurantTableModel().getTables({
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
    updateTable(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { id: user_id, restaurant_id, hotel_code } = req.restaurant_admin;
                const body = req.body;
                const restaurantModel = this.restaurantModel.restaurantTableModel(trx);
                const isTableExists = yield restaurantModel.getTables({
                    hotel_code,
                    restaurant_id,
                    id: parseInt(id),
                });
                if (isTableExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Table not found.",
                    };
                }
                if (body.name) {
                    const { data } = yield restaurantModel.getTables({
                        name: body.name,
                        hotel_code,
                        restaurant_id,
                    });
                    if (data.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Table name already exists",
                        };
                    }
                }
                yield restaurantModel.updateTable({
                    id: Number(id),
                    payload: Object.assign(Object.assign({}, body), { updated_by: user_id }),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Table updated successfully.",
                };
            }));
        });
    }
    deleteTable(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const restaurantModel = this.restaurantModel.restaurantTableModel(trx);
                const isTableExists = yield restaurantModel.getTables({
                    hotel_code,
                    restaurant_id,
                    id: parseInt(id),
                });
                if (isTableExists.data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Table not found.",
                    };
                }
                const table = isTableExists.data[0];
                if (table.status === "booked") {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Table is boooked.",
                    };
                }
                yield restaurantModel.deleteTable({
                    id: Number(id),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Table deleted successfully.",
                };
            }));
        });
    }
}
exports.default = RestaurantTableService;
//# sourceMappingURL=restaurantTable.service.js.map