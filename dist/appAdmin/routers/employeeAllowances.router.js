"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const employeeAllowances_controller_1 = __importDefault(require("../controllers/employeeAllowances.controller"));
class EmployeeAllowanceRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new employeeAllowances_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/").post(this.controller.createEmployeeAllowance);
        // .get(this.controller.getAllShifts);
        // this.router
        // 	.route("/shifts/:id")
        // 	.get(this.controller.getSingleShift)
        // 	.patch(this.controller.updateShift)
        // 	.delete(this.controller.deleteShift);
    }
}
exports.default = EmployeeAllowanceRouter;
//# sourceMappingURL=employeeAllowances.router.js.map