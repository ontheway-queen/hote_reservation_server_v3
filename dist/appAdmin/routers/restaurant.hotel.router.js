"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const restaurant_hotel_controller_1 = __importDefault(require("../controllers/restaurant.hotel.controller"));
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
        this.router
            .route("/:id")
            .get(this.Controller.getRestaurantWithAdmin)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_RESTAURANT_FILES), this.Controller.updateHotelRestaurantAndAdmin);
    }
}
exports.default = HotelRestaurantRouter;
//# sourceMappingURL=restaurant.hotel.router.js.map