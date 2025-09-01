"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class ChannelManagerService extends abstract_service_1.default {
    constructor() {
        super();
    }
    addChannelManager(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotel_code = req.hotel_admin.hotel_code;
            yield this.Model.channelManagerModel().addChannelManager(Object.assign(Object.assign({}, req.body), { hotel_code, created_by: req.hotel_admin.hotel_code }));
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Channel has been added",
            };
        });
    }
    getAllChannelManager(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.channelManagerModel().getAllChannelManager({
                hotel_code: req.hotel_admin.hotel_code,
                is_internal: Boolean(req.query.is_internal),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateChannelManager(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotel_code = req.hotel_admin.hotel_code;
            yield this.Model.channelManagerModel().updateChannelManager(Object.assign({}, req.body), { id: Number(req.params.id), hotel_code });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Channel has been updated",
            };
        });
    }
}
exports.default = ChannelManagerService;
//# sourceMappingURL=channelManager.service.js.map