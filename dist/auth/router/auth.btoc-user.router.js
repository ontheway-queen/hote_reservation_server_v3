"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const authChecker_1 = __importDefault(require("../../common/middleware/authChecker/authChecker"));
const auth_btoc_user_controller_1 = __importDefault(require("../controller/auth.btoc-user.controller"));
class BtocUserAuthRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.btocUserAuthController = new auth_btoc_user_controller_1.default();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        // registration
        this.router
            .route("/user-registration")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES), this.btocUserAuthController.registration);
        // login
        this.router
            .route("/user-login")
            .post(this.btocUserAuthController.login);
        // forget password
        this.router
            .route("/user-forget-password")
            .patch(this.btocUserAuthController.forgetPassword);
        // change password
        this.router
            .route("/user-change-password")
            .patch(this.authChecker.btocUserAuthChecker, this.btocUserAuthController.changePassword);
    }
}
exports.default = BtocUserAuthRouter;
//# sourceMappingURL=auth.btoc-user.router.js.map