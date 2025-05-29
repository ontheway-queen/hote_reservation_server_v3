"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_controller_1 = __importDefault(require("../../abstarcts/abstract.controller"));
const money_reciept_service_1 = __importDefault(require("../services/money-reciept.service"));
const money_reciept_validator_1 = __importDefault(require("../utlis/validator/money-reciept.validator"));
class MoneyRecieptController extends abstract_controller_1.default {
    constructor() {
        super();
        this.moneyRecieptService = new money_reciept_service_1.default();
        this.moneyRecieptValidator = new money_reciept_validator_1.default();
    }
}
exports.default = MoneyRecieptController;
//# sourceMappingURL=money-reciept.controller.js.map