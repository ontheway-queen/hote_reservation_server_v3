"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const service_controller_1 = __importDefault(require("../controllers/service.controller"));
class ServiceRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new service_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_SERVICE_FILES), this.controller.createService)
            .get(this.controller.getAllServices);
        this.router
            .route("/:id")
            .get(this.controller.getSingleService)
            .delete(this.controller.deleteService)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_SERVICE_FILES), this.controller.updateService);
    }
}
exports.default = ServiceRouter;
//# sourceMappingURL=service.router.js.map