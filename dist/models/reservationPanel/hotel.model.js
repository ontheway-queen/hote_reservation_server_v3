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
            return yield this.db('hotels')
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // insert in hotels other info
    insertHotelOtherInfo(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_others_info')
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    insertHotelImages(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_images')
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
            const dtbs = this.db('hotels as h');
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select('h.id', 'h.hotel_code', 'h.name', 'h.address', 'h.star_category', 'h.city_code', 'h.country_code', 'h.accommodation_type_id', 'h.accommodation_type_name', 'h.created_at', 'hcd.email', 'hoi.status', 'hoi.logo', 'hoi.expiry_date', 'h.created_at')
                .leftJoin('hotel_others_info as hoi', 'h.hotel_code', 'hoi.hotel_code')
                .leftJoin('hotel_contact_details as hcd', 'h.hotel_code', 'hcd.hotel_code')
                .where(function () {
                if (from_date && to_date) {
                    this.andWhereBetween('h.created_at', [from_date, endDate]);
                }
                if (name) {
                    this.andWhere('h.name', 'like', `%${name}%`).orWhere('h.chain_name', 'like', `%${name}%`);
                }
                if (status) {
                    this.andWhere('hoi.status', status);
                }
            })
                .orderBy('id', 'desc');
            const total = yield this.db('hotels as h')
                .withSchema(this.RESERVATION_SCHEMA)
                .count('h.id AS total')
                .where(function () {
                if (from_date && to_date) {
                    this.andWhereBetween('h.created_at', [from_date, endDate]);
                }
                if (name) {
                    this.andWhere('h.name', 'like', `%${name}%`).orWhere('h.chain_name', 'like', `%${name}%`);
                }
                if (status) {
                    this.andWhere('hoi.status', status);
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
            const hotels = yield this.db('hotels')
                .withSchema(this.RESERVATION_SCHEMA)
                .select('id')
                .limit(1)
                .orderBy('id', 'desc');
            return hotels.length ? hotels[0].id : 1;
        });
    }
    // get single hotel
    getSingleHotel(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, email } = payload;
            return yield this.db('hotels')
                .withSchema(this.RESERVATION_SCHEMA)
                .select('*')
                .where(function () {
                if (id) {
                    this.andWhere({ id });
                }
                if (email) {
                    this.andWhere({ email });
                }
            });
        });
    }
    // update hotel
    updateHotel(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, id } = where;
            return yield this.db('hotel')
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
        });
    }
    // insert hotel images
    insertHotelImage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_images')
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // delete hotel images
    deleteHotelImage(payload, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_images')
                .withSchema(this.RESERVATION_SCHEMA)
                .delete()
                .whereIn('id', payload)
                .andWhere('hotel_code', hotel_code);
        });
    }
    // insert hotel amnities
    insertHotelAmnities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_aminities')
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // delete hotel amnities
    deleteHotelAmnities(payload, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_aminities')
                .withSchema(this.RESERVATION_SCHEMA)
                .delete()
                .whereIn('id', payload)
                .andWhere('hotel_code', hotel_code);
        });
    }
    // Get Hotel Account config
    getHotelAccConfig(hotel_code, configs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('acc_head_config')
                .withSchema(this.ACC_SCHEMA)
                .select('*')
                .andWhere('hotel_code', hotel_code)
                .whereIn('config', configs);
        });
    }
}
exports.default = HotelModel;
//# sourceMappingURL=hotel.model.js.map