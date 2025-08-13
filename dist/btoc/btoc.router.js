"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_router_1 = __importDefault(require("./router/user.router"));
class BtocRouter {
    constructor() {
        this.BtocRouter = (0, express_1.Router)();
        this.callRouter();
    }
    callRouter() {
        this.BtocRouter.use("/user", new user_router_1.default().router);
    }
}
exports.default = BtocRouter;
//# sourceMappingURL=btoc.router.js.map