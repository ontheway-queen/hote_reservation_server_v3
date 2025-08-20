"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const mHotel_controller_1 = __importDefault(require("../controllers/mHotel.controller"));
class MHotelRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.hotelController = new mHotel_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_FILES), this.hotelController.createHotel)
            .get(this.hotelController.getAllHotel);
        this.router
            .route("/:id")
            .get(this.hotelController.getSingleHotel)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_FILES), this.hotelController.updateHotel);
        this.router
            .route("/direct-login/:id")
            .post(this.hotelController.directLogin);
        this.router
            .route("/acc-heads/by-hc/:h_code")
            .get(this.hotelController.getAllAccHeads)
            .post(this.hotelController.insertAccHead);
        this.router
            .route("/acc-heads/renew/by-hc/:h_code")
            .post(this.hotelController.renewAccHead);
    }
}
exports.default = MHotelRouter;
//# sourceMappingURL=mHotel.router.js.map