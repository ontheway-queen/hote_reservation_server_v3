"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocConfigRouter = void 0;
const express_1 = require("express");
const authChecker_1 = __importDefault(require("../../common/middleware/authChecker/authChecker"));
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const btocConfig_controller_1 = require("../controllers/btocConfig.controller");
class BtocConfigRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.authChecker = new authChecker_1.default();
        this.controller = new btocConfig_controller_1.BtocConfigController();
        this.callRouter();
    }
    callRouter() { }
}
exports.BtocConfigRouter = BtocConfigRouter;
//# sourceMappingURL=btocConfig.router.js.map