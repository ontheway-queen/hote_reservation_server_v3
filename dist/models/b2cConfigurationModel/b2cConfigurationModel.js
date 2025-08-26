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
class HotelB2CConfigModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertHeroBGContent(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, "id");
        });
    }
    getHeroBGContent(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .orderBy("order_number", "asc")
                .andWhere("agency_id", query.agency_id)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere("status", query.status);
                }
                if (query.type) {
                    qb.andWhere("type", query.type);
                }
            });
        });
    }
    checkHeroBGContent(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .orderBy("order_number", "asc")
                .andWhere("agency_id", query.agency_id)
                .andWhere("id", query.id);
        });
    }
    getHeroBGContentLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("agency_id", query.agency_id)
                .orderBy("order_number", "desc")
                .first();
        });
    }
    updateHeroBGContent(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("agency_id", where.agency_id)
                .where("id", where.id);
        });
    }
    deleteHeroBGContent(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .del()
                .where("agency_id", where.agency_id)
                .where("id", where.id);
        });
    }
    checkPopularPlace(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_places")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .andWhere("agency_id", query.agency_id)
                .andWhere("id", query.id)
                .first();
        });
    }
    getPopularPlaceLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_places")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("agency_id", query.agency_id)
                .orderBy("order_number", "desc")
                .first();
        });
    }
    updatePopularPlace(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_places")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("agency_id", where.agency_id)
                .andWhere("id", where.id);
        });
    }
    deletePopularPlace(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_places")
                .withSchema(this.BTOC_SCHEMA)
                .del()
                .where("agency_id", where.agency_id)
                .where("id", where.id);
        });
    }
    insertSiteConfig(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("site_config")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload);
        });
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
    updateConfig(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("site_config")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("hotel_code", where.hotel_code);
        });
    }
    insertSocialLink(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("social_links")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, "id");
        });
    }
    getSocialLink(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("social_links AS sl")
                .withSchema(this.BTOC_SCHEMA)
                .select("sl.id", "sl.link", "sl.status", "sl.order_number", "sl.social_media_id", "sm.name AS media", "sm.logo")
                .joinRaw(`LEFT JOIN btoc.social_media AS sm ON sl.social_media_id = sm.id`)
                .orderBy("sl.order_number", "asc")
                .andWhere("sl.hotel_code", query.hotel_code)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere("sl.status", query.status);
                }
            });
        });
    }
    checkSocialLink(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("social_links")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .andWhere("hotel_code", query.hotel_code)
                .andWhere("id", query.id)
                .first();
        });
    }
    getSocialLinkLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("social_links")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .orderBy("order_number", "desc")
                .first();
        });
    }
    checkSocialMedia(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("social_media")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("id", id)
                .first();
        });
    }
    updateSocialLink(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("social_links")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("hotel_code", where.hotel_code)
                .andWhere("id", where.id);
        });
    }
    deleteSocialLink(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("social_links")
                .withSchema(this.BTOC_SCHEMA)
                .del()
                .where("hotel_code", where.hotel_code)
                .where("id", where.id);
        });
    }
    insertHotDeals(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hot_deals")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload);
        });
    }
    getHotDeals(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hot_deals")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .orderBy("order_number", "asc")
                .andWhere("agency_id", query.agency_id)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere("status", query.status);
                }
            });
        });
    }
    checkHotDeals(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hot_deals")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .andWhere("agency_id", query.agency_id)
                .andWhere("id", query.id)
                .first();
        });
    }
    getHotDealsLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hot_deals")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("agency_id", query.agency_id)
                .orderBy("order_number", "desc")
                .first();
        });
    }
    updateHotDeals(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hot_deals")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("agency_id", where.agency_id)
                .andWhere("id", where.id);
        });
    }
    deleteHotDeals(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hot_deals")
                .withSchema(this.BTOC_SCHEMA)
                .del()
                .where("hotel_code", where.hotel_code)
                .where("id", where.id);
        });
    }
    insertSocialMedias(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("social_media")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateSocialMedia(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("social_media")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("id", id);
        });
    }
    getSocialMedia(query) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ query });
            return yield this.db("social_media")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where((qb) => {
                if (query.name) {
                    qb.andWhereILike("name", `%${query.name}%`);
                }
                if (query.id) {
                    qb.andWhere("id", query.id);
                }
                if (query.status !== undefined) {
                    qb.andWhere("status", query.status);
                }
            });
        });
    }
    insertPopUpBanner(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("pop_up_banner")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload);
        });
    }
    getPopUpBanner(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("pop_up_banner")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .andWhere("hotel_code", query.hotel_code)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere("status", query.status);
                }
                if (query.pop_up_for) {
                    qb.andWhere("pop_up_for", query.pop_up_for);
                }
            });
        });
    }
    getSinglePopUpBanner(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("pop_up_banner")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .andWhere("agency_id", query.agency_id)
                .andWhere("status", query.status)
                .first();
        });
    }
    updatePopUpBanner(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("pop_up_banner")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("hotel_code", where.hotel_code);
        });
    }
    deletePopUpBanner(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("pop_up_banner")
                .withSchema(this.BTOC_SCHEMA)
                .del()
                .where("agency_id", where.agency_id)
                .where("id", where.id);
        });
    }
}
exports.default = HotelB2CConfigModel;
//# sourceMappingURL=b2cConfigurationModel.js.map