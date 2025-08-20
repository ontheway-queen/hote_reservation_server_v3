"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class StockInvValidator {
    constructor() {
        // create Stock
        this.createstockInvValidator = joi_1.default.object({
            stock_in: joi_1.default.number().allow("").optional(),
            stock_out: joi_1.default.number().allow("").optional(),
            ac_tr_ac_id: joi_1.default.number().allow("").optional(),
            paid_amount: joi_1.default.number().allow("").optional(),
            note: joi_1.default.string().allow("").optional(),
            stock_items: joi_1.default.array()
                .items(joi_1.default.object({
                product_id: joi_1.default.number().required(),
                quantity: joi_1.default.number().required(),
            }))
                .required(),
        });
        // get all Stock
        this.getAllStockInvValidator = joi_1.default.object({
            key: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
        });
    }
}
exports.default = StockInvValidator;
//# sourceMappingURL=stock.validator.js.map