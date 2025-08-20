"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolioValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class FolioValidator {
    constructor() {
        this.createFolio = joi_1.default.object({
            booking_id: joi_1.default.number().required(),
            name: joi_1.default.string().required(),
        });
        this.splitMasterFolio = joi_1.default.object({
            booking_id: joi_1.default.number().required(),
            from_folio_id: joi_1.default.number().required(),
            to_folio_ids: joi_1.default.array().items(joi_1.default.number().required()),
            amount: joi_1.default.number().required(),
        });
    }
}
exports.FolioValidator = FolioValidator;
//# sourceMappingURL=folio.validator.js.map