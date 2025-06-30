"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const administration_controller_1 = __importDefault(require("../controllers/administration.controller"));
class AdministrationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.administratonController = new administration_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/permission")
            .get(this.administratonController.getAllPermission);
        this.router
            .route("/role")
            .post(this.administratonController.createRole)
            .get(this.administratonController.getAllRole);
        this.router
            .route("/role/:id")
            .get(this.administratonController.getSingleRole)
            .patch(this.administratonController.updateSingleRole);
        this.router
            .route("/admin")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_ADMIN_FILES), this.administratonController.createAdmin)
            .get(this.administratonController.getAllAdmin);
        this.router
            .route("/admin/:id")
            .get(this.administratonController.getSingleAdmin)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_ADMIN_FILES), this.administratonController.updateAdmin);
    }
}
exports.default = AdministrationRouter;
//# sourceMappingURL=administration.router.js.map