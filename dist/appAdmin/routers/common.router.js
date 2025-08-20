"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const common_controller_1 = require("../controllers/common.controller");
class CommonRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new common_controller_1.CommonController();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/city").get(this.controller.getAllCity);
    }
}
exports.default = CommonRouter;
//# sourceMappingURL=common.router.js.map