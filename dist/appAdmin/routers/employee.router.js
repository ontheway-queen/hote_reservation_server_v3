"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const employee_controller_1 = __importDefault(require("../controllers/employee.controller"));
class EmployeeRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new employee_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_EMPLOYEE_FILES), this.controller.createEmployee)
            .get(this.controller.getAllEmployee);
        this.router
            .route("/:id")
            .get(this.controller.getSingleEmployee)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_EMPLOYEE_FILES), this.controller.updateEmployee)
            .delete(this.controller.deleteEmployee);
        this.router
            .route("/by-department/:id")
            .get(this.controller.getEmployeesByDepartmentId);
    }
}
exports.default = EmployeeRouter;
//# sourceMappingURL=employee.router.js.map