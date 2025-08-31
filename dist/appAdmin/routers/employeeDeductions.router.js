"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const employeeDeductions_controller_1 = __importDefault(require("../controllers/employeeDeductions.controller"));
class EmployeeDeductionsRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new employeeDeductions_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/").post(this.controller.createEmployeeDeduction);
        // .get(this.controller.getAllShifts);
        // this.router
        // 	.route("/shifts/:id")
        // 	.get(this.controller.getSingleShift)
        // 	.patch(this.controller.updateShift)
        // 	.delete(this.controller.deleteShift);
    }
}
exports.default = EmployeeDeductionsRouter;
//# sourceMappingURL=employeeDeductions.router.js.map