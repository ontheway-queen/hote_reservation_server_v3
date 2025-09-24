"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class PurchaseInvValidator {
    constructor() {
        // create purchase
        this.createPurchaseInvValidator = joi_1.default.object({
            supplier_id: joi_1.default.number().required(),
            purchase_date: joi_1.default.date().required(),
            ac_tr_ac_id: joi_1.default.number().required(),
            vat: joi_1.default.number().allow("").optional(),
            shipping_cost: joi_1.default.number().allow("").optional(),
            discount_amount: joi_1.default.number().allow("").optional(),
            paid_amount: joi_1.default.number().allow("").optional(),
            purchase_items: joi_1.default.array()
                .items(joi_1.default.object({
                product_id: joi_1.default.number().required(),
                product_name: joi_1.default.string().required(),
                quantity: joi_1.default.number().required(),
                price: joi_1.default.number().required(),
            }))
                .required(),
        });
        // get all purchase
        this.getAllPurchaseInvValidator = joi_1.default.object({
            key: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            supplier_id: joi_1.default.number().allow("").optional(),
            due: joi_1.default.number().allow("").optional(),
        });
    }
}
exports.default = PurchaseInvValidator;
//# sourceMappingURL=purchase.validator.js.map