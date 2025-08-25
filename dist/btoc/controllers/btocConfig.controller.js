"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocConfigController = void 0;
const abstract_controller_1 = __importDefault(require("../../abstarcts/abstract.controller"));
const btocConfig_service_1 = require("../services/btocConfig.service");
class BtocConfigController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new btocConfig_service_1.BtocConfigService();
    }
}
exports.BtocConfigController = BtocConfigController;
//# sourceMappingURL=btocConfig.controller.js.map