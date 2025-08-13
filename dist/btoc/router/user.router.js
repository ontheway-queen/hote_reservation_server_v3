"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const authChecker_1 = __importDefault(require("../../common/middleware/authChecker/authChecker"));
const user_controller_1 = __importDefault(require("../controller/user.controller"));
class UserRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new user_controller_1.default();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        // prifle
        this.router
            .route("/profile")
            .get(this.authChecker.btocUserAuthChecker, this.controller.getProfile)
            .patch(this.authChecker.btocUserAuthChecker, this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES), this.controller.updateProfile);
    }
}
exports.default = UserRouter;
//# sourceMappingURL=user.router.js.map