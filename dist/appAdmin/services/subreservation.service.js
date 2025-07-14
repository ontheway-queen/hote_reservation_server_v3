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
exports.SubReservationService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const helperFunction_1 = require("../utlis/library/helperFunction");
class SubReservationService extends abstract_service_1.default {
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
        //  Convert to Date and zero out the time‑of‑day at UTC midnight
        const base = typeof date === "string" ? new Date(`${date}T00:00:00Z`) : new Date(date);
        base.setUTCHours(0, 0, 0, 0);
        base.setUTCDate(base.getUTCDate() + days);
        return base.toISOString().slice(0, 10);
    }
    findOrCreateGuest(guest, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const guestModel = this.Model.guestModel(this.trx);
            const [insertedGuest] = yield guestModel.createGuest({
                hotel_code,
                first_name: guest.first_name,
                last_name: guest.last_name,
                country_id: guest.country_id,
                email: guest.email,
                phone: guest.phone,
                address: guest.address,
            });
            return insertedGuest.id;
        });
    }
    calculateTotals(rooms, nights, fees) {
        let total_changed_price = 0;
        rooms.forEach((room) => {
            total_changed_price += room.rate.changed_price * room.number_of_rooms;
        });
        const total = total_changed_price * nights;
        const total_amount = total + fees.vat * nights + fees.service_charge * nights;
        return { total_amount, sub_total: total };
    }
    calculateTotalsForGroupBooking(booked_room_types, nights, fees) {
        let total_changed_price = 0;
        booked_room_types.forEach((rt) => {
            rt.rooms.forEach((room) => {
                total_changed_price += room.rate.changed_rate * rt.rooms.length;
            });
        });
        const total = total_changed_price * nights;
        const total_amount = total + fees.vat * nights + fees.service_charge * nights;
        console.log({ total_amount });
        return { total_amount, sub_total: total };
    }
    calculateTotalsForGroupBookingv2(booked_room_types, fees) {
        let sub_total = 0;
        for (const rt of booked_room_types) {
            for (const room of rt.rooms) {
                const from = new Date(room.check_in);
                const to = new Date(room.check_out);
                const diffTime = Math.abs(to.getTime() - from.getTime());
                const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                sub_total += room.rate.changed_rate * nights;
            }
        }
        const vat_amount = (sub_total * fees.vat) / 100;
        const service_charge_amount = (sub_total * fees.service_charge) / 100;
        const total_amount = sub_total + vat_amount + service_charge_amount;
        return {
            total_amount,
            sub_total,
        };
    }
    calculateTotalsByBookingRooms(rooms, nights) {
        let total_changed_price = 0;
        rooms.forEach((room) => {
            total_changed_price += room.unit_changed_rate;
        });
        const total_amount = total_changed_price * nights;
        return { total_amount };
    }
    createMainBooking({ payload, hotel_code, guest_id, sub_total, total_amount, is_checked_in, total_nights, }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const reservation_model = this.Model.reservationModel(this.trx);
            const last = yield reservation_model.getLastBooking();
            const lastId = (_b = (_a = last === null || last === void 0 ? void 0 : last[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : 1;
            const ref = lib_1.default.generateBookingReferenceWithId(`BK`, lastId);
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
                vat: payload.vat,
                service_charge: payload.service_charge,
                discount_amount: payload.discount_amount,
                source_id: payload.source_id,
                created_by: payload.created_by,
                comments: payload.special_requests,
                booking_type: payload.booking_type,
                status: is_checked_in ? "checked_in" : "confirmed",
                drop: payload.drop,
                drop_time: payload.drop_time,
                drop_to: payload.drop_to,
                pickup: payload.pickup,
                pickup_from: payload.pickup_from,
                pickup_time: payload.pickup_time,
                is_company_booked: payload.is_company_booked,
                company_name: payload.company_name,
                visit_purpose: payload.visit_purpose,
                service_charge_percentage: payload.service_charge_percentage,
                vat_percentage: payload.vat_percentage,
            });
            return booking;
        });
    }
    insertBookingRooms({ booked_room_types, booking_id, nights, hotel_code, is_checked_in, }) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const rt of booked_room_types) {
                for (const room of rt.rooms) {
                    // Insert booking room
                    const [bookingRoomRes] = yield this.Model.reservationModel(this.trx).insertBookingRoom([
                        {
                            check_in: room.check_in,
                            check_out: room.check_out,
                            status: is_checked_in ? "checked_in" : "confirmed",
                            booking_id,
                            room_id: room.room_id,
                            room_type_id: rt.room_type_id,
                            adults: room.adults,
                            children: room.children,
                            infant: room.infant,
                            base_rate: room.rate.base_rate * nights,
                            changed_rate: room.rate.changed_rate * nights,
                            unit_base_rate: room.rate.base_rate,
                            unit_changed_rate: room.rate.changed_rate,
                            cbf: room.cbf,
                        },
                    ]);
                    const booking_room_id = bookingRoomRes.id;
                    // Insert guests and booking_room_guests
                    for (const guest of room.guest_info) {
                        const [guestRes] = yield this.Model.guestModel(this.trx).createGuestForGroupBooking({
                            first_name: guest.first_name,
                            last_name: guest.last_name,
                            email: guest.email,
                            address: guest.address,
                            country_id: guest.country_id,
                            phone: guest.phone,
                            hotel_code,
                        });
                        yield this.Model.reservationModel(this.trx).insertBookingRoomGuest({
                            is_lead_guest: guest.is_lead_guest,
                            guest_id: guestRes.id,
                            hotel_code,
                            booking_room_id,
                        });
                    }
                }
            }
        });
    }
    insertBookingRoomsForGroupBooking({ booked_room_types, booking_id, hotel_code, is_checked_in, }) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const rt of booked_room_types) {
                for (const room of rt.rooms) {
                    const nights = helperFunction_1.HelperFunction.calculateNights(room.check_in, room.check_out);
                    // Insert booking room
                    const [bookingRoomRes] = yield this.Model.reservationModel(this.trx).insertBookingRoom([
                        {
                            check_in: room.check_in,
                            check_out: room.check_out,
                            status: is_checked_in ? "checked_in" : "confirmed",
                            booking_id,
                            room_id: room.room_id,
                            room_type_id: rt.room_type_id,
                            adults: room.adults,
                            children: room.children,
                            infant: room.infant,
                            base_rate: room.rate.base_rate * nights,
                            changed_rate: room.rate.changed_rate * nights,
                            unit_base_rate: room.rate.base_rate,
                            unit_changed_rate: room.rate.changed_rate,
                            cbf: room.cbf,
                        },
                    ]);
                    const booking_room_id = bookingRoomRes.id;
                    // Insert guests and booking_room_guests
                    if (room === null || room === void 0 ? void 0 : room.guest_info) {
                        for (const guest of room.guest_info) {
                            const [guestRes] = yield this.Model.guestModel(this.trx).createGuestForGroupBooking({
                                first_name: guest.first_name,
                                last_name: guest.last_name,
                                email: guest.email,
                                address: guest.address,
                                country_id: guest.country_id,
                                phone: guest.phone,
                                hotel_code,
                            });
                            yield this.Model.reservationModel(this.trx).insertBookingRoomGuest({
                                is_lead_guest: guest.is_lead_guest,
                                guest_id: guestRes.id,
                                hotel_code,
                                booking_room_id,
                            });
                        }
                    }
                }
            }
        });
    }
    // async insertInBookingRoomsBySingleBookingRooms(
    //   rooms: BookingRoom[],
    //   booking_id: number,
    //   nights: number
    // ) {
    //   const payload: IbookingRooms[] = [];
    //   rooms.forEach((room) => {
    //     const base_rate = room.unit_base_rate * nights;
    //     const changed_rate = room.unit_changed_rate * nights;
    //     rooms.forEach((room) => {
    //       payload.push({
    //         check_in: room.check_in,
    //         check_out: room.check_out,
    //         booking_id,
    //         room_id: room.room_id,
    //         room_type_id: room.room_type_id,
    //         adults: room.adults,
    //         children: room.children,
    //         infant: room.infant,
    //         base_rate,
    //         changed_rate,
    //         unit_base_rate: room.unit_base_rate,
    //         unit_changed_rate: room.unit_changed_rate,
    //       });
    //     });
    //   });
    //   await this.Model.reservationModel(this.trx).insertBookingRoom(payload);
    // }
    updateAvailabilityWhenRoomBooking(reservation_type, booked_room_types, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservation_model = this.Model.reservationModel(this.trx);
            for (const { rooms, room_type_id } of booked_room_types) {
                for (const { check_in, check_out } of rooms) {
                    const dates = helperFunction_1.HelperFunction.getDatesBetween(check_in, check_out);
                    const updatePromises = dates.map((date) => {
                        if (reservation_type === "booked") {
                            return reservation_model.updateRoomAvailability({
                                type: "booked_room_increase",
                                hotel_code,
                                room_type_id,
                                date,
                                rooms_to_book: 1,
                            });
                        }
                        else {
                            return reservation_model.updateRoomAvailabilityHold({
                                hotel_code,
                                room_type_id,
                                date,
                                rooms_to_book: 1,
                                type: "hold_increase",
                            });
                        }
                    });
                    yield Promise.all(updatePromises);
                }
            }
        });
    }
    updateRoomAvailabilityService({ reservation_type, rooms, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservation_model = this.Model.reservationModel(this.trx);
            for (const { check_in, check_out, room_type_id } of rooms) {
                const dates = helperFunction_1.HelperFunction.getDatesBetween(check_in, check_out);
                const updatePromises = dates.map((date) => {
                    if (reservation_type === "booked_room_increase") {
                        return reservation_model.updateRoomAvailability({
                            type: "booked_room_increase",
                            hotel_code,
                            room_type_id,
                            date,
                            rooms_to_book: 1,
                        });
                    }
                    else if (reservation_type === "booked_room_decrease") {
                        return reservation_model.updateRoomAvailability({
                            type: "booked_room_decrease",
                            hotel_code,
                            room_type_id,
                            date,
                            rooms_to_book: 1,
                        });
                    }
                    else if (reservation_type == "hold_increase") {
                        return reservation_model.updateRoomAvailabilityHold({
                            hotel_code,
                            room_type_id,
                            date,
                            rooms_to_book: 1,
                            type: "hold_increase",
                        });
                    }
                    else {
                        return reservation_model.updateRoomAvailabilityHold({
                            hotel_code,
                            room_type_id,
                            date,
                            rooms_to_book: 1,
                            type: "hold_decrease",
                        });
                    }
                });
                yield Promise.all(updatePromises);
            }
        });
    }
    handlePaymentAndFolioForBooking({ booking_id, is_payment_given, guest_id, req, total_amount, payment, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountModel = this.Model.accountModel(this.trx);
            let voucherData;
            if (is_payment_given) {
                if (!payment)
                    throw new Error("Payment data is required when is_payment_given is true");
                const [account] = yield accountModel.getSingleAccount({
                    hotel_code: req.hotel_admin.hotel_code,
                    id: payment.acc_id,
                });
                if (!account)
                    throw new Error("Invalid Account");
                const voucher_no = yield new helperFunction_1.HelperFunction().generateVoucherNo();
                const [voucher] = yield accountModel.insertAccVoucher({
                    acc_head_id: account.acc_head_id,
                    created_by: req.hotel_admin.id,
                    debit: payment.amount,
                    credit: 0,
                    description: "For room booking payment",
                    voucher_type: "PAYMENT",
                    voucher_date: new Date().toISOString(),
                    voucher_no,
                });
                voucherData = voucher;
            }
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            const [lastFolio] = yield hotelInvModel.getLasFolioId();
            const folio_number = helperFunction_1.HelperFunction.generateFolioNumber(lastFolio === null || lastFolio === void 0 ? void 0 : lastFolio.id);
            const [folio] = yield hotelInvModel.insertInFolio({
                booking_id,
                folio_number,
                guest_id,
                hotel_code: req.hotel_admin.hotel_code,
                name: "Reservation",
                status: "open",
                type: "Primary",
            });
            console.log({ folio });
            yield hotelInvModel.insertInFolioEntries({
                acc_voucher_id: voucherData === null || voucherData === void 0 ? void 0 : voucherData.id,
                debit: total_amount,
                credit: 0,
                folio_id: folio.id,
                posting_type: "Charge",
                description: "room booking",
            });
            if (is_payment_given) {
                if (!payment)
                    throw new Error("Payment data is required when is_payment_given is true");
                yield hotelInvModel.insertInFolioEntries({
                    acc_voucher_id: voucherData.id,
                    debit: 0,
                    credit: payment.amount,
                    folio_id: folio.id,
                    posting_type: "Payment",
                    description: "Payment given",
                });
            }
            const guestModel = this.Model.guestModel(this.trx);
            yield guestModel.insertGuestLedger({
                hotel_code: req.hotel_admin.hotel_code,
                guest_id,
                credit: 0,
                remarks: "Owes for booking",
                debit: total_amount,
            });
            if (is_payment_given) {
                if (!payment)
                    throw new Error("Payment data is required when is_payment_given is true");
                yield guestModel.insertGuestLedger({
                    hotel_code: req.hotel_admin.hotel_code,
                    guest_id,
                    credit: payment.amount,
                    remarks: "Paid amount for booking",
                    debit: 0,
                });
            }
        });
    }
    // public async createRoomBookingFolioWithEntries({
    //   body,
    //   booking_id,
    //   guest_id,
    //   req,
    // }: {
    //   req: Request;
    //   body: IGBookingRequestBody;
    //   booking_id: number;
    //   guest_id: number;
    // }) {
    //   const hotel_code = req.hotel_admin.hotel_code;
    //   const created_by = req.hotel_admin.id;
    //   const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    //   const today = new Date().toISOString().split("T")[0];
    //   // 1. Generate Folio Number
    //   const [lastFolio] = await hotelInvModel.getLasFolioId();
    //   const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);
    //   // 2. Insert Folio
    //   const [folio] = await hotelInvModel.insertInFolio({
    //     booking_id,
    //     folio_number,
    //     guest_id,
    //     hotel_code,
    //     name: "Reservation",
    //     status: "open",
    //     type: "Primary",
    //   });
    //   // 3. Generate Folio Entries (in correct order per date)
    //   const folioEntries: IinsertFolioEntriesPayload[] = [];
    //   const dailyChargesMap = new Map<
    //     string,
    //     { roomCharges: IinsertFolioEntriesPayload[]; totalRate: number }
    //   >();
    //   for (const { rooms } of body.booked_room_types) {
    //     for (const room of rooms) {
    //       const checkInDate = new Date(room.check_in);
    //       const checkOutDate = new Date(room.check_out);
    //       for (
    //         let d = new Date(checkInDate);
    //         d < checkOutDate;
    //         d = new Date(d.getTime() + 86400000)
    //       ) {
    //         const date = d.toISOString().split("T")[0];
    //         const entry: IinsertFolioEntriesPayload = {
    //           folio_id: folio.id,
    //           date,
    //           posting_type: "Charge",
    //           debit: room.rate.changed_rate,
    //           credit: 0,
    //           room_id: room.room_id,
    //           description: "Room Tariff",
    //           rack_rate: room.rate.base_rate,
    //         };
    //         if (!dailyChargesMap.has(date)) {
    //           dailyChargesMap.set(date, {
    //             roomCharges: [entry],
    //             totalRate: room.rate.changed_rate,
    //           });
    //         } else {
    //           const existing = dailyChargesMap.get(date)!;
    //           existing.roomCharges.push(entry);
    //           existing.totalRate += room.rate.changed_rate;
    //         }
    //       }
    //     }
    //   }
    //   // Push entries in ASC date order
    //   const sortedDates = [...dailyChargesMap.keys()].sort();
    //   for (const date of sortedDates) {
    //     const { roomCharges, totalRate } = dailyChargesMap.get(date)!;
    //     // 1. Push all room charges for this date
    //     folioEntries.push(...roomCharges);
    //     // 2. Push VAT (if applicable)
    //     if (body.vat && body.vat > 0) {
    //       folioEntries.push({
    //         folio_id: folio.id,
    //         date,
    //         posting_type: "Charge",
    //         debit: (body.vat_percentage * totalRate) / 100,
    //         credit: 0,
    //         room_id: 0,
    //         description: "VAT",
    //         rack_rate: 0,
    //       });
    //     }
    //     // 3. Push Service Charge (if applicable)
    //     if (body.service_charge && body.service_charge > 0) {
    //       folioEntries.push({
    //         folio_id: folio.id,
    //         date,
    //         posting_type: "Charge",
    //         debit: (body.service_charge_percentage * totalRate) / 100,
    //         credit: 0,
    //         room_id: 0,
    //         description: "Service Charge",
    //         rack_rate: 0,
    //       });
    //     }
    //   }
    //   // 4. Handle Payment (optional)
    //   if (body.is_payment_given && body.payment && body.payment.amount > 0) {
    //     const accountModel = this.Model.accountModel(this.trx);
    //     const [account] = await accountModel.getSingleAccount({
    //       hotel_code,
    //       id: body.payment.acc_id,
    //     });
    //     if (!account) {
    //       throw new Error("Invalid Account");
    //     }
    //     const voucher_no = await new HelperFunction().generateVoucherNo();
    //     const [voucher] = await accountModel.insertAccVoucher({
    //       acc_head_id: account.acc_head_id,
    //       created_by,
    //       debit: body.payment.amount,
    //       credit: 0,
    //       description: `Payment for booking ${booking_id}`,
    //       voucher_type: "PAYMENT",
    //       voucher_date: today,
    //       voucher_no,
    //     });
    //     folioEntries.push({
    //       folio_id: folio.id,
    //       acc_voucher_id: voucher.id,
    //       date: today,
    //       posting_type: "Payment",
    //       debit: 0,
    //       credit: body.payment.amount,
    //       room_id: 0,
    //       description: "Payment Received",
    //       rack_rate: 0,
    //     });
    //   }
    //   // 5. Insert all folio entries
    //   await hotelInvModel.insertInFolioEntries(folioEntries);
    //   // 6. Update total amount on booking
    //   const totalDebit = folioEntries.reduce(
    //     (sum, entry) => sum + (entry.debit ?? 0),
    //     0
    //   );
    //   await this.Model.reservationModel(this.trx).updateRoomBooking(
    //     {
    //       total_amount: totalDebit,
    //     },
    //     hotel_code,
    //     booking_id
    //   );
    //   return {
    //     folio,
    //     entries: folioEntries,
    //   };
    // }
    createRoomBookingFolioWithEntries({ body, booking_id, guest_id, req, }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id: created_by } = req.hotel_admin;
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const reservationModel = this.Model.reservationModel(this.trx);
            const roomModel = this.Model.RoomModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const [lastFolio] = yield hotelInvModel.getLasFolioId();
            const child = [];
            const push = (c, e) => {
                var _a;
                c.entries.push(e);
                c.totalDebit += (_a = e.debit) !== null && _a !== void 0 ? _a : 0;
            };
            for (const { rooms } of body.booked_room_types) {
                for (const room of rooms) {
                    const [info] = yield roomModel.getSingleRoom(hotel_code, room.room_id);
                    const folioNo = `R${(_a = info === null || info === void 0 ? void 0 : info.room_name) !== null && _a !== void 0 ? _a : room.room_id}`;
                    const [roomFolio] = yield hotelInvModel.insertInFolio({
                        booking_id,
                        folio_number: folioNo,
                        guest_id,
                        hotel_code,
                        name: `Room ${info.room_name} Folio`,
                        status: "open",
                        type: "room_primary",
                        room_id: room.room_id,
                    });
                    const ctx = {
                        folioId: roomFolio.id,
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
                            posting_type: "Charge",
                            debit: rate,
                            credit: 0,
                            description: "Room Tariff",
                            rack_rate: room.rate.base_rate,
                        });
                        // VAT
                        if (body.vat_percentage > 0) {
                            push(ctx, {
                                folio_id: ctx.folioId,
                                date,
                                posting_type: "Charge",
                                debit: +((rate * body.vat_percentage) / 100).toFixed(2),
                                credit: 0,
                                description: "VAT",
                                rack_rate: 0,
                            });
                        }
                        // Service charge
                        if (body.service_charge_percentage > 0) {
                            push(ctx, {
                                folio_id: ctx.folioId,
                                date,
                                posting_type: "Charge",
                                debit: +((rate * body.service_charge_percentage) / 100).toFixed(2),
                                credit: 0,
                                room_id: room.room_id,
                                description: "Service Charge",
                                rack_rate: 0,
                            });
                        }
                    }
                    child.push(ctx);
                }
            }
            /* master‑level entries (payment + discount) */
            const masterEntries = [];
            // payment
            if (body.is_payment_given && ((_b = body.payment) === null || _b === void 0 ? void 0 : _b.amount) > 0) {
                const [acc] = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: body.payment.acc_id,
                });
                if (!acc)
                    throw new Error("Invalid Account");
                const voucher_no = yield new helperFunction_1.HelperFunction().generateVoucherNo();
                const [voucher] = yield accountModel.insertAccVoucher({
                    acc_head_id: acc.acc_head_id,
                    created_by,
                    debit: body.payment.amount,
                    credit: 0,
                    description: `Payment for group booking ${booking_id}`,
                    voucher_type: "PAYMENT",
                    voucher_date: today,
                    voucher_no,
                });
            }
            /*  persist entries */
            const allEntries = [...masterEntries, ...child.flatMap((c) => c.entries)];
            yield hotelInvModel.insertInFolioEntries(allEntries);
            /*  update booking total (only debits) */
            const totalDebit = child.reduce((s, c) => s + c.totalDebit, 0);
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
    // public async createGroupRoomBookingFoliosV2({
    //   body,
    //   booking_id,
    //   guest_id,
    //   req,
    // }: {
    //   req: Request;
    //   body: IGBookingRequestBody;
    //   booking_id: number;
    //   guest_id: number;
    // }) {
    //   // --- Context & Models ------------------------------------
    //   const hotel_code = req.hotel_admin.hotel_code;
    //   const created_by = req.hotel_admin.id;
    //   const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    //   const accountModel = this.Model.accountModel(this.trx);
    //   const reservationModel = this.Model.reservationModel(this.trx);
    //   const roomModel = this.Model.RoomModel(this.trx);
    //   const today = new Date().toISOString().split("T")[0];
    //   // --- 1) Master Folio -------------------------------------
    //   const [lastFolio] = await hotelInvModel.getLasFolioId();
    //   const masterFolioNumber = HelperFunction.generateFolioNumber(lastFolio?.id);
    //   const [masterFolio] = await hotelInvModel.insertInFolio({
    //     booking_id,
    //     folio_number: masterFolioNumber,
    //     guest_id,
    //     hotel_code,
    //     name: `Group Folio #${booking_id}`,
    //     status: "open",
    //     type: FolioType.GROUP_MASTER,
    //   });
    //   // --- 2) Child Folios + Entries ---------------------------
    //   interface ChildCtx {
    //     folioId: number;
    //     folioNumber: string;
    //     roomId: number;
    //     entries: IinsertFolioEntriesPayload[];
    //     totalDebit: number;
    //   }
    //   const childList: ChildCtx[] = [];
    //   const push = (ctx: ChildCtx, e: IinsertFolioEntriesPayload) => {
    //     ctx.entries.push(e);
    //     ctx.totalDebit += e.debit ?? 0;
    //   };
    //   for (const { rooms } of body.booked_room_types) {
    //     for (const room of rooms) {
    //       // (a) create room folio
    //       const [singleRoom] = await roomModel.getSingleRoom(
    //         hotel_code,
    //         room.room_id
    //       );
    //       const childFolioNumber = `${masterFolioNumber}-R${
    //         singleRoom?.room_name ?? room.room_id
    //       }`;
    //       const [childFolio] = await hotelInvModel.insertInFolio({
    //         booking_id,
    //         folio_number: childFolioNumber,
    //         guest_id,
    //         hotel_code,
    //         name: `Room ${singleRoom.room_name} Folio`,
    //         status: "open",
    //         type: FolioType.ROOM_PRIMARY,
    //         parent_folio_id: masterFolio.id,
    //         room_id: room.room_id,
    //         window_no: WindowBucket.ROOM_CHARGES,
    //       });
    //       const ctx: ChildCtx = {
    //         folioId: childFolio.id,
    //         folioNumber: childFolioNumber,
    //         roomId: room.room_id,
    //         entries: [],
    //         totalDebit: 0,
    //       };
    //       // (b) build daily rates map
    //       const dailyRate: Record<string, number> = {};
    //       for (
    //         let d = new Date(room.check_in);
    //         d < new Date(room.check_out);
    //         d.setDate(d.getDate() + 1)
    //       ) {
    //         dailyRate[d.toISOString().split("T")[0]] = room.rate.changed_rate;
    //       }
    //       // (c) push entries date ASC  – Tariff ➜ VAT ➜ SC
    //       const orderedDates = Object.keys(dailyRate).sort(); // ASC
    //       for (const date of orderedDates) {
    //         const rate = dailyRate[date];
    //         // Room Tariff
    //         push(ctx, {
    //           folio_id: ctx.folioId,
    //           date,
    //           posting_type: PostingType.CHARGE,
    //           debit: rate,
    //           credit: 0,
    //           room_id: room.room_id,
    //           description: "Room Tariff",
    //           rack_rate: room.rate.base_rate,
    //           window_no: WindowBucket.ROOM_CHARGES,
    //         });
    //         // VAT
    //         if (body.vat_percentage > 0) {
    //           push(ctx, {
    //             folio_id: ctx.folioId,
    //             date,
    //             posting_type: PostingType.CHARGE,
    //             debit: +((rate * body.vat_percentage) / 100).toFixed(2),
    //             credit: 0,
    //             room_id: room.room_id,
    //             description: "VAT",
    //             rack_rate: 0,
    //             window_no: WindowBucket.ROOM_CHARGES,
    //           });
    //         }
    //         // Service Charge
    //         if (body.service_charge_percentage > 0) {
    //           push(ctx, {
    //             folio_id: ctx.folioId,
    //             date,
    //             posting_type: PostingType.CHARGE,
    //             debit: +((rate * body.service_charge_percentage) / 100).toFixed(
    //               2
    //             ),
    //             credit: 0,
    //             room_id: room.room_id,
    //             description: "Service Charge",
    //             rack_rate: 0,
    //             window_no: WindowBucket.ROOM_CHARGES,
    //           });
    //         }
    //       }
    //       childList.push(ctx);
    //     }
    //   }
    //   // --- 3) Payment on Master (optional) ---------------------
    //   const masterEntries: IinsertFolioEntriesPayload[] = [];
    //   if (body.is_payment_given && body.payment?.amount > 0) {
    //     const [account] = await accountModel.getSingleAccount({
    //       hotel_code,
    //       id: body.payment.acc_id,
    //     });
    //     if (!account) throw new Error("Invalid Account");
    //     const voucher_no = await new HelperFunction().generateVoucherNo();
    //     const [voucher] = await accountModel.insertAccVoucher({
    //       acc_head_id: account.acc_head_id,
    //       created_by,
    //       debit: body.payment.amount,
    //       credit: 0,
    //       description: `Payment for group booking ${booking_id}`,
    //       voucher_type: "PAYMENT",
    //       voucher_date: today,
    //       voucher_no,
    //     });
    //     masterEntries.push({
    //       folio_id: masterFolio.id,
    //       acc_voucher_id: voucher.id,
    //       date: today,
    //       posting_type: PostingType.PAYMENT,
    //       debit: 0,
    //       credit: body.payment.amount,
    //       room_id: 0,
    //       description: "Payment Received",
    //       rack_rate: 0,
    //       window_no: WindowBucket.ROOM_CHARGES,
    //     });
    //   }
    //   // --- 4) Persist all entries ------------------------------
    //   const allEntries = [
    //     ...masterEntries,
    //     ...childList.flatMap((c) => c.entries),
    //   ];
    //   await hotelInvModel.insertInFolioEntries(allEntries);
    //   // --- 5) Update booking total -----------------------------
    //   const totalDebit = childList.reduce((sum, c) => sum + c.totalDebit, 0);
    //   await reservationModel.updateRoomBooking(
    //     { total_amount: totalDebit },
    //     hotel_code,
    //     booking_id
    //   );
    //   // --- 6) Return ------------------------------------------
    //   return {
    //     masterFolio,
    //     childFolios: childList.map((c) => ({
    //       id: c.folioId,
    //       folio_number: c.folioNumber,
    //       room_id: c.roomId,
    //     })),
    //     entries: allEntries,
    //   };
    // }
    createGroupRoomBookingFolios({ body, booking_id, guest_id, req, }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id: created_by } = req.hotel_admin;
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const reservationModel = this.Model.reservationModel(this.trx);
            const roomModel = this.Model.RoomModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const [lastFolio] = yield hotelInvModel.getLasFolioId();
            const masterNo = helperFunction_1.HelperFunction.generateFolioNumber(lastFolio === null || lastFolio === void 0 ? void 0 : lastFolio.id);
            const [masterFolio] = yield hotelInvModel.insertInFolio({
                booking_id,
                folio_number: masterNo,
                guest_id,
                hotel_code,
                name: `Group Folio #${booking_id}`,
                status: "open",
                type: "group_master",
            });
            const child = [];
            const push = (c, e) => {
                var _a;
                c.entries.push(e);
                c.totalDebit += (_a = e.debit) !== null && _a !== void 0 ? _a : 0;
            };
            for (const { rooms } of body.booked_room_types) {
                for (const room of rooms) {
                    const [info] = yield roomModel.getSingleRoom(hotel_code, room.room_id);
                    const folioNo = `${masterNo}-R${(_a = info === null || info === void 0 ? void 0 : info.room_name) !== null && _a !== void 0 ? _a : room.room_id}`;
                    const [roomFolio] = yield hotelInvModel.insertInFolio({
                        booking_id,
                        folio_number: folioNo,
                        guest_id,
                        hotel_code,
                        name: `Room ${info.room_name} Folio`,
                        status: "open",
                        type: "room_primary",
                        room_id: room.room_id,
                    });
                    const ctx = {
                        folioId: roomFolio.id,
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
                            posting_type: "Charge",
                            debit: rate,
                            credit: 0,
                            description: "Room Tariff",
                            rack_rate: room.rate.base_rate,
                        });
                        // VAT
                        if (body.vat_percentage > 0) {
                            push(ctx, {
                                folio_id: ctx.folioId,
                                date,
                                posting_type: "Charge",
                                debit: +((rate * body.vat_percentage) / 100).toFixed(2),
                                credit: 0,
                                description: "VAT",
                                rack_rate: 0,
                            });
                        }
                        // Service charge
                        if (body.service_charge_percentage > 0) {
                            push(ctx, {
                                folio_id: ctx.folioId,
                                date,
                                posting_type: "Charge",
                                debit: +((rate * body.service_charge_percentage) / 100).toFixed(2),
                                credit: 0,
                                room_id: room.room_id,
                                description: "Service Charge",
                                rack_rate: 0,
                            });
                        }
                    }
                    child.push(ctx);
                }
            }
            /* master‑level entries (payment + discount) */
            const masterEntries = [];
            // payment
            if (body.is_payment_given && ((_b = body.payment) === null || _b === void 0 ? void 0 : _b.amount) > 0) {
                const [acc] = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: body.payment.acc_id,
                });
                if (!acc)
                    throw new Error("Invalid Account");
                const voucher_no = yield new helperFunction_1.HelperFunction().generateVoucherNo();
                const [voucher] = yield accountModel.insertAccVoucher({
                    acc_head_id: acc.acc_head_id,
                    created_by,
                    debit: body.payment.amount,
                    credit: 0,
                    description: `Payment for group booking ${booking_id}`,
                    voucher_type: "PAYMENT",
                    voucher_date: today,
                    voucher_no,
                });
                masterEntries.push({
                    folio_id: masterFolio.id,
                    acc_voucher_id: voucher.id,
                    date: today,
                    posting_type: "Payment",
                    debit: 0,
                    credit: body.payment.amount,
                    room_id: 0,
                    description: "Payment Received",
                    rack_rate: 0,
                });
            }
            /*  persist entries */
            const allEntries = [...masterEntries, ...child.flatMap((c) => c.entries)];
            yield hotelInvModel.insertInFolioEntries(allEntries);
            /*  update booking total (only debits) */
            const totalDebit = child.reduce((s, c) => s + c.totalDebit, 0);
            yield reservationModel.updateRoomBooking({ total_amount: totalDebit }, hotel_code, booking_id);
            return {
                masterFolio,
                childFolios: child.map((c) => ({
                    id: c.folioId,
                    folio_number: c.folioNumber,
                    room_id: c.roomId,
                })),
                entries: allEntries,
            };
        });
    }
    handlePaymentAndFolioForAddPayment({ acc_id, amount, folio_id, guest_id, remarks, req, payment_for, payment_date, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountModel = this.Model.accountModel(this.trx);
            const [account] = yield accountModel.getSingleAccount({
                hotel_code: req.hotel_admin.hotel_code,
                id: acc_id,
            });
            if (!account)
                throw new Error("Invalid Account");
            const voucher_no = yield new helperFunction_1.HelperFunction().generateVoucherNo();
            const [voucher] = yield accountModel.insertAccVoucher({
                acc_head_id: account.acc_head_id,
                created_by: req.hotel_admin.id,
                debit: amount,
                credit: 0,
                description: remarks,
                voucher_type: "PAYMENT",
                voucher_date: payment_date,
                voucher_no,
            });
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            yield hotelInvModel.insertInFolioEntries({
                acc_voucher_id: voucher.id,
                debit: 0,
                credit: amount,
                folio_id: folio_id,
                posting_type: "Payment",
                description: remarks,
            });
            const guestModel = this.Model.guestModel(this.trx);
            yield guestModel.insertGuestLedger({
                hotel_code: req.hotel_admin.hotel_code,
                guest_id,
                credit: amount,
                remarks: payment_for,
                debit: 0,
            });
        });
    }
    handlePaymentAndFolioForRefundPayment({ acc_id, amount, folio_id, guest_id, remarks, req, payment_for, payment_date, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountModel = this.Model.accountModel(this.trx);
            const [account] = yield accountModel.getSingleAccount({
                hotel_code: req.hotel_admin.hotel_code,
                id: acc_id,
            });
            if (!account)
                throw new Error("Invalid Account");
            const voucher_no = yield new helperFunction_1.HelperFunction().generateVoucherNo();
            const [voucher] = yield accountModel.insertAccVoucher({
                acc_head_id: account.acc_head_id,
                created_by: req.hotel_admin.id,
                debit: 0,
                credit: amount,
                description: remarks,
                voucher_type: "REFUND",
                voucher_date: payment_date,
                voucher_no,
            });
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            yield hotelInvModel.insertInFolioEntries({
                acc_voucher_id: voucher.id,
                debit: 0,
                credit: -amount,
                folio_id: folio_id,
                posting_type: "Refund",
                description: remarks,
            });
            const guestModel = this.Model.guestModel(this.trx);
            yield guestModel.insertGuestLedger({
                hotel_code: req.hotel_admin.hotel_code,
                guest_id,
                credit: 0,
                remarks: payment_for,
                debit: amount,
            });
        });
    }
}
exports.SubReservationService = SubReservationService;
//# sourceMappingURL=subreservation.service.js.map