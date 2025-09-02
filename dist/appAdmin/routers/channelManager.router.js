"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const channelManager_controller_1 = __importDefault(require("../controllers/channelManager.controller"));
class ChannelManagerRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new channelManager_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.controller.addChannelManager)
            .get(this.controller.getAllChannelManager);
        this.router.route("/:id").patch(this.controller.updateChannelManager);
        this.router
            .route("/channel-allocation")
            .post(this.controller.channelAllocation)
            .get(this.controller.getChannelRoomAllocations);
    }
}
exports.default = ChannelManagerRouter;
//# sourceMappingURL=channelManager.router.js.map