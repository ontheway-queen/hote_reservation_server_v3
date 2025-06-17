"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const folio_controller_1 = require("../controllers/folio.controller");
class FolioRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new folio_controller_1.FolioController();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/").post(this.controller.createFolio);
    }
}
exports.default = FolioRouter;
//# sourceMappingURL=folio.router.js.map