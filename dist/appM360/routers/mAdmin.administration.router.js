"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const mAdmin_administration_controller_1 = __importDefault(require("../controllers/mAdmin.administration.controller"));
class MAdministrationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.administratonController = new mAdmin_administration_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/admin")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES), this.administratonController.createAdmin)
            .get(this.administratonController.getAllAdmin);
        // update admin
        this.router
            .route("/update/admin/:id")
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES), this.administratonController.updateAdmin);
    }
}
exports.default = MAdministrationRouter;
//# sourceMappingURL=mAdmin.administration.router.js.map