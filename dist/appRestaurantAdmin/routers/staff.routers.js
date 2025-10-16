"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const staff_controller_1 = __importDefault(require("../controllers/staff.controller"));
class RestaurantStaffRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new staff_controller_1.default();
        this.callV1Router();
    }
    callV1Router() {
        this.router.route("/").get(this.controller.getAllStaffs);
        this.router.route("/:id").get(this.controller.getSingleStaff);
    }
}
exports.default = RestaurantStaffRouter;
//# sourceMappingURL=staff.routers.js.map