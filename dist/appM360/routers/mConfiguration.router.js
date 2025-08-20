"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const mConfiguration_controller_1 = __importDefault(require("../controllers/mConfiguration.controller"));
class MConfigurationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new mConfiguration_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/accommodation").get(this.controller.getAllAccomodation);
        this.router
            .route("/accommodation/:id")
            .get(this.controller.getAllAccomodation);
        this.router
            .route("/city")
            .get(this.controller.getAllCity)
            .post(this.controller.insertCity);
        // ---------------------- for reservation -------------------//
        this.router
            .route("/permission-group")
            .post(this.controller.createPermissionGroup)
            .get(this.controller.getPermissionGroup);
        this.router
            .route("/permission/by-hotel-code/:hotel_code")
            .get(this.controller.getSingleHotelPermission)
            .patch(this.controller.updateSingleHotelPermission);
        this.router
            .route("/permission")
            .post(this.controller.createPermission)
            .get(this.controller.getAllPermission);
        //-------------------------
        this.router.route("/country").get(this.controller.getAllCountry);
        //------------------------------ Room type amenities ------------------------------//
        //create and get room amenities amenities head
        this.router
            .route("/room-type-amenities-head")
            .post(this.controller.createRoomTypeAmenitiesHead)
            .get(this.controller.getAllRoomTypeAmenitiesHead);
        // update and delete room type amenities
        this.router
            .route("/room-type-amenities-head/:id")
            .patch(this.controller.updateRoomTypeAmenitiesHead);
        // room type amenities
        this.router
            .route("/room-type-amenities")
            .post(this.uploader.cloudUploadRaw("room-type-amenities-icons"), this.controller.createRoomTypeAmenities)
            .get(this.controller.getAllRoomTypeAmenities);
        // update and delete room type amenities
        this.router
            .route("/room-type-amenities/:id")
            .patch(this.uploader.cloudUploadRaw("room-type-amenities-icons"), this.controller.updateRoomTypeAmenities)
            .delete(this.controller.deleteRoomTypeAmenities);
    }
}
exports.default = MConfigurationRouter;
//# sourceMappingURL=mConfiguration.router.js.map