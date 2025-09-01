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
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class ChannelManagerModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    addChannelManager(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("channels").withSchema(this.CM_SCHEMA).insert(payload);
        });
    }
    getAllChannelManager({ hotel_code, is_internal, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("channels")
                .withSchema(this.CM_SCHEMA)
                .select("id", "name", "is_internal")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (is_internal) {
                    this.andWhere("is_internal", is_internal);
                }
            });
        });
    }
    updateChannelManager(payload, conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("channels")
                .withSchema(this.CM_SCHEMA)
                .update(payload)
                .where(conditions);
        });
    }
}
exports.default = ChannelManagerModel;
//# sourceMappingURL=channelManager.model.js.map