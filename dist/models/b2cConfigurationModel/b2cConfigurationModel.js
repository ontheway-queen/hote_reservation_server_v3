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
    getPopularRoomTypes(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_room_types as prt")
                .withSchema(this.BTOC_SCHEMA)
                .select("prt.*", "rt.name", "rt.description")
                .joinRaw(`JOIN ?? as rt ON rt.id = prt.room_type_id`, [
                `${this.RESERVATION_SCHEMA}.${this.TABLES.room_types}`,
            ])
                .where("prt.hotel_code", query.hotel_code)
                .modify((qb) => {
                if (query.id) {
                    qb.andWhere("prt.id", query.id);
                }
                if (query.order_number) {
                    qb.andWhere("prt.order_number", query.order_number);
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
    updatePopularRoomTypes({ hotel_code, id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("popular_room_types")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .andWhere("id", id)
                .update(payload);
        });
    }
    // ======================== Service Content ================================ //
    createHotelServiceContent(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_service_content")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getSingleServiceContent(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_service_content")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .modify((qb) => {
                if (query.id) {
                    qb.andWhere("id", query.id);
                }
                if (query.hotel_code) {
                    qb.andWhere("hotel_code", query.hotel_code);
                }
            })
                .first();
        });
    }
    getHotelServiceContentWithServices(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_service_content as hsc")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("hsc.id", "hsc.hotel_code", "hsc.title", "hsc.description", this.db.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id', hs.id,
              'icon', hs.icon,
              'title', hs.title,
              'description', hs.description
            )
          ) FILTER (WHERE hs.id IS NOT NULL),
          '[]'
        ) as services
      `))
                .leftJoin("hotel_services as hs", "hs.hotel_code", "hsc.hotel_code")
                .modify((qb) => {
                if (query.id) {
                    qb.andWhere("hsc.id", query.id);
                }
                if (query.hotel_code) {
                    qb.andWhere("hsc.hotel_code", query.hotel_code);
                }
            })
                .groupBy("hsc.id")
                .first();
        });
    }
    updateServiceContent(payload, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_service_content")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .modify((qb) => {
                if (query.hotel_code) {
                    qb.andWhere("hotel_code", query.hotel_code);
                }
            });
        });
    }
    // ======================== Services ================================ //
    createHotelService(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_services")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getSingleService(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_services")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .modify((qb) => {
                if (query.id) {
                    qb.andWhere("id", query.id);
                }
                if (query.title) {
                    qb.andWhere("title", "ilike", `%${query.title}%`);
                }
            })
                .first();
        });
    }
    getAllServices(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const qb = this.db("hotel_services")
                .withSchema(this.RESERVATION_SCHEMA)
                .modify((qb) => {
                if (query.title) {
                    qb.andWhere("title", "ilike", `%${query.title}%`);
                }
            })
                .andWhere("is_deleted", false);
            const data = yield qb
                .clone()
                .limit(query.limit)
                .offset(query.skip)
                .orderBy("id", "desc");
            const total = yield qb.clone().count("* as count").first();
            return {
                data,
                total: Number((total === null || total === void 0 ? void 0 : total.count) || 0),
            };
        });
    }
    updateHotelService(payload, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_services")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where("id", query.id);
        });
    }
}
exports.default = B2cConfigurationModel;
//# sourceMappingURL=b2cConfigurationModel.js.map