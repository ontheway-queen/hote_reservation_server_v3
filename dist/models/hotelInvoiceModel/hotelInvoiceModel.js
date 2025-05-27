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
class HotelInvoiceModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //   insert hotel invoice
    insertHotelInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoice")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // update hotel invoice
    updateHotelInvoice(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { due } = payload;
            const { hotel_code, id } = where;
            return yield this.db("invoice")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id })
                .andWhere({ hotel_code });
        });
    }
    updateRoomBookingInvoice(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id } = where;
            return yield this.db("invoice")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id })
                .andWhere({ hotel_code });
        });
    }
    // insert hotel invoice item
    updateBookingUpdateInvoice(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id } = where;
            return yield this.db("invoice")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id })
                .andWhere({ hotel_code: hotel_code });
        });
    }
    // get sub invoice
    getRoomBookingSubInv(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_booking_sub_invoice")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where("room_booking_id", id)
                .first();
        });
    }
    // insert hotel invoice item
    insertHotelInvoiceItem(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoice_item")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get all invoice
    getAllInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, hotel_code, user_id, from_date, to_date, limit, skip, due_inovice, } = payload;
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("inv_view as iv");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("iv.invoice_id", "u.id", "u.name as user_name", "iv.invoice_no", "iv.type", "iv.discount_amount", "iv.tax_amount", "iv.sub_total", "iv.grand_total", "iv.due", "iv.created_at", "ua.name as created_by")
                .leftJoin("user as u", "iv.user_id", "u.id")
                .leftJoin("user_admin as ua", "iv.created_by", "ua.id")
                .where("iv.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("invoice_no", "like", `%${key}%`).orWhere("u.name", "like", `%${key}%`);
                }
            })
                .andWhere(function () {
                if (user_id) {
                    this.andWhere("iv.user_id", user_id);
                }
                if (from_date && to_date) {
                    this.andWhereBetween("iv.created_at", [from_date, endDate]);
                }
                if (due_inovice) {
                    this.andWhere("iv.due", ">", 0);
                }
            })
                .orderBy("iv.invoice_id", "desc");
            const total = yield this.db("inv_view as iv")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("invoice_id as total")
                .leftJoin("user as u", "iv.user_id", "u.id")
                .leftJoin("user_admin as ua", "iv.created_by", "ua.id")
                .where("iv.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("invoice_no", "like", `%${key}%`).orWhere("u.name", "like", `%${key}%`);
                }
            })
                .andWhere(function () {
                if (user_id) {
                    this.andWhere("iv.user_id", user_id);
                }
                if (due_inovice) {
                    this.andWhere("iv.due", ">", 0);
                }
            });
            return { data, total: total[0].total };
        });
    }
    // get all invoice for money reciept
    getAllInvoiceForMoneyReciept(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, hotel_code, user_id, from_date, to_date, limit, skip, due_inovice, } = payload;
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("invoice as iv");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("iv.id as invoice_id", "u.id as user_id", "iv.invoice_no", "iv.discount_amount", "iv.tax_amount", "iv.sub_total", "iv.grand_total", "iv.due")
                .leftJoin("user as u", "iv.user_id", "u.id")
                .leftJoin("user_admin as ua", "iv.created_by", "ua.id")
                .where("iv.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("invoice_no", "like", `%${key}%`).orWhere("u.name", "like", `%${key}%`);
                }
            })
                .andWhere(function () {
                if (user_id) {
                    this.andWhere("iv.user_id", user_id);
                }
                if (from_date && to_date) {
                    this.andWhereBetween("iv.created_at", [from_date, endDate]);
                }
                if (due_inovice) {
                    this.andWhere("iv.due", ">", 0);
                }
            })
                .orderBy("iv.id", "desc");
            return data;
        });
    }
    // Get single invoice
    getSingleInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, invoice_id, user_id } = payload;
            return yield this.db("inv_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("invoice_id", "invoice_no", "hotel_address", "hotel_email", "hotel_phone", "hotel_website", "hotel_logo", "user_name", "created_by_name", "type", "discount_amount", "tax_amount", "sub_total", "grand_total", "due", "description", "created_at", "invoice_items")
                .where({ hotel_code: hotel_code })
                .andWhere({ invoice_id: invoice_id })
                .andWhere(function () {
                if (user_id) {
                    this.andWhere("user_id", user_id);
                }
            });
        });
    }
    // sub invoice id
    getSingleRoomBookingSubInv(room_booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const subInvoice = yield this.db("room_booking_sub_invoice")
                .select("*")
                .where("room_booking_id", room_booking_id)
                .first();
        });
    }
    updateSingleInvoice(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id } = where;
            return yield this.db("invoice")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ hotel_code })
                .andWhere({ id });
        });
    }
    // get single invoice by invoice table
    getSpecificInvoiceForMoneyReciept(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, invoice_id, user_id } = payload;
            return yield this.db("invoice")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "discount_amount", "tax_amount", "sub_total", "invoice_no", "grand_total", "due")
                .where({ hotel_code: hotel_code })
                .andWhere({ id: invoice_id })
                .andWhere(function () {
                if (user_id) {
                    this.andWhere("user_id", user_id);
                }
            });
        });
    }
    // get all invoice for last id
    getAllInvoiceForLastId() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoice")
                .select("id")
                .withSchema(this.RESERVATION_SCHEMA)
                .orderBy("id", "desc")
                .limit(1);
        });
    }
    // create money reciept
    createMoneyReciept(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipt")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // update money reciept
    updateMoneyReciept(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipt")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    // insert money reciept item
    insertMoneyRecieptItem(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_reciept_item")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // get all money reciept for last id
    getAllMoneyRecieptFoLastId() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipt")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id")
                .orderBy("id", "desc")
                .limit(1);
        });
    }
    // get all money reciept
    getAllMoneyReciept(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, from_date, to_date, limit, skip, key } = payload;
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("money_receipt as mr");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("mr.id", "u.id as customer_id", "u.name as customer_name", "mr.money_receipt_no", "mr.payment_type", "mr.total_collected_amount", "ua.name as created_by_admin", "mr.created_at")
                .leftJoin("user as u", "mr.user_id", "u.id")
                .leftJoin("user_admin as ua", "mr.created_by", "ua.id")
                .where("mr.hotel_code", hotel_code)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("mr.created_at", [from_date, endDate]);
                }
            })
                .andWhere(function () {
                if (key) {
                    this.where("mr.money_receipt_no", "like", `%${key}%`).orWhere("u.name", "like", `%${key}%`);
                }
            })
                .orderBy("mr.id", "desc");
            const total = yield this.db("money_receipt as mr")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("mr.id as total")
                .leftJoin("user as u", "mr.user_id", "u.id")
                .where("mr.hotel_code", hotel_code)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("mr.created_at", [from_date, endDate]);
                }
            })
                .andWhere(function () {
                if (key) {
                    this.where("mr.money_receipt_no", "like", `%${key}%`).orWhere("u.name", "like", `%${key}%`);
                }
            });
            return { data, total: total[0].total };
        });
    }
    // get single money reciept
    getSingleMoneyReciept(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id } = payload;
            return yield this.db("money_receipt as mr")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("mr.id", "u.id as customer_id", "u.name as customer_name", "mr.money_receipt_no", "mr.payment_type", "mr.total_collected_amount", "mr.remarks", "ua.name as created_by_admin", "mr.created_at")
                .leftJoin("user as u", "mr.user_id", "u.id")
                .leftJoin("user_admin as ua", "mr.created_by", "ua.id")
                .where("mr.hotel_code", hotel_code)
                .andWhere("mr.id", id);
        });
    }
    // insert return advance
    insertAdvanceReturn(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("advance_return")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // get all advance money reciept
    getAllAdvanceMoneyReciept(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, from_date, to_date, limit, skip, key } = payload;
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("advance_return_view");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("created_at", [from_date, endDate]);
                }
            })
                .andWhere(function () {
                if (key) {
                    this.where("guest_name", "like", `%${key}%`);
                }
            })
                .orderBy("id", "desc");
            const total = yield this.db("advance_return_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("created_at", [from_date, endDate]);
                }
            })
                .andWhere(function () {
                if (key) {
                    this.where("guest_name", "like", `%${key}%`);
                }
            })
                .orderBy("id", "desc");
            return { data, total: total[0].total };
        });
    }
    // get single money reciept
    getSingleAdvanceMoneyReciept(hotel_code, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("advance_return_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ hotel_code })
                .andWhere({ id });
        });
    }
}
exports.default = HotelInvoiceModel;
//# sourceMappingURL=hotelInvoiceModel.js.map