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
class B2cConfigurationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getSiteConfig(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("site_config")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .first();
        });
    }
    getPopUpBanner(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("pop_up_banner")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .first();
        });
    }
    getHeroBgContent(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .modify((qb) => {
                if (query.id) {
                    qb.andWhere("id", query.id);
                }
                if (query.order_number) {
                    qb.andWhere("order_number", query.order_number);
                }
            });
        });
    }
    getHotDeals(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hot_deals")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .modify((qb) => {
                if (query.id) {
                    qb.andWhere("id", query.id);
                }
                if (query.order_number) {
                    qb.andWhere("order_number", query.order_number);
                }
            });
        });
    }
    getSocialLinks(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("social_links")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .modify((qb) => {
                if (query.id) {
                    qb.andWhere("id", query.id);
                }
                if (query.order_number) {
                    qb.andWhere("order_number", query.order_number);
                }
            });
        });
    }
    updateSiteConfig({ hotel_code, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("site_config")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .update(payload);
        });
    }
    updatePopUpBanner({ hotel_code, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("pop_up_banner")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .update(payload);
        });
    }
    updateHeroBgContent({ hotel_code, id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .andWhere("id", id)
                .update(payload);
        });
    }
    updateHotDeals({ hotel_code, id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hot_deals")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .andWhere("id", id)
                .update(payload);
        });
    }
    updateSocialLinks({ hotel_code, id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("social_links")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .andWhere("id", id)
                .update(payload);
        });
    }
}
exports.default = B2cConfigurationModel;
//# sourceMappingURL=b2cConfigurationModel.js.map