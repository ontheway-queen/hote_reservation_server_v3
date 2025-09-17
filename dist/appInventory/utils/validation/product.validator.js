"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class ProductInvValidator {
    constructor() {
        // create product
        this.createProductInvValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            model: joi_1.default.string().allow("").optional(),
            category_id: joi_1.default.number().required(),
            unit_id: joi_1.default.number().required(),
            brand_id: joi_1.default.number().allow("").optional(),
            details: joi_1.default.string().allow("").optional(),
            image: joi_1.default.string().allow("").optional(),
        });
        // get all product
        this.getAllProductInvValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            key: joi_1.default.string().allow("").optional(),
            brand: joi_1.default.string().allow("").optional(),
            in_stock: joi_1.default.string().allow("").optional(),
            unit: joi_1.default.string().allow("").optional(),
            category: joi_1.default.string().allow("").optional(),
        });
        // update product
        this.updateProductInvValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").optional(),
            model: joi_1.default.string().allow("").optional(),
            category_id: joi_1.default.number().allow("").optional(),
            unit_id: joi_1.default.number().allow("").optional(),
            brand_id: joi_1.default.number().allow("").optional(),
            details: joi_1.default.string().allow("").optional(),
            in_stock: joi_1.default.number().allow("").optional(),
            image: joi_1.default.string().allow("").optional(),
        });
        // create Damaged Product
        this.createDamagedProductValidator = joi_1.default.object({
            date: joi_1.default.date().allow("").optional(),
            damaged_items: joi_1.default.array()
                .items(joi_1.default.object({
                product_id: joi_1.default.number().required(),
                quantity: joi_1.default.number().required(),
                note: joi_1.default.string().allow("").optional(),
            }))
                .required(),
        });
        // get all Damaged Product
        this.getAllDamagedProductValidator = joi_1.default.object({
            key: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            date_from: joi_1.default.date().allow("").optional(),
        });
    }
}
exports.default = ProductInvValidator;
//# sourceMappingURL=product.validator.js.map