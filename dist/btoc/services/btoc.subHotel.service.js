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
exports.SubBtocHotelService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const helperFunction_1 = require("../../appAdmin/utlis/library/helperFunction");
const lib_1 = __importDefault(require("../../utils/lib/lib"));
class SubBtocHotelService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
    }
    calculateNights(checkIn, checkOut) {
        const from = new Date(checkIn);
        const to = new Date(checkOut);
        const diffTime = Math.abs(to.getTime() - from.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    addDays(date, days = 0) {
        const base = typeof date === "string" ? new Date(`${date}T00:00:00Z`) : new Date(date);
        base.setUTCHours(0, 0, 0, 0);
        base.setUTCDate(base.getUTCDate() + days);
        return base.toISOString().slice(0, 10);
    }
    findOrCreateGuest(guest, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const guestModel = this.Model.guestModel(this.trx);
            // Check if guest already exists
            const existingGuest = yield guestModel.getSingleGuest({
                email: guest.email,
                hotel_code,
            });
            console.log({ existingGuest });
            if (existingGuest.length) {
                return existingGuest[0].id;
            }
            const [insertedGuest] = yield guestModel.createGuest({
                hotel_code,
                first_name: guest.first_name,
                last_name: guest.last_name,
                //   country_id: guest.country_id,
                email: guest.email,
                phone: guest.phone,
                address: guest.address,
                //   passport_no: guest.passport_no,
            });
            return insertedGuest.id;
        });
    }
    createMainBooking({ payload, hotel_code, guest_id, sub_total, total_amount, total_nights, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const reservation_model = this.BtocModels.btocReservationModel(this.trx);
            const last = yield reservation_model.getLastBooking();
            const lastId = (_a = last === null || last === void 0 ? void 0 : last.id) !== null && _a !== void 0 ? _a : 1;
            const ref = lib_1.default.generateBookingReferenceWithId(`WB`, lastId);
            const [booking] = yield reservation_model.insertBooking({
                booking_date: new Date().toLocaleDateString(),
                booking_reference: ref,
                check_in: payload.check_in,
                check_out: payload.check_out,
                guest_id,
                hotel_code,
                sub_total,
                is_individual_booking: payload.is_individual_booking,
                total_amount,
                total_nights,
                payment_status: payload.payment_status,
                comments: payload.special_requests,
                booking_type: payload.booking_type,
                created_by: payload.created_by,
                status: "pending",
                book_from: "web",
            });
            return { id: booking.id, booking_ref: ref };
        });
    }
    insertBookingRooms({ booked_room_types, booking_id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const rt of booked_room_types) {
                for (const room of rt.rooms) {
                    const nights = helperFunction_1.HelperFunction.calculateNights(room.check_in, room.check_out);
                    // Insert booking room
                    const [bookingRoomRes] = yield this.BtocModels.btocReservationModel(this.trx).insertBookingRoom([
                        {
                            check_in: room.check_in,
                            check_out: room.check_out,
                            status: "pending",
                            booking_id,
                            room_type_id: rt.room_type_id,
                            adults: room.adults,
                            children: room.children,
                            base_rate: room.rate.base_rate * nights,
                            changed_rate: room.rate.changed_rate * nights,
                            unit_base_rate: room.rate.base_rate,
                            unit_changed_rate: room.rate.changed_rate,
                        },
                    ]);
                    const booking_room_id = bookingRoomRes.id;
                    // Insert guests and booking_room_guests
                    if (room === null || room === void 0 ? void 0 : room.guest_info) {
                        console.log(room.guest_info);
                        for (const guest of room.guest_info) {
                            const [guestRes] = yield this.Model.guestModel(this.trx).createGuestForGroupBooking({
                                title: guest.title,
                                first_name: guest.first_name,
                                last_name: guest.last_name,
                                email: guest.email,
                                address: guest.address,
                                country_id: guest.country_id,
                                phone: guest.phone,
                                passport_no: guest.passport_no,
                                hotel_code,
                            });
                            yield this.Model.reservationModel(this.trx).insertBookingRoomGuest({
                                // is_lead_guest: guest.is_lead_guest,
                                guest_id: guestRes.id,
                                hotel_code,
                                booking_room_id,
                                is_room_primary_guest: guest.is_room_primary_guest,
                            });
                        }
                    }
                }
            }
        });
    }
    createBtocRoomBookingFolioWithEntries({ body, booking_id, guest_id, req, booking_ref, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const reservationModel = this.Model.reservationModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const child = [];
            const push = (c, e) => {
                var _a;
                c.entries.push(e);
                c.totalDebit += (_a = e.debit) !== null && _a !== void 0 ? _a : 0;
            };
            const folioNo = `F-${booking_ref}`;
            const [folio] = yield hotelInvModel.insertInFolio({
                booking_id,
                folio_number: folioNo,
                guest_id,
                hotel_code,
                name: `Individual Folio`,
                status: "open",
                type: "Primary",
            });
            for (const { rooms } of body.booked_room_types) {
                for (const room of rooms) {
                    const ctx = {
                        folioId: folio.id,
                        folioNumber: folioNo,
                        roomId: room.room_id,
                        entries: [],
                        totalDebit: 0,
                    };
                    /* date‑wise charges */
                    const rates = {};
                    for (let d = new Date(room.check_in); d < new Date(room.check_out); d.setDate(d.getDate() + 1)) {
                        rates[d.toISOString().split("T")[0]] = room.rate.changed_rate;
                    }
                    for (const date of Object.keys(rates).sort()) {
                        const rate = rates[date];
                        // Room tariff
                        push(ctx, {
                            folio_id: ctx.folioId,
                            date,
                            posting_type: "ROOM_CHARGE",
                            debit: rate,
                            credit: 0,
                            description: "Room Tariff",
                            rack_rate: room.rate.base_rate,
                            room_id: room.room_id,
                        });
                        // VAT
                        if (body.vat_percentage > 0) {
                            push(ctx, {
                                folio_id: ctx.folioId,
                                date,
                                posting_type: "VAT",
                                debit: +((rate * body.vat_percentage) / 100).toFixed(2),
                                credit: 0,
                                description: "VAT",
                                rack_rate: 0,
                                room_id: room.room_id,
                            });
                        }
                        // Service charge
                        if (body.service_charge_percentage > 0) {
                            push(ctx, {
                                folio_id: ctx.folioId,
                                date,
                                posting_type: "SERVICE_CHARGE",
                                debit: +((rate * body.service_charge_percentage) / 100).toFixed(2),
                                credit: 0,
                                description: "Service Charge",
                                rack_rate: 0,
                                room_id: room.room_id,
                            });
                        }
                    }
                    child.push(ctx);
                }
            }
            /*  update booking total (only debits) */
            const totalDebit = child.reduce((s, c) => s + c.totalDebit, 0);
            /*  persist entries */
            const allEntries = [...child.flatMap((c) => c.entries)];
            // payment
            if (body.is_payment_given && body.payment && body.payment.amount > 0) {
                allEntries.push({
                    folio_id: child[0].folioId,
                    date: today,
                    posting_type: "Payment",
                    credit: body.payment.amount,
                    debit: 0,
                    description: "Payment for room booking",
                });
            }
            // insert in folio entries
            yield hotelInvModel.insertInFolioEntries(allEntries);
            // update room booking
            yield reservationModel.updateRoomBooking({ total_amount: totalDebit }, hotel_code, booking_id);
            return {
                childFolios: child.map((c) => ({
                    id: c.folioId,
                    folio_number: c.folioNumber,
                    room_id: c.roomId,
                })),
                entries: allEntries,
            };
        });
    }
    mapSingleBookingToFolioBody(singleBooking) {
        return {
            vat_percentage: singleBooking.vat_percentage,
            service_charge_percentage: singleBooking.service_charge_percentage,
            is_payment_given: singleBooking.payment_status === "paid",
            payment: {
                amount: singleBooking.total_amount,
            },
            booked_room_types: [
                {
                    rooms: singleBooking.booking_rooms.map((r) => ({
                        check_in: r.check_in,
                        check_out: r.check_out,
                        room_id: r.room_id,
                        rate: {
                            base_rate: r.base_rate,
                            changed_rate: r.changed_rate,
                        },
                    })),
                },
            ],
        };
    }
}
exports.SubBtocHotelService = SubBtocHotelService;
//# sourceMappingURL=btoc.subHotel.service.js.map