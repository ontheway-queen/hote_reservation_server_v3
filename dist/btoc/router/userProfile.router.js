"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const authChecker_1 = __importDefault(require("../../common/middleware/authChecker/authChecker"));
const userProfile_controller_1 = __importDefault(require("../controller/userProfile.controller"));
class UserProfileRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.useProfileController = new userProfile_controller_1.default();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        // prifle
        this.router
            .route("/profile")
            .get(this.authChecker.btocUserAuthChecker, this.useProfileController.getProfile)
            .patch(this.authChecker.btocUserAuthChecker, this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES), this.useProfileController.updateProfile);
    }
}
exports.default = UserProfileRouter;
//# sourceMappingURL=userProfile.router.js.map