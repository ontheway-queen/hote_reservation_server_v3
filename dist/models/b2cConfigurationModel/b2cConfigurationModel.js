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
class AgencyB2CConfigModel extends schema_1.default {
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
    insertPopularDestination(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_destination")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload);
        });
    }
    getPopularDestination(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_destination AS pd")
                .withSchema(this.BTOC_SCHEMA)
                .select("pd.*", "dc.name AS from_airport_country", "dci.name AS from_airport_city", "da.name AS from_airport_name", "da.iata_code AS from_airport_code", "aa.name AS to_airport_name", "aa.iata_code AS to_airport_code", "ac.name AS to_airport_country", "aci.name AS to_airport_city")
                .joinRaw(`LEFT JOIN public.airport AS da ON pd.from_airport = da.id`)
                .joinRaw(`LEFT JOIN public.airport AS aa ON pd.to_airport = aa.id`)
                .joinRaw(`LEFT JOIN public.country AS dc ON da.country_id = dc.id`)
                .joinRaw(`LEFT JOIN public.country AS ac ON aa.country_id = ac.id`)
                .joinRaw(`LEFT JOIN public.city AS dci ON da.city = dci.id`)
                .joinRaw(`LEFT JOIN public.city AS aci ON aa.city = aci.id`)
                .orderBy("pd.order_number", "asc")
                .andWhere("pd.agency_id", query.agency_id)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere("pd.status", query.status);
                }
            });
        });
    }
    checkPopularDestination(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_destination")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .orderBy("order_number", "asc")
                .andWhere("agency_id", query.agency_id)
                .andWhere("id", query.id)
                .first();
        });
    }
    getPopularDestinationLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_destination")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("agency_id", query.agency_id)
                .orderBy("order_number", "desc")
                .first();
        });
    }
    updatePopularDestination(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_destination")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("agency_id", where.agency_id)
                .where("id", where.id);
        });
    }
    deletePopularDestination(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_destination")
                .withSchema(this.BTOC_SCHEMA)
                .del()
                .where("agency_id", where.agency_id)
                .where("id", where.id);
        });
    }
    insertPopularPlaces(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_places")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload);
        });
    }
    getPopularPlaces(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_places AS pp")
                .withSchema(this.BTOC_SCHEMA)
                .select("pp.*", "c.name AS country_name")
                .joinRaw(`LEFT JOIN public.country AS c ON pp.country_id = c.id`)
                .orderBy("pp.order_number", "asc")
                .andWhere("pp.agency_id", query.agency_id)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere("pp.status", query.status);
                }
            });
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
                .withSchema(this.PUBLIC_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateSocialMedia(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("social_media")
                .withSchema(this.PUBLIC_SCHEMA)
                .update(payload)
                .where("id", id);
        });
    }
    getSocialMedia(query) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ query });
            return yield this.db("social_media")
                .withSchema(this.PUBLIC_SCHEMA)
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
    // =========================== FAQ =========================== //
    getAllFaqHeads(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faq_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "order_number", "title")
                .where("hotel_code", where.hotel_code)
                .andWhere((qb) => {
                if (where.id) {
                    qb.andWhere("id", where.id);
                }
                if (where.order) {
                    qb.andWhere("order_number", where.order);
                }
            })
                .andWhere("is_deleted", false);
        });
    }
    createFaqHead(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faq_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateFaqHead(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faq_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where("id", where.id);
        });
    }
    deleteFaqHead(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faq_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .update("is_deleted", "true")
                .where("id", where.id);
        });
    }
    createFaq(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faqs")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getFaqsByHeadId(head_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faqs")
                .select("*")
                .withSchema(this.RESERVATION_SCHEMA)
                .where("faq_head_id", head_id);
        });
    }
}
exports.default = AgencyB2CConfigModel;
//# sourceMappingURL=b2cConfigurationModel.js.map