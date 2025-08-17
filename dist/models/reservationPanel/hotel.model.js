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
class HotelModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // create hotel
    createHotel(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(payload);
            return yield this.db("hotels")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    insertHotelContactDetails(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_contact_details")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    updateHotelContactDetails(payload, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_contact_details")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ hotel_code });
        });
    }
    insertHotelImages(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_image")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(body);
        });
    }
    // get all hotel
    getAllHotel(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, name, status, limit, skip } = payload;
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("hotels as h");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("h.id", "h.hotel_code", "h.name", "h.address", "h.star_category", "h.city_code", "h.country_code", "h.accommodation_type_id", "h.accommodation_type_name", "h.created_at", "hcd.email", "h.status", "hcd.logo", "h.expiry_date", "h.created_at")
                .leftJoin("hotel_contact_details as hcd", "h.hotel_code", "hcd.hotel_code")
                .where(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("h.created_at", [from_date, endDate]);
                }
                if (name) {
                    this.andWhere("h.name", "like", `%${name}%`).orWhere("h.chain_name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("hoi.status", status);
                }
            })
                .orderBy("id", "desc");
            const total = yield this.db("hotels as h")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("h.id AS total")
                .where(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("h.created_at", [from_date, endDate]);
                }
                if (name) {
                    this.andWhere("h.name", "like", `%${name}%`).orWhere("h.chain_name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("hoi.status", status);
                }
            });
            return {
                data,
                total: total[0].total,
            };
        });
    }
    getHotelLastId() {
        return __awaiter(this, void 0, void 0, function* () {
            const hotels = yield this.db("hotels")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id")
                .limit(1)
                .orderBy("id", "desc");
            return hotels.length ? hotels[0].id : 1;
        });
    }
    // get single hotel
    getSingleHotel(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, email, id, wl_token } = payload;
            return yield this.db("hotels as h")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("h.id", "h.hotel_code", "h.name as hotel_name", "h.address", "h.star_category", "h.city_code", "h.country_code", "h.accommodation_type_id", "h.accommodation_type_name", "h.created_at", "h.latitude", "h.longitude", "h.chain_name", "h.postal_code", "h.description", "h.star_category", "h.created_at", "h.status", "h.white_label", "h.white_label_token", "h.expiry_date", "h.created_at", "hcd.logo", "hcd.fax", "hcd.website_url", "hcd.email as hotel_email", "hcd.phone", "hcd.optional_phone1", "h.bin", this.db.raw(`(SELECT json_agg(
      json_build_object(
        'id', hi.id,
        'image_url', hi.image_url,
        'image_caption', hi.image_caption,
        'main_image', hi.main_image
      )
    )
    FROM hotel_reservation.hotel_image hi
    WHERE hi.hotel_code = h.hotel_code
  ) AS images`))
                .leftJoin("hotel_contact_details as hcd", "h.hotel_code", "hcd.hotel_code")
                .where(function () {
                if (id) {
                    this.andWhere("h.id", id);
                }
                if (hotel_code) {
                    this.andWhere("h.hotel_code", hotel_code);
                }
                if (email) {
                    this.andWhere("hcd.email", email);
                }
                if (wl_token) {
                    this.andWhere("h.white_label_token", wl_token);
                }
            })
                .first();
        });
    }
    // update hotel
    updateHotel(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, id } = where;
            console.log({ payload, id });
            const res = yield this.db("hotels as h")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where(function () {
                if (id) {
                    this.where({ id });
                }
                else if (email) {
                    this.where({ email });
                }
            });
            return res;
        });
    }
    // delete hotel images
    deleteHotelImage(payload, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_images")
                .withSchema(this.RESERVATION_SCHEMA)
                .delete()
                .whereIn("id", payload)
                .andWhere("hotel_code", hotel_code);
        });
    }
    // insert hotel amnities
    insertHotelAmnities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_aminities")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // delete hotel amnities
    deleteHotelAmnities(payload, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_aminities")
                .withSchema(this.RESERVATION_SCHEMA)
                .delete()
                .whereIn("id", payload)
                .andWhere("hotel_code", hotel_code);
        });
    }
    // Get Hotel Account config
    getHotelAccConfig(hotel_code, configs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_head_config")
                .withSchema(this.ACC_SCHEMA)
                .select("*")
                .andWhere("hotel_code", hotel_code)
                .andWhere("is_deleted", false)
                .whereIn("config", configs);
        });
    }
    insertHotelAccConfig(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_head_config")
                .withSchema(this.ACC_SCHEMA)
                .insert(payload, "id");
        });
    }
}
exports.default = HotelModel;
//# sourceMappingURL=hotel.model.js.map