"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const restaurant_hotel_controller_1 = __importDefault(require("../controllers/restaurant.hotel.controller"));
const hotelRestaurant_report_router_1 = __importDefault(require("./hotelRestaurant.report.router"));
class HotelRestaurantRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.Controller = new restaurant_hotel_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_RESTAURANT_FILES), this.Controller.createRestaurant)
            .get(this.Controller.getAllRestaurant);
        this.router.route("/add-staff").post(this.Controller.addStaffs);
        this.router
            .route("/remove-staff/:staff_id/:restaurant_id")
            .delete(this.Controller.removeStaff);
        this.router.use("/report", new hotelRestaurant_report_router_1.default().router);
        // assign ingredients
        this.router
            .route("/assign-food-ingredients")
            .post(this.Controller.assignFoodIngredientsToRestaurant)
            .get(this.Controller.getAssignFoodIngredientsToRestaurant);
        this.router
            .route("/assign-food-ingredients/:id")
            .delete(this.Controller.deleteAssignFoodIngredientsToRestaurant);
        this.router
            .route("/:id")
            .get(this.Controller.getRestaurantWithAdmin)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_RESTAURANT_FILES), this.Controller.updateHotelRestaurantAndAdmin);
    }
}
exports.default = HotelRestaurantRouter;
//# sourceMappingURL=restaurant.hotel.router.js.map