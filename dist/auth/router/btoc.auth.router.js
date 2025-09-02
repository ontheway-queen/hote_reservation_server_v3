"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const authChecker_1 = __importDefault(require("../../common/middleware/authChecker/authChecker"));
const btoc_auth_controller_1 = __importDefault(require("../controller/btoc.auth.controller"));
class BtocUserAuthRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.btocUserAuthController = new btoc_auth_controller_1.default();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/registration")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES), this.btocUserAuthController.registration);
        this.router.route("/login").post(this.btocUserAuthController.login);
        this.router
            .route("/profile")
            .get(this.authChecker.btocUserAuthChecker, this.btocUserAuthController.getProfile);
        this.router
            .route("/forget-password")
            .patch(this.btocUserAuthController.forgetPassword);
        this.router
            .route("/change-password")
            .patch(this.authChecker.btocUserAuthChecker, this.btocUserAuthController.changePassword);
    }
}
exports.default = BtocUserAuthRouter;
//# sourceMappingURL=btoc.auth.router.js.map