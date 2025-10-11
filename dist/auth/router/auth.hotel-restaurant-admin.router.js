"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const authChecker_1 = __importDefault(require("../../common/middleware/authChecker/authChecker"));
const auth_hotel_restaurant_admin_controller_1 = __importDefault(require("../controller/auth.hotel-restaurant-admin.controller"));
class AuthHotelRestaurantAdminRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new auth_hotel_restaurant_admin_controller_1.default();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/login").post(this.controller.login);
        this.router
            .route("/profile")
            .get(this.authChecker.hotelRestaurantAuthChecker, this.controller.getProfile)
            .patch(this.authChecker.hotelRestaurantAuthChecker, this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES), this.controller.updateProfile);
        this.router
            .route("/forget-password")
            .patch(this.controller.resetForgetPassword);
        this.router
            .route("/change-password")
            .patch(this.authChecker.hotelRestaurantAuthChecker, this.controller.changeAdminPassword);
    }
}
exports.default = AuthHotelRestaurantAdminRouter;
//# sourceMappingURL=auth.hotel-restaurant-admin.router.js.map