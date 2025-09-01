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
    getHeroBGContent(query, with_total = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .orderBy("order_number", "asc")
                .andWhere("hotel_code", query.hotel_code)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere("status", query.status);
                }
                if (query.type) {
                    qb.andWhere("type", query.type);
                }
            })
                .limit(query.limit ? parseInt(query.limit) : 100)
                .offset(query.skip ? parseInt(query.skip) : 0);
            let total = [];
            if (with_total) {
                total = yield this.db("hero_bg_content")
                    .withSchema(this.BTOC_SCHEMA)
                    .count("id AS total")
                    .andWhere("hotel_code", query.hotel_code)
                    .where((qb) => {
                    if (query.status !== undefined) {
                        qb.andWhere("status", query.status);
                    }
                    if (query.type) {
                        qb.andWhere("type", query.type);
                    }
                });
            }
            return { data, total: Number((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0 };
        });
    }
    checkHeroBGContent(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .orderBy("order_number", "asc")
                .andWhere("hotel_code", query.hotel_code)
                .andWhere("id", query.id);
        });
    }
    getHeroBGContentLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .orderBy("order_number", "desc")
                .first();
        });
    }
    updateHeroBGContent(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("hotel_code", where.hotel_code)
                .where("id", where.id);
        });
    }
    deleteHeroBGContent(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hero_bg_content")
                .withSchema(this.BTOC_SCHEMA)
                .del()
                .where("hotel_code", where.hotel_code)
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
                .andWhere("pd.hotel_code", query.hotel_code)
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
                .andWhere("hotel_code", query.hotel_code)
                .andWhere("id", query.id)
                .first();
        });
    }
    getPopularDestinationLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_destination")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .orderBy("order_number", "desc")
                .first();
        });
    }
    updatePopularDestination(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_destination")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("hotel_code", where.hotel_code)
                .where("id", where.id);
        });
    }
    deletePopularDestination(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_destination")
                .withSchema(this.BTOC_SCHEMA)
                .del()
                .where("hotel_code", where.hotel_code)
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
                .andWhere("pp.hotel_code", query.hotel_code)
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
                .andWhere("hotel_code", query.hotel_code)
                .andWhere("id", query.id)
                .first();
        });
    }
    getPopularPlaceLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_places")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .orderBy("order_number", "desc")
                .first();
        });
    }
    updatePopularPlace(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_places")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("hotel_code", where.hotel_code)
                .andWhere("id", where.id);
        });
    }
    deletePopularPlace(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_places")
                .withSchema(this.BTOC_SCHEMA)
                .del()
                .where("hotel_code", where.hotel_code)
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
    getSocialLink(query, with_total = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("social_links AS sl")
                .withSchema(this.BTOC_SCHEMA)
                .select("sl.id", "sl.link", "sl.status", "sl.order_number", "sl.social_media_id", "sm.name AS media", "sm.logo")
                .leftJoin("social_media AS sm", "sl.social_media_id", "sm.id")
                .orderBy("sl.order_number", "asc")
                .andWhere("sl.hotel_code", query.hotel_code)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere("sl.status", query.status);
                }
            })
                .limit(query.limit ? parseInt(query.limit) : 100)
                .offset(query.skip ? parseInt(query.skip) : 0);
            let total = [];
            if (with_total) {
                total = yield this.db("social_links")
                    .withSchema(this.BTOC_SCHEMA)
                    .count("id AS total")
                    .andWhere("hotel_code", query.hotel_code)
                    .where((qb) => {
                    if (query.status !== undefined) {
                        qb.andWhere("status", query.status);
                    }
                });
            }
            return { data, total: Number((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0 };
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
    getHotDeals(query, with_total = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("hot_deals")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .orderBy("order_number", "asc")
                .andWhere("hotel_code", query.hotel_code)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere("status", query.status);
                }
            });
            let total = [];
            if (with_total) {
                total = yield this.db("hot_deals")
                    .withSchema(this.BTOC_SCHEMA)
                    .count("id AS total")
                    .andWhere("hotel_code", query.hotel_code)
                    .where((qb) => {
                    if (query.status !== undefined) {
                        qb.andWhere("status", query.status);
                    }
                });
            }
            return { data, total: Number((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0 };
        });
    }
    checkHotDeals(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hot_deals")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .andWhere("hotel_code", query.hotel_code)
                .andWhere("id", query.id)
                .first();
        });
    }
    getHotDealsLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hot_deals")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .orderBy("order_number", "desc")
                .first();
        });
    }
    updateHotDeals(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hot_deals")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("hotel_code", where.hotel_code)
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
            });
        });
    }
    getSinglePopUpBanner(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("pop_up_banner")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .andWhere("hotel_code", query.hotel_code)
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
                .where("hotel_code", where.hotel_code)
                .where("id", where.id);
        });
    }
    // =========================== FAQ =========================== //
    getAllFaqHeads(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faq_heads as fh")
                .withSchema(this.BTOC_SCHEMA)
                .select("fh.id", "fh.order_number", "fh.title", this.db.raw(`
  (
    SELECT JSON_AGG(
      JSON_BUILD_OBJECT(
        'faq_id', fq.id,
        'question', fq.question,
        'answer', fq.answer,
        'order_number', fq.order_number,
        'status', fq.status
      ) ORDER BY fq.order_number ASC
    ) AS faqs
  )
`))
                .leftJoin("faqs as fq", "fh.id", "fq.faq_head_id")
                .where("fh.hotel_code", where.hotel_code)
                .andWhere((qb) => {
                if (where.order) {
                    qb.andWhere("fh.order_number", where.order);
                }
            })
                .andWhere("fh.is_deleted", false)
                .andWhere("fq.is_deleted", false)
                .groupBy("fh.id", "fh.order_number", "fh.title")
                .orderBy("fh.order_number", "asc");
        });
    }
    getSingleFaqHeads(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faq_heads")
                .withSchema(this.BTOC_SCHEMA)
                .select("id", "hotel_code", "title", "order_number", "status", "created_at")
                .where({ id })
                .andWhere({ hotel_code })
                .first();
        });
    }
    createFaqHead(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faq_heads")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateFaqHead(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faq_heads")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where("id", where.id);
        });
    }
    deleteFaqHead(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faq_heads")
                .withSchema(this.BTOC_SCHEMA)
                .update("is_deleted", "true")
                .where("id", where.id);
        });
    }
    createFaq(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faqs")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateFaq(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faqs")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where(where);
        });
    }
    getFaqsByHeadId(head_id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faqs")
                .select("id", "question", "answer", "order_number", "status", "created_at")
                .withSchema(this.BTOC_SCHEMA)
                .where("faq_head_id", head_id)
                .andWhere("hotel_code", hotel_code);
        });
    }
    getSingleFaq(faq_id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("faqs")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where({ id: faq_id })
                .andWhere({ hotel_code });
        });
    }
    // =========================== Hotel Amenities =========================== //
    addHotelAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_amenities")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getAllHotelAmenities(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_amenities as ha")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("a.id", "ha.hotel_code", "a.head_id", "a.name", "a.description", "a.icon", "a.status")
                .join("amenities as a", "a.id", "ha.amenity_id")
                .where("hotel_code", hotel_code)
                .andWhere("is_deleted", false);
        });
    }
}
exports.default = AgencyB2CConfigModel;
//# sourceMappingURL=b2cConfigurationModel.js.map