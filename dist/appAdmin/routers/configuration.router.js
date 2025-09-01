"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const hr_configuration_controller_1 = __importDefault(require("../controllers/hr.configuration.controller"));
class HRConfigurationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new hr_configuration_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // Shifts
        this.router
            .route("/shifts")
            .post(this.controller.createShift)
            .get(this.controller.getAllShifts);
        this.router
            .route("/shifts/:id")
            .get(this.controller.getSingleShift)
            .patch(this.controller.updateShift)
            .delete(this.controller.deleteShift);
        // Allowances
        this.router
            .route("/allowances")
            .post(this.controller.createAllowances)
            .get(this.controller.getAllAllowances);
        this.router
            .route("/allowances/:id")
            .get(this.controller.getSingleAllowance)
            .patch(this.controller.updateAllowance)
            .delete(this.controller.deleteAllowance);
        // Deductions
        this.router
            .route("/deductions")
            .post(this.controller.createDeductions)
            .get(this.controller.getAllDeductions);
        this.router
            .route("/deductions/:id")
            .get(this.controller.getSingleDeduction)
            .patch(this.controller.updateDeduction)
            .delete(this.controller.deleteDeduction);
    }
}
exports.default = HRConfigurationRouter;
//# sourceMappingURL=configuration.router.js.map