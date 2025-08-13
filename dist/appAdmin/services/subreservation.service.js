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
                passport_no: guest.passport_no,
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
            return { id: booking.id, booking_ref: ref };
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
                    if (room === null || room === void 0 ? void 0 : room.guest_info)
                        for (const guest of room === null || room === void 0 ? void 0 : room.guest_info) {
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
                                // is_lead_guest: guest.is_lead_guest,
                                guest_id: guestRes.id,
                                hotel_code,
                                is_room_primary_guest: guest.is_room_primary_guest,
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
                        console.log(room.guest_info);
                        let primaryGuestCount = 0;
                        for (const guest of room === null || room === void 0 ? void 0 : room.guest_info) {
                            if (guest.is_room_primary_guest) {
                                primaryGuestCount++;
                            }
                        }
                        if (!primaryGuestCount) {
                            throw new Error("At least one primary guest is required for each room.");
                        }
                        if (primaryGuestCount > 1) {
                            throw new Error("Only one primary guest is allowed per room.");
                        }
                        for (const guest of room.guest_info) {
                            const [guestRes] = yield this.Model.guestModel(this.trx).createGuestForGroupBooking({
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
    createRoomBookingFolioWithEntries({ body, booking_id, guest_id, req, booking_ref, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id: created_by } = req.hotel_admin;
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const reservationModel = this.Model.reservationModel(this.trx);
            const roomModel = this.Model.RoomModel(this.trx);
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
            const helper = new helperFunction_1.HelperFunction();
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            console.log({ heads, hotel_code });
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const voucher_no1 = yield helper.generateVoucherNo("JV", this.trx);
            yield accountModel.insertAccVoucher([
                {
                    acc_head_id: receivable_head.head_id,
                    created_by,
                    debit: totalDebit,
                    credit: 0,
                    description: `Receivable for individual room booking ${booking_ref}`,
                    voucher_date: today,
                    voucher_no: voucher_no1,
                    hotel_code,
                },
                {
                    acc_head_id: sales_head.head_id,
                    created_by,
                    debit: 0,
                    credit: totalDebit,
                    description: `Sales for individual room booking ${booking_ref}`,
                    voucher_date: today,
                    voucher_no: voucher_no1,
                    hotel_code,
                },
            ]);
            /*  persist entries */
            const allEntries = [...child.flatMap((c) => c.entries)];
            // payment
            if (body.is_payment_given && ((_a = body.payment) === null || _a === void 0 ? void 0 : _a.amount) > 0) {
                allEntries.push({
                    folio_id: child[0].folioId,
                    date: today,
                    posting_type: "Payment",
                    credit: body.payment.amount,
                    debit: 0,
                    description: "Payment for room booking",
                });
                const [acc] = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: body.payment.acc_id,
                });
                if (!acc)
                    throw new Error("Invalid Account");
                let voucher_type = "CCV";
                if (acc.acc_type === "BANK") {
                    voucher_type = "BCV";
                }
                const voucher_no = yield helper.generateVoucherNo(voucher_type, this.trx);
                const money_receipt_no = yield helper.generateMoneyReceiptNo(this.trx);
                const mRes = yield hotelInvModel.insertMoneyReceipt({
                    hotel_code,
                    receipt_date: today,
                    amount_paid: body.payment.amount,
                    payment_method: acc.acc_type,
                    receipt_no: money_receipt_no,
                    received_by: req.hotel_admin.id,
                    acc_id: body.payment.acc_id,
                    voucher_no,
                    notes: "Advance Payment",
                });
                yield hotelInvModel.insertFolioMoneyReceipt({
                    amount: body.payment.amount,
                    money_receipt_id: mRes[0].id,
                    folio_id: child[0].folioId,
                    booking_ref,
                });
                yield accountModel.insertAccVoucher([
                    {
                        acc_head_id: acc.acc_head_id,
                        created_by,
                        debit: body.payment.amount,
                        credit: 0,
                        description: `Payment collection for booking ${booking_ref}`,
                        voucher_date: today,
                        voucher_no,
                        hotel_code,
                    },
                    {
                        acc_head_id: receivable_head.head_id,
                        created_by,
                        debit: 0,
                        credit: body.payment.amount,
                        description: `Payment collected for booking ${booking_ref}`,
                        voucher_date: today,
                        voucher_no,
                        hotel_code,
                    },
                ]);
            }
            // insert in folio entries
            yield hotelInvModel.insertInFolioEntries(allEntries);
            // update room booking
            yield reservationModel.updateRoomBooking({ total_amount: totalDebit, voucher_no: voucher_no1 }, hotel_code, booking_id);
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
    // This service is for group room booking
    createGroupRoomBookingFolios({ body, booking_id, guest_id, booking_ref, req, }) {
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
                            });
                        }
                    }
                    child.push(ctx);
                }
            }
            /*  update booking total (only debits) */
            const totalDebitAmount = child.reduce((s, c) => s + c.totalDebit, 0);
            const helper = new helperFunction_1.HelperFunction();
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const voucher_no1 = yield helper.generateVoucherNo("JV", this.trx);
            yield accountModel.insertAccVoucher([
                {
                    acc_head_id: receivable_head.head_id,
                    created_by,
                    debit: totalDebitAmount,
                    credit: 0,
                    description: `Receivable for individual room booking ${booking_ref}`,
                    voucher_date: today,
                    voucher_no: voucher_no1,
                    hotel_code,
                },
                {
                    acc_head_id: sales_head.head_id,
                    created_by,
                    debit: 0,
                    credit: totalDebitAmount,
                    description: `Sales for individual room booking ${booking_ref}`,
                    voucher_date: today,
                    voucher_no: voucher_no1,
                    hotel_code,
                },
            ]);
            /* master‑level entries (payment + discount) */
            const masterEntries = [];
            // payment
            if (body.is_payment_given && ((_b = body.payment) === null || _b === void 0 ? void 0 : _b.amount) > 0) {
                if (!body.payment.acc_id)
                    throw new Error("Account ID is required for payment");
                masterEntries.push({
                    folio_id: masterFolio.id,
                    date: today,
                    posting_type: "Payment",
                    debit: 0,
                    credit: body.payment.amount,
                    room_id: 0,
                    description: "Payment Received",
                    rack_rate: 0,
                });
                const [acc] = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: body.payment.acc_id,
                });
                if (!acc)
                    throw new Error("Invalid Account");
                let voucher_type = "CCV";
                if (acc.acc_type === "BANK") {
                    voucher_type = "BCV";
                }
                const voucher_no = yield helper.generateVoucherNo(voucher_type, this.trx);
                // money receipt
                const money_receipt_no = yield helper.generateMoneyReceiptNo(this.trx);
                const mRes = yield hotelInvModel.insertMoneyReceipt({
                    hotel_code,
                    receipt_date: today,
                    amount_paid: body.payment.amount,
                    payment_method: acc.acc_type,
                    receipt_no: money_receipt_no,
                    received_by: req.hotel_admin.id,
                    voucher_no,
                    notes: "Advance Payment",
                    acc_id: body.payment.acc_id,
                });
                yield hotelInvModel.insertFolioMoneyReceipt({
                    amount: body.payment.amount,
                    money_receipt_id: mRes[0].id,
                    folio_id: masterFolio.id,
                    booking_ref,
                });
                // acc voucher
                yield accountModel.insertAccVoucher([
                    {
                        acc_head_id: acc.acc_head_id,
                        created_by,
                        debit: body.payment.amount,
                        credit: 0,
                        description: `Payment collection for booking ${booking_ref}`,
                        voucher_date: today,
                        voucher_no,
                        hotel_code,
                    },
                    {
                        acc_head_id: receivable_head.head_id,
                        created_by,
                        debit: 0,
                        credit: body.payment.amount,
                        description: `Payment collected for booking ${booking_ref}`,
                        voucher_date: today,
                        voucher_no,
                        hotel_code,
                    },
                ]);
            }
            /*  persist entries */
            const allEntries = [...masterEntries, ...child.flatMap((c) => c.entries)];
            yield hotelInvModel.insertInFolioEntries(allEntries);
            /*  update booking total (only debits) */
            const totalDebit = child.reduce((s, c) => s + c.totalDebit, 0);
            yield reservationModel.updateRoomBooking({ total_amount: totalDebit, voucher_no: voucher_no1 }, hotel_code, booking_id);
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
    handlePaymentAndFolioForAddPayment({ acc_id, amount, folio_id, remarks, req, booking_ref, booking_id, room_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountModel = this.Model.accountModel(this.trx);
            const hotel_code = req.hotel_admin.hotel_code;
            const [account] = yield accountModel.getSingleAccount({
                hotel_code: req.hotel_admin.hotel_code,
                id: acc_id,
            });
            if (!account)
                throw new Error("Invalid Account");
            const helper = new helperFunction_1.HelperFunction();
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const [acc] = yield accountModel.getSingleAccount({
                hotel_code: req.hotel_admin.hotel_code,
                id: acc_id,
            });
            if (!acc)
                throw new Error("Invalid Account");
            let voucher_type = "CCV";
            if (acc.acc_type === "BANK") {
                voucher_type = "BCV";
            }
            // check booking
            const booking = yield this.Model.reservationModel(this.trx).getSingleBooking(req.hotel_admin.hotel_code, booking_id);
            // const voucher_no = await helper.generateVoucherNo(voucher_type, this.trx);
            const today = new Date().toISOString().split("T")[0];
            const money_receipt_no = yield helper.generateMoneyReceiptNo(this.trx);
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            const mRes = yield hotelInvModel.insertMoneyReceipt({
                hotel_code,
                receipt_date: today,
                amount_paid: amount,
                payment_method: acc.acc_type,
                receipt_no: money_receipt_no,
                received_by: req.hotel_admin.id,
                voucher_no: booking === null || booking === void 0 ? void 0 : booking.voucher_no,
                notes: "Payment has been taken",
                acc_id,
            });
            yield hotelInvModel.insertFolioMoneyReceipt({
                amount,
                money_receipt_id: mRes[0].id,
                folio_id: folio_id,
                room_id,
                booking_ref,
            });
            if (booking === null || booking === void 0 ? void 0 : booking.voucher_no)
                yield accountModel.insertAccVoucher([
                    {
                        acc_head_id: acc.acc_head_id,
                        created_by: req.hotel_admin.id,
                        debit: amount,
                        credit: 0,
                        description: `Payment collection for booking ${booking_ref}`,
                        voucher_date: today,
                        voucher_no: booking === null || booking === void 0 ? void 0 : booking.voucher_no,
                        hotel_code,
                    },
                    {
                        acc_head_id: receivable_head.head_id,
                        created_by: req.hotel_admin.id,
                        debit: 0,
                        credit: amount,
                        description: `Payment collected for booking ${booking_ref}`,
                        voucher_date: today,
                        voucher_no: booking === null || booking === void 0 ? void 0 : booking.voucher_no,
                        hotel_code,
                    },
                ]);
            yield hotelInvModel.insertInFolioEntries({
                debit: 0,
                credit: amount,
                folio_id: folio_id,
                posting_type: "Payment",
                description: remarks,
            });
        });
    }
    handlePaymentAndFolioForRefundPayment({ acc_id, amount, folio_id, remarks, req, booking_id, booking_ref, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountModel = this.Model.accountModel(this.trx);
            const [account] = yield accountModel.getSingleAccount({
                hotel_code: req.hotel_admin.hotel_code,
                id: acc_id,
            });
            if (!account)
                throw new Error("Invalid Account");
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(req.hotel_admin.hotel_code, ["HOTEL_EXPENSE_HEAD_ID", "HOTEL_REVENUE_HEAD_ID"]);
            const expense_head = heads.find((h) => h.config === "HOTEL_EXPENSE_HEAD_ID");
            if (!expense_head) {
                throw new Error("HOTEL_EXPENSE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const [acc] = yield accountModel.getSingleAccount({
                hotel_code: req.hotel_admin.hotel_code,
                id: acc_id,
            });
            if (!acc)
                throw new Error("Invalid Account");
            let voucher_type = "CCV";
            if (acc.acc_type === "BANK") {
                voucher_type = "BCV";
            }
            // check booking
            const booking = yield this.Model.reservationModel(this.trx).getSingleBooking(req.hotel_admin.hotel_code, booking_id);
            // const voucher_no = await helper.generateVoucherNo(voucher_type, this.trx);
            const today = new Date().toISOString().split("T")[0];
            if (booking === null || booking === void 0 ? void 0 : booking.voucher_no)
                yield accountModel.insertAccVoucher([
                    {
                        acc_head_id: sales_head.head_id,
                        created_by: req.hotel_admin.id,
                        debit: amount,
                        credit: 0,
                        description: `Refund to guest for booking ${booking_ref}`,
                        voucher_date: today,
                        voucher_no: booking === null || booking === void 0 ? void 0 : booking.voucher_no,
                        hotel_code: req.hotel_admin.hotel_code,
                    },
                    {
                        acc_head_id: acc.acc_head_id,
                        created_by: req.hotel_admin.id,
                        debit: 0,
                        credit: amount,
                        description: `Refund payment to guest for booking ${booking_ref}`,
                        voucher_date: today,
                        voucher_no: booking === null || booking === void 0 ? void 0 : booking.voucher_no,
                        hotel_code: req.hotel_admin.hotel_code,
                    },
                ]);
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            yield hotelInvModel.insertInFolioEntries({
                debit: 0,
                credit: -amount,
                folio_id: folio_id,
                posting_type: "Refund",
                description: remarks,
            });
        });
    }
    changeRateForRoomInvidiualReservation({ body, booking_id, receivable_head, sales_head, bookingScPct, bookingVatPct, booking, req, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            // get single folio
            const primaryFolio = yield hotelInvModel.getFoliosbySingleBooking({
                hotel_code,
                booking_id,
                type: "Primary",
            });
            // folio entries
            const folioEntries = yield hotelInvModel.getFolioEntriesbyFolioID(hotel_code, primaryFolio[0].id);
            for (const change of body.changed_rate_of_booking_rooms) {
                const room = yield reservationModel.getSingleBookingRoom({
                    booking_id,
                    room_id: change.room_id,
                });
                if (!room)
                    continue;
                let prevRoomAmount = 0;
                const folioEntryIDs = folioEntries
                    .filter((fe) => {
                    if ((fe.posting_type == "ROOM_CHARGE" ||
                        fe.posting_type == "VAT" ||
                        fe.posting_type == "SERVICE_CHARGE") &&
                        fe.room_id == change.room_id) {
                        prevRoomAmount += Number(fe.debit);
                        return fe;
                    }
                })
                    .map((fe) => fe.id);
                if (folioEntryIDs.length) {
                    yield hotelInvModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
                }
                const nights = this.calculateNights(room.check_in, room.check_out);
                yield reservationModel.updateSingleBookingRoom({
                    unit_changed_rate: change.unit_changed_rate,
                    unit_base_rate: change.unit_base_rate,
                    changed_rate: change.unit_changed_rate * nights,
                    base_rate: change.unit_base_rate * nights,
                }, { room_id: room.room_id, booking_id });
                const newEntries = [];
                for (let i = 0; i < nights; i++) {
                    const date = this.addDays(room.check_in, i);
                    const tariff = change.unit_changed_rate;
                    const vat = (tariff * bookingVatPct) / 100;
                    const sc = (tariff * bookingScPct) / 100;
                    newEntries.push({
                        folio_id: primaryFolio[0].id,
                        description: "Room Tariff",
                        posting_type: "ROOM_CHARGE",
                        debit: tariff,
                        credit: 0,
                        date,
                        room_id: room.room_id,
                        rack_rate: room.base_rate,
                    });
                    if (vat > 0) {
                        newEntries.push({
                            folio_id: primaryFolio[0].id,
                            description: "VAT",
                            posting_type: "VAT",
                            debit: vat,
                            credit: 0,
                            room_id: room.room_id,
                            date,
                        });
                    }
                    if (sc > 0) {
                        newEntries.push({
                            folio_id: primaryFolio[0].id,
                            description: "Service Charge",
                            posting_type: "SERVICE_CHARGE",
                            debit: sc,
                            credit: 0,
                            date,
                            room_id: room.room_id,
                        });
                    }
                }
                // insert new folio entries
                let newTotalAmount = newEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
                if (newEntries.length) {
                    yield hotelInvModel.insertInFolioEntries(newEntries);
                }
                //------------------ Accounting ------------------//
                const difference = Math.abs(newTotalAmount - prevRoomAmount);
                const isIncrease = newTotalAmount > prevRoomAmount;
                const actionText = isIncrease ? "Increased rate" : "Decreased rate";
                const receivableEntry = {
                    acc_head_id: receivable_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? difference : 0,
                    credit: isIncrease ? 0 : difference,
                    description: `Receivable for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                const salesEntry = {
                    acc_head_id: sales_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? 0 : difference,
                    credit: isIncrease ? difference : 0,
                    description: `Sales for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            }
        });
    }
    changeRateForRoomInGroupReservation({ body, booking_id, receivable_head, sales_head, bookingScPct, bookingVatPct, booking, req, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            for (const change of body.changed_rate_of_booking_rooms) {
                const room = yield reservationModel.getSingleBookingRoom({
                    booking_id,
                    room_id: change.room_id,
                });
                if (!room)
                    continue;
                const [roomFolio] = yield hotelInvModel.getFolioWithEntriesbySingleBookingAndRoomID({
                    hotel_code,
                    booking_id,
                    room_ids: [room.room_id],
                });
                if (!roomFolio)
                    continue;
                let prevRoomAmount = 0;
                const folioEntryIDs = roomFolio.folio_entries
                    .filter((fe) => {
                    if (fe.posting_type == "ROOM_CHARGE" ||
                        fe.posting_type == "VAT" ||
                        fe.posting_type == "SERVICE_CHARGE") {
                        prevRoomAmount += Number(fe.debit);
                        return fe;
                    }
                })
                    .map((fe) => fe.entries_id);
                if (folioEntryIDs.length) {
                    yield hotelInvModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
                }
                const nights = this.calculateNights(room.check_in, room.check_out);
                yield reservationModel.updateSingleBookingRoom({
                    unit_changed_rate: change.unit_changed_rate,
                    unit_base_rate: change.unit_base_rate,
                    changed_rate: change.unit_changed_rate * nights,
                    base_rate: change.unit_base_rate * nights,
                }, { room_id: room.room_id, booking_id });
                const newEntries = [];
                for (let i = 0; i < nights; i++) {
                    const date = this.addDays(room.check_in, i);
                    const tariff = change.unit_changed_rate;
                    const vat = (tariff * bookingVatPct) / 100;
                    const sc = (tariff * bookingScPct) / 100;
                    newEntries.push({
                        folio_id: roomFolio.id,
                        description: "Room Tariff",
                        posting_type: "ROOM_CHARGE",
                        debit: tariff,
                        credit: 0,
                        date,
                        room_id: room.room_id,
                        rack_rate: room.base_rate,
                    });
                    if (vat > 0) {
                        newEntries.push({
                            folio_id: roomFolio.id,
                            description: "VAT",
                            posting_type: "VAT",
                            debit: vat,
                            credit: 0,
                            date,
                            room_id: room.room_id,
                        });
                    }
                    if (sc > 0) {
                        newEntries.push({
                            folio_id: roomFolio.id,
                            description: "Service Charge",
                            posting_type: "SERVICE_CHARGE",
                            debit: sc,
                            credit: 0,
                            date,
                            room_id: room.room_id,
                        });
                    }
                }
                // insert new folio entries
                let newTotalAmount = newEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
                if (newEntries.length) {
                    yield hotelInvModel.insertInFolioEntries(newEntries);
                }
                //------------------ Accounting ------------------//
                const difference = Math.abs(newTotalAmount - prevRoomAmount);
                const isIncrease = newTotalAmount > prevRoomAmount;
                const actionText = isIncrease ? "Increased rate" : "Decreased rate";
                const receivableEntry = {
                    acc_head_id: receivable_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? difference : 0,
                    credit: isIncrease ? 0 : difference,
                    description: `Receivable for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                const salesEntry = {
                    acc_head_id: sales_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? 0 : difference,
                    credit: isIncrease ? difference : 0,
                    description: `Sales for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            }
        });
    }
    addRoomInIndividualReservation({ body, req, booking_id, bookingScPct, bookingVatPct, receivable_head, sales_head, booking, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            // get primary folio
            const primaryFolio = yield hotelInvModel.getFoliosbySingleBooking({
                hotel_code,
                booking_id,
                type: "Primary",
            });
            if (!primaryFolio.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Primary folio not found",
                };
            }
            yield this.insertBookingRoomsForGroupBooking({
                booked_room_types: body.add_room_types,
                booking_id,
                hotel_code,
                is_checked_in: false,
            });
            yield this.updateAvailabilityWhenRoomBooking("booked", body.add_room_types, hotel_code);
            const { booking_rooms: freshRooms } = (yield reservationModel.getSingleBooking(hotel_code, booking_id));
            const addedIDs = body.add_room_types.flatMap((rt) => rt.rooms.map((r) => r.room_id));
            const freshMap = new Map(freshRooms.map((br) => [br.room_id, br]));
            const newlyAddedRooms = addedIDs
                .map((id) => freshMap.get(id))
                .filter(Boolean)
                .map((room) => ({
                room_id: room.room_id,
                room_type_id: room.room_type_id,
                unit_changed_rate: room.unit_changed_rate,
                unit_base_rate: room.unit_base_rate,
                check_in: room.check_in,
                check_out: room.check_out,
            }));
            for (const br of newlyAddedRooms) {
                const nights = this.calculateNights(br.check_in, br.check_out);
                const entries = [];
                for (let i = 0; i < nights; i++) {
                    const date = this.addDays(br.check_in, i);
                    const tariff = br.unit_changed_rate;
                    const vat = (tariff * bookingVatPct) / 100;
                    const sc = (tariff * bookingScPct) / 100;
                    entries.push({
                        folio_id: primaryFolio[0].id,
                        description: "Room Tariff",
                        posting_type: "ROOM_CHARGE",
                        debit: tariff,
                        credit: 0,
                        date,
                        room_id: br.room_id,
                    }, {
                        folio_id: primaryFolio[0].id,
                        description: "VAT",
                        posting_type: "VAT",
                        debit: vat,
                        credit: 0,
                        date,
                        room_id: br.room_id,
                    }, {
                        folio_id: primaryFolio[0].id,
                        description: "Service Charge",
                        posting_type: "SERVICE_CHARGE",
                        debit: sc,
                        credit: 0,
                        date,
                        room_id: br.room_id,
                    });
                }
                yield hotelInvModel.insertInFolioEntries(entries);
                const newTotalAmount = entries.reduce((acc, cu) => acc + Number(cu.debit), 0);
                // acc voucher
                yield accountModel.insertAccVoucher([
                    {
                        acc_head_id: receivable_head.head_id,
                        created_by: admin_id,
                        debit: newTotalAmount,
                        credit: 0,
                        description: `Receivable for add new room in reservation. Booking Ref ${booking.booking_reference}`,
                        voucher_date: today,
                        voucher_no: booking.voucher_no,
                        hotel_code,
                    },
                    {
                        acc_head_id: sales_head.head_id,
                        created_by: admin_id,
                        debit: 0,
                        credit: newTotalAmount,
                        description: `Sales for add new room in reservation. Booking Ref ${booking.booking_reference}`,
                        voucher_date: today,
                        voucher_no: booking.voucher_no,
                        hotel_code,
                    },
                ]);
            }
        });
    }
    addRoomInGroupReservation({ body, req, booking_id, bookingScPct, bookingVatPct, receivable_head, sales_head, booking, guest_id, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const roomModel = this.Model.RoomModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            yield this.insertBookingRoomsForGroupBooking({
                booked_room_types: body.add_room_types,
                booking_id,
                hotel_code,
                is_checked_in: false,
            });
            yield this.updateAvailabilityWhenRoomBooking("booked", body.add_room_types, hotel_code);
            const { booking_rooms: freshRooms } = (yield reservationModel.getSingleBooking(hotel_code, booking_id));
            const addedIDs = body.add_room_types.flatMap((rt) => rt.rooms.map((r) => r.room_id));
            const freshMap = new Map(freshRooms.map((br) => [br.room_id, br]));
            const newlyAddedRooms = addedIDs
                .map((id) => freshMap.get(id))
                .filter(Boolean)
                .map((room) => ({
                room_id: room.room_id,
                room_type_id: room.room_type_id,
                unit_changed_rate: room.unit_changed_rate,
                unit_base_rate: room.unit_base_rate,
                check_in: room.check_in,
                check_out: room.check_out,
            }));
            for (const br of newlyAddedRooms) {
                const [roomRow] = yield roomModel.getSingleRoom(hotel_code, br.room_id);
                const roomName = (_a = roomRow === null || roomRow === void 0 ? void 0 : roomRow.room_name) !== null && _a !== void 0 ? _a : br.room_id.toString();
                const [lastFolio] = yield hotelInvModel.getLasFolioId();
                const folio_number = helperFunction_1.HelperFunction.generateFolioNumber(lastFolio === null || lastFolio === void 0 ? void 0 : lastFolio.id);
                const [roomFolio] = yield hotelInvModel.insertInFolio({
                    hotel_code,
                    booking_id,
                    room_id: br.room_id,
                    type: "room_primary",
                    guest_id,
                    folio_number,
                    status: "open",
                    name: `Room ${roomName} Folio`,
                });
                const nights = this.calculateNights(br.check_in, br.check_out);
                const entries = [];
                for (let i = 0; i < nights; i++) {
                    const date = this.addDays(br.check_in, i);
                    const tariff = br.unit_changed_rate;
                    const vat = (tariff * bookingVatPct) / 100;
                    const sc = (tariff * bookingScPct) / 100;
                    entries.push({
                        folio_id: roomFolio.id,
                        description: "Room Tariff",
                        posting_type: "ROOM_CHARGE",
                        debit: tariff,
                        credit: 0,
                        date,
                        room_id: br.room_id,
                    }, {
                        folio_id: roomFolio.id,
                        description: "VAT",
                        posting_type: "VAT",
                        debit: vat,
                        credit: 0,
                        date,
                        room_id: br.room_id,
                    }, {
                        folio_id: roomFolio.id,
                        description: "Service Charge",
                        posting_type: "SERVICE_CHARGE",
                        debit: sc,
                        credit: 0,
                        date,
                        room_id: br.room_id,
                    });
                }
                yield hotelInvModel.insertInFolioEntries(entries);
                const newTotalAmount = entries.reduce((acc, cu) => acc + Number(cu.debit), 0);
                // acc voucher
                yield accountModel.insertAccVoucher([
                    {
                        acc_head_id: receivable_head.head_id,
                        created_by: admin_id,
                        debit: newTotalAmount,
                        credit: 0,
                        description: `Receivable for add new room in reservation. Booking Ref ${booking.booking_reference}`,
                        voucher_date: today,
                        voucher_no: booking.voucher_no,
                        hotel_code,
                    },
                    {
                        acc_head_id: sales_head.head_id,
                        created_by: admin_id,
                        debit: 0,
                        credit: newTotalAmount,
                        description: `Sales for add new room in reservation. Booking Ref ${booking.booking_reference}`,
                        voucher_date: today,
                        voucher_no: booking.voucher_no,
                        hotel_code,
                    },
                ]);
            }
        });
    }
    deleteRoomInIndividualReservation({ body, req, booking_id, bookingScPct, bookingVatPct, receivable_head, sales_head, booking, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const roomModel = this.Model.RoomModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            const removedIDs = [...new Set(body.removed_rooms)];
            const roomsBeingRemoved = booking.booking_rooms.filter((br) => removedIDs.includes(br.room_id));
            const bookingRoomIds = roomsBeingRemoved.map((br) => br.id);
            // delete booking room guest
            const res = yield reservationModel.deleteBookingRoomGuest({
                booking_room_ids: bookingRoomIds,
            });
            // delete booking rooms
            yield reservationModel.deleteBookingRooms(removedIDs, booking_id);
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_decrease",
                rooms: roomsBeingRemoved,
                hotel_code,
            });
            const primaryFolio = yield hotelInvModel.getFoliosbySingleBooking({
                hotel_code,
                booking_id,
                type: "Primary",
            });
            if (!primaryFolio.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Primary folio not found",
                };
            }
            // get folio entries
            const folioEntries = yield hotelInvModel.getFolioEntriesbyFolioID(hotel_code, primaryFolio[0].id);
            let total_debit_amount = 0;
            let total_credit_amount = 0;
            const folioEntryIDs = folioEntries
                .filter((fe) => body.removed_rooms.some((roomId) => roomId === fe.room_id))
                .map((fe) => {
                var _a, _b;
                total_credit_amount += Number((_a = fe.credit) !== null && _a !== void 0 ? _a : 0);
                total_debit_amount += Number((_b = fe.debit) !== null && _b !== void 0 ? _b : 0);
                return fe.id;
            });
            if (folioEntryIDs.length) {
                yield hotelInvModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
            }
            yield accountModel.insertAccVoucher([
                {
                    acc_head_id: receivable_head.head_id,
                    created_by: admin_id,
                    debit: 0,
                    credit: total_debit_amount - total_credit_amount,
                    description: `Receivable for remove room. Booking Ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                },
                {
                    acc_head_id: sales_head.head_id,
                    created_by: admin_id,
                    debit: total_debit_amount - total_credit_amount,
                    credit: 0,
                    description: `Sale for remove room. Booking Ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                },
            ]);
        });
    }
    deleteRoomInGroupReservation({ body, req, booking_id, bookingScPct, bookingVatPct, receivable_head, sales_head, booking, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const roomModel = this.Model.RoomModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            const removedIDs = [...new Set(body.removed_rooms)];
            const roomsBeingRemoved = booking.booking_rooms.filter((br) => removedIDs.includes(br.room_id));
            const bookingRoomIds = roomsBeingRemoved.map((br) => br.id);
            // delete booking room guest
            const res = yield reservationModel.deleteBookingRoomGuest({
                booking_room_ids: bookingRoomIds,
            });
            // delete booking rooms
            yield reservationModel.deleteBookingRooms(removedIDs, booking_id);
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_decrease",
                rooms: roomsBeingRemoved,
                hotel_code,
            });
            const roomFolios = yield hotelInvModel.getFolioWithEntriesbySingleBookingAndRoomID({
                hotel_code,
                booking_id,
                room_ids: removedIDs,
            });
            let total_debit_amount = 0;
            let total_credit_amount = 0;
            const folioEntryIDs = roomFolios.flatMap((f) => f.folio_entries
                .filter((fe) => {
                var _a, _b;
                total_credit_amount += Number((_a = fe.credit) !== null && _a !== void 0 ? _a : 0);
                total_debit_amount += Number((_b = fe.debit) !== null && _b !== void 0 ? _b : 0);
                return fe;
            })
                .map((fe) => fe.entries_id));
            const allFolioIDs = roomFolios
                .filter((f) => !(f === null || f === void 0 ? void 0 : f.is_void))
                .map((f) => f.id);
            if (folioEntryIDs.length) {
                yield hotelInvModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
            }
            if (allFolioIDs.length) {
                yield hotelInvModel.updateSingleFolio({ is_void: true }, { folioIds: allFolioIDs, booking_id, hotel_code });
            }
            yield accountModel.insertAccVoucher([
                {
                    acc_head_id: receivable_head.head_id,
                    created_by: admin_id,
                    debit: 0,
                    credit: total_debit_amount - total_credit_amount,
                    description: `Receivable for remove room. Booking Ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                },
                {
                    acc_head_id: sales_head.head_id,
                    created_by: admin_id,
                    debit: total_debit_amount - total_credit_amount,
                    credit: 0,
                    description: `Sale for remove room. Booking Ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                },
            ]);
        });
    }
    changeRoomOfAIndividualReservation({ booking_id, req, body, previouseRoom, booking, nights, new_rooms_rm_type_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { new_room_id, previous_room_id, base_rate, changed_rate } = body;
            const reservationModel = this.Model.reservationModel(this.trx);
            const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            let prevRoomAmount = 0;
            let newTotalAmount = 0;
            const primaryFolio = yield invoiceModel.getFoliosbySingleBooking({
                booking_id,
                hotel_code,
                type: "Primary",
            });
            if (!primaryFolio.length) {
                return {
                    success: false,
                    code: 404,
                    message: "Primary folio not found.",
                };
            }
            const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, primaryFolio[0].id);
            const folioEntryIDs = folioEntriesByFolio
                .filter((fe) => {
                if ((fe.posting_type == "ROOM_CHARGE" ||
                    fe.posting_type == "VAT" ||
                    fe.posting_type == "SERVICE_CHARGE") &&
                    fe.room_id == previous_room_id) {
                    prevRoomAmount += Number(fe.debit);
                    return fe;
                }
            })
                .map((fe) => fe.id);
            if (!folioEntryIDs.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Previous room folio entries not found",
                };
            }
            yield invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
            // update single boooking
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_decrease",
                rooms: [previouseRoom],
                hotel_code,
            });
            if (nights <= 0) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Invalid check‑in / check‑out dates.",
                };
            }
            const folioEntries = [];
            for (let i = 0; i < nights; i++) {
                const date = this.addDays(previouseRoom.check_in, i);
                const tariff = changed_rate;
                const vat = (tariff * booking.vat_percentage) / 100;
                const sc = (tariff * booking.service_charge_percentage) / 100;
                // Tariff
                folioEntries.push({
                    folio_id: primaryFolio[0].id,
                    date,
                    posting_type: "ROOM_CHARGE",
                    debit: tariff,
                    credit: 0,
                    room_id: new_room_id,
                    description: "Room Tariff",
                    rack_rate: base_rate,
                });
                // VAT
                if (vat > 0) {
                    folioEntries.push({
                        folio_id: primaryFolio[0].id,
                        date,
                        posting_type: "VAT",
                        debit: vat,
                        credit: 0,
                        description: "VAT",
                        rack_rate: 0,
                        room_id: new_room_id,
                    });
                }
                // Service Charge
                if (sc > 0) {
                    folioEntries.push({
                        folio_id: primaryFolio[0].id,
                        date,
                        posting_type: "SERVICE_CHARGE",
                        debit: sc,
                        credit: 0,
                        description: "Service Charge",
                        rack_rate: 0,
                        room_id: new_room_id,
                    });
                }
            }
            // insert new folio entries
            newTotalAmount = folioEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
            yield invoiceModel.insertInFolioEntries(folioEntries);
            // update single booking rooms
            yield reservationModel.updateSingleBookingRoom({
                room_id: new_room_id,
                room_type_id: new_rooms_rm_type_id,
                unit_changed_rate: changed_rate,
                unit_base_rate: base_rate,
                changed_rate: changed_rate * nights,
                base_rate: base_rate * nights,
            }, { booking_id, room_id: previous_room_id });
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_increase",
                rooms: [
                    {
                        check_in: previouseRoom.check_in,
                        check_out: previouseRoom.check_out,
                        room_type_id: new_rooms_rm_type_id,
                    },
                ],
                hotel_code,
            });
            //get folio entries calculation
            const { total_debit } = yield invoiceModel.getFolioEntriesCalculationByBookingID({
                booking_id,
                hotel_code,
            });
            yield reservationModel.updateRoomBooking({
                total_amount: total_debit,
            }, hotel_code, booking_id);
            //------------------ Accounting ------------------//
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const difference = Math.abs(newTotalAmount - prevRoomAmount);
            const isIncrease = newTotalAmount > prevRoomAmount;
            if (difference !== 0) {
                const receivableEntry = {
                    acc_head_id: receivable_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? difference : 0,
                    credit: isIncrease ? 0 : difference,
                    description: `Receivable for Change Room Of a reservation. Booking Ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                const salesEntry = {
                    acc_head_id: sales_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? 0 : difference,
                    credit: isIncrease ? difference : 0,
                    description: `Sales for Change Room Of a reservation. Booking Ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            }
        });
    }
    changeRoomOfAGroupReservation({ booking_id, req, body, previouseRoom, booking, nights, new_rooms_rm_type_id, checkNewRoom, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { new_room_id, previous_room_id, base_rate, changed_rate } = body;
            const reservationModel = this.Model.reservationModel(this.trx);
            const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            let prevRoomAmount = 0;
            let newTotalAmount = 0;
            // for group
            const roomFolios = yield invoiceModel.getFoliosbySingleBooking({
                booking_id,
                hotel_code,
                type: "room_primary",
            });
            if (!roomFolios.length) {
                return {
                    success: false,
                    code: 404,
                    message: "No room-primary folios found.",
                };
            }
            const prevRoomFolio = roomFolios.find((rf) => rf.room_id === previous_room_id);
            if (!prevRoomFolio) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Previous rooms folio not found",
                };
            }
            const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, prevRoomFolio.id);
            // const folioEntryIDs = folioEntriesByFolio.map((fe) => fe.id);
            const folioEntryIDs = folioEntriesByFolio
                .filter((fe) => {
                if (fe.posting_type == "ROOM_CHARGE" ||
                    fe.posting_type == "VAT" ||
                    fe.posting_type == "SERVICE_CHARGE") {
                    prevRoomAmount += Number(fe.debit);
                    return fe;
                }
            })
                .map((fe) => fe.id);
            if (!folioEntryIDs.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Previous room folio entries not found",
                };
            }
            yield invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
            // update single boooking
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_decrease",
                rooms: [previouseRoom],
                hotel_code,
            });
            if (nights <= 0) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Invalid check‑in / check‑out dates.",
                };
            }
            const folioEntries = [];
            for (let i = 0; i < nights; i++) {
                const date = this.addDays(previouseRoom.check_in, i);
                const tariff = changed_rate;
                const vat = (tariff * booking.vat_percentage) / 100;
                const sc = (tariff * booking.service_charge_percentage) / 100;
                // Tariff
                folioEntries.push({
                    folio_id: prevRoomFolio.id,
                    date,
                    posting_type: "ROOM_CHARGE",
                    debit: tariff,
                    credit: 0,
                    room_id: new_room_id,
                    description: "Room Tariff",
                    rack_rate: base_rate,
                });
                // VAT
                if (vat > 0) {
                    folioEntries.push({
                        folio_id: prevRoomFolio.id,
                        date,
                        posting_type: "VAT",
                        debit: vat,
                        credit: 0,
                        description: "VAT",
                        rack_rate: 0,
                    });
                }
                // Service Charge
                if (sc > 0) {
                    folioEntries.push({
                        folio_id: prevRoomFolio.id,
                        date,
                        posting_type: "SERVICE_CHARGE",
                        debit: sc,
                        credit: 0,
                        description: "Service Charge",
                        rack_rate: 0,
                    });
                }
            }
            // insert new folio entries
            newTotalAmount = folioEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
            yield invoiceModel.insertInFolioEntries(folioEntries);
            // update folio
            yield invoiceModel.updateSingleFolio({
                room_id: new_room_id,
                name: `Room ${checkNewRoom[0].room_name} Folio`,
            }, { hotel_code, booking_id, folio_id: prevRoomFolio.id });
            // update single booking rooms
            yield reservationModel.updateSingleBookingRoom({
                room_id: new_room_id,
                room_type_id: new_rooms_rm_type_id,
                unit_changed_rate: changed_rate,
                unit_base_rate: base_rate,
                changed_rate: changed_rate * nights,
                base_rate: base_rate * nights,
            }, { booking_id, room_id: previous_room_id });
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_increase",
                rooms: [
                    {
                        check_in: previouseRoom.check_in,
                        check_out: previouseRoom.check_out,
                        room_type_id: new_rooms_rm_type_id,
                    },
                ],
                hotel_code,
            });
            //get folio entries calculation
            const { total_debit } = yield invoiceModel.getFolioEntriesCalculationByBookingID({
                booking_id,
                hotel_code,
            });
            yield reservationModel.updateRoomBooking({
                total_amount: total_debit,
            }, hotel_code, booking_id);
            //------------------ Accounting ------------------//
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const difference = Math.abs(newTotalAmount - prevRoomAmount);
            const isIncrease = newTotalAmount > prevRoomAmount;
            if (difference !== 0) {
                const receivableEntry = {
                    acc_head_id: receivable_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? difference : 0,
                    credit: isIncrease ? 0 : difference,
                    description: `Receivable for Change Room Of a reservation. Booking Ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                const salesEntry = {
                    acc_head_id: sales_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? 0 : difference,
                    credit: isIncrease ? difference : 0,
                    description: `Sales for Change Room Of a reservation. Booking Ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            }
        });
    }
    individualRoomDatesChangeOfBookingForIndividual({ req, booking_id, nights, check_in, check_out, booking, bookingRoom, room_id, service_charge_percentage, vat_percentage, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            const { check_in: prevCheckIn, check_out: prevCheckOut, unit_base_rate, unit_changed_rate, room_type_id, } = bookingRoom;
            const primaryFolio = yield invoiceModel.getFoliosbySingleBooking({
                hotel_code,
                booking_id,
                type: "Primary",
            });
            const folioEntries = [];
            for (let i = 0; i < nights; i++) {
                const date = this.addDays(check_in, i);
                const tariff = unit_changed_rate;
                const vat = (tariff * vat_percentage) / 100;
                const sc = (tariff * service_charge_percentage) / 100;
                // Tariff
                folioEntries.push({
                    folio_id: primaryFolio[0].id,
                    date,
                    posting_type: "ROOM_CHARGE",
                    debit: tariff,
                    credit: 0,
                    room_id,
                    description: "Room Tariff",
                    rack_rate: unit_base_rate,
                });
                // VAT
                if (vat > 0) {
                    folioEntries.push({
                        folio_id: primaryFolio[0].id,
                        date,
                        posting_type: "VAT",
                        debit: vat,
                        credit: 0,
                        description: "VAT",
                        rack_rate: 0,
                        room_id,
                    });
                }
                // Service Charge
                if (sc > 0) {
                    folioEntries.push({
                        folio_id: primaryFolio[0].id,
                        date,
                        posting_type: "SERVICE_CHARGE",
                        debit: sc,
                        credit: 0,
                        description: "Service Charge",
                        rack_rate: 0,
                        room_id,
                    });
                }
            }
            const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, primaryFolio[0].id);
            let prevRoomAmount = 0;
            const folioEntryIDs = folioEntriesByFolio
                .filter((fe) => {
                if ((fe.posting_type == "ROOM_CHARGE" ||
                    fe.posting_type == "VAT" ||
                    fe.posting_type == "SERVICE_CHARGE") &&
                    fe.room_id == room_id) {
                    prevRoomAmount += Number(fe.debit);
                    return fe;
                }
            })
                .map((fe) => fe.id);
            if (!folioEntryIDs.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "No folio entries found for the specified room.",
                };
            }
            yield invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_decrease",
                rooms: [bookingRoom],
                hotel_code,
            });
            // insert new folio entries
            let newTotalAmount = folioEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
            yield invoiceModel.insertInFolioEntries(folioEntries);
            yield reservationModel.updateSingleBookingRoom({
                check_in,
                check_out,
                changed_rate: unit_changed_rate * nights,
                base_rate: unit_base_rate * nights,
            }, { room_id, booking_id });
            //------------------ Accounting ------------------//
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const difference = Math.abs(newTotalAmount - prevRoomAmount);
            const isIncrease = newTotalAmount > prevRoomAmount;
            const actionText = isIncrease
                ? "Increased Reservation Date"
                : "Decreased Reservation Date";
            const receivableEntry = {
                acc_head_id: receivable_head.head_id,
                created_by: admin_id,
                debit: isIncrease ? difference : 0,
                credit: isIncrease ? 0 : difference,
                description: `Receivable for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
                voucher_date: today,
                voucher_no: booking.voucher_no,
                hotel_code,
            };
            const salesEntry = {
                acc_head_id: sales_head.head_id,
                created_by: admin_id,
                debit: isIncrease ? 0 : difference,
                credit: isIncrease ? difference : 0,
                description: `Sales for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
                voucher_date: today,
                voucher_no: booking.voucher_no,
                hotel_code,
            };
            yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            // updat room availability
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_increase",
                rooms: [
                    Object.assign(Object.assign({}, bookingRoom), { check_in,
                        check_out }),
                ],
                hotel_code,
            });
        });
    }
    individualRoomDatesChangeOfBookingForGroup({ req, booking_id, nights, check_in, check_out, booking, bookingRoom, room_id, service_charge_percentage, vat_percentage, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            const { check_in: prevCheckIn, check_out: prevCheckOut, unit_base_rate, unit_changed_rate, room_type_id, } = bookingRoom;
            const roomFoliosByBooking = yield invoiceModel.getFoliosbySingleBooking({
                booking_id,
                hotel_code,
                type: "room_primary",
            });
            if (!roomFoliosByBooking.length) {
                return {
                    success: false,
                    code: 404,
                    message: "No room-primary folios found.",
                };
            }
            const prevRoomFolio = roomFoliosByBooking.find((rf) => rf.room_id === room_id);
            if (!prevRoomFolio) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Previous rooms folio not found",
                };
            }
            const folioEntries = [];
            for (let i = 0; i < nights; i++) {
                const date = this.addDays(check_in, i);
                const tariff = unit_changed_rate;
                const vat = (tariff * vat_percentage) / 100;
                const sc = (tariff * service_charge_percentage) / 100;
                // Tariff
                folioEntries.push({
                    folio_id: prevRoomFolio.id,
                    date,
                    posting_type: "ROOM_CHARGE",
                    debit: tariff,
                    credit: 0,
                    room_id,
                    description: "Room Tariff",
                    rack_rate: unit_base_rate,
                });
                // VAT
                if (vat > 0) {
                    folioEntries.push({
                        folio_id: prevRoomFolio.id,
                        date,
                        posting_type: "VAT",
                        debit: vat,
                        credit: 0,
                        description: "VAT",
                        rack_rate: 0,
                    });
                }
                // Service Charge
                if (sc > 0) {
                    folioEntries.push({
                        folio_id: prevRoomFolio.id,
                        date,
                        posting_type: "SERVICE_CHARGE",
                        debit: sc,
                        credit: 0,
                        description: "Service Charge",
                        rack_rate: 0,
                    });
                }
            }
            const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, prevRoomFolio.id);
            console.log({ folioEntriesByFolio });
            // const folioEntryIDs = folioEntriesByFolio.map((fe) => fe.id);
            let prevRoomAmount = 0;
            const folioEntryIDs = folioEntriesByFolio
                .filter((fe) => {
                if (fe.posting_type == "ROOM_CHARGE" ||
                    fe.posting_type == "VAT" ||
                    fe.posting_type == "SERVICE_CHARGE") {
                    prevRoomAmount += Number(fe.debit);
                    return fe;
                }
            })
                .map((fe) => fe.id);
            console.log({ room_id, folioEntryIDs, prevRoomAmount });
            if (!folioEntryIDs.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "No folio entries found for the specified room.",
                };
            }
            yield invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_decrease",
                rooms: [bookingRoom],
                hotel_code,
            });
            // insert new folio entries
            let newTotalAmount = folioEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
            yield invoiceModel.insertInFolioEntries(folioEntries);
            yield reservationModel.updateSingleBookingRoom({
                check_in,
                check_out,
                changed_rate: unit_changed_rate * nights,
                base_rate: unit_base_rate * nights,
            }, { room_id, booking_id });
            //------------------ Accounting ------------------//
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const difference = Math.abs(newTotalAmount - prevRoomAmount);
            const isIncrease = newTotalAmount > prevRoomAmount;
            const actionText = isIncrease
                ? "Increased Reservation Date"
                : "Decreased Reservation Date";
            const receivableEntry = {
                acc_head_id: receivable_head.head_id,
                created_by: admin_id,
                debit: isIncrease ? difference : 0,
                credit: isIncrease ? 0 : difference,
                description: `Receivable for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
                voucher_date: today,
                voucher_no: booking.voucher_no,
                hotel_code,
            };
            const salesEntry = {
                acc_head_id: sales_head.head_id,
                created_by: admin_id,
                debit: isIncrease ? 0 : difference,
                credit: isIncrease ? difference : 0,
                description: `Sales for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
                voucher_date: today,
                voucher_no: booking.voucher_no,
                hotel_code,
            };
            yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            // updat room availability
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_increase",
                rooms: [
                    Object.assign(Object.assign({}, bookingRoom), { check_in,
                        check_out }),
                ],
                hotel_code,
            });
        });
    }
    changeDateOfBookingForIndividual({ booking_rooms, nights, check_in, vat_percentage, service_charge_percentage, check_out, req, booking_id, booking, primaryFolio, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            const folioEntries = [];
            for (const room of booking_rooms) {
                for (let i = 0; i < nights; i++) {
                    const date = this.addDays(check_in, i);
                    const tariff = room.unit_changed_rate;
                    const vat = (tariff * vat_percentage) / 100;
                    const sc = (tariff * service_charge_percentage) / 100;
                    folioEntries.push({
                        folio_id: primaryFolio[0].id,
                        date,
                        posting_type: "ROOM_CHARGE",
                        debit: tariff,
                        credit: 0,
                        room_id: room.room_id,
                        description: "Room Tariff",
                        rack_rate: room.unit_base_rate,
                    });
                    if (vat > 0) {
                        folioEntries.push({
                            folio_id: primaryFolio[0].id,
                            date,
                            posting_type: "VAT",
                            debit: vat,
                            credit: 0,
                            room_id: room.room_id,
                            description: "VAT",
                            rack_rate: 0,
                        });
                    }
                    if (sc > 0) {
                        folioEntries.push({
                            folio_id: primaryFolio[0].id,
                            date,
                            posting_type: "SERVICE_CHARGE",
                            debit: sc,
                            credit: 0,
                            room_id: room.room_id,
                            description: "Service Charge",
                            rack_rate: 0,
                        });
                    }
                }
            }
            let newTotalAmount = folioEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
            const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, primaryFolio[0].id);
            let prevRoomAmount = 0;
            const entryIdsToVoid = folioEntriesByFolio
                .filter((fe) => {
                if ((fe.posting_type == "ROOM_CHARGE" ||
                    fe.posting_type == "VAT" ||
                    fe.posting_type == "SERVICE_CHARGE") &&
                    fe.room_id) {
                    prevRoomAmount += Number(fe.debit);
                    return fe;
                }
            })
                .map((fe) => fe.id);
            if (entryIdsToVoid.length) {
                yield invoiceModel.updateFolioEntries({ is_void: true }, entryIdsToVoid);
            }
            yield invoiceModel.insertInFolioEntries(folioEntries);
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_decrease",
                rooms: booking_rooms,
                hotel_code,
            });
            const updateRooms = [];
            for (const r of booking_rooms) {
                updateRooms.push(Object.assign(Object.assign({}, r), { check_in,
                    check_out, changed_rate: r.unit_changed_rate * nights, base_rate: r.unit_base_rate * nights }));
            }
            const roomsUpdate = updateRooms.map((r) => {
                return reservationModel.updateSingleBookingRoom({
                    check_in,
                    check_out,
                    changed_rate: r.unit_changed_rate * nights,
                    base_rate: r.unit_base_rate * nights,
                }, { room_id: r.room_id, booking_id });
            });
            yield Promise.all(roomsUpdate);
            //  Block inventory for new range
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_increase",
                rooms: updateRooms,
                hotel_code,
            });
            //------------------ Accounting ------------------//
            const helper = new helperFunction_1.HelperFunction();
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const difference = Math.abs(newTotalAmount - prevRoomAmount);
            const isIncrease = newTotalAmount > prevRoomAmount;
            const actionText = isIncrease
                ? "Increased Reservation Date"
                : "Decreased Reservation Date";
            if (difference !== 0) {
                const receivableEntry = {
                    acc_head_id: receivable_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? difference : 0,
                    credit: isIncrease ? 0 : difference,
                    description: `Receivable for ${actionText} of overall room booking ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                const salesEntry = {
                    acc_head_id: sales_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? 0 : difference,
                    credit: isIncrease ? difference : 0,
                    description: `Sales for ${actionText} of overall room booking ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            }
        });
    }
    changeDateOfBookingForGroupReservation({ booking_rooms, nights, check_in, vat_percentage, service_charge_percentage, check_out, req, booking_id, booking, primaryFolio, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            const folioEntries = [];
            for (const room of booking_rooms) {
                for (let i = 0; i < nights; i++) {
                    const date = this.addDays(check_in, i);
                    const tariff = room.unit_changed_rate;
                    const vat = (tariff * vat_percentage) / 100;
                    const sc = (tariff * service_charge_percentage) / 100;
                    folioEntries.push({
                        folio_id: primaryFolio[0].id,
                        date,
                        posting_type: "ROOM_CHARGE",
                        debit: tariff,
                        credit: 0,
                        room_id: room.room_id,
                        description: "Room Tariff",
                        rack_rate: room.unit_base_rate,
                    });
                    if (vat > 0) {
                        folioEntries.push({
                            folio_id: primaryFolio[0].id,
                            date,
                            posting_type: "VAT",
                            debit: vat,
                            credit: 0,
                            room_id: room.room_id,
                            description: "VAT",
                            rack_rate: 0,
                        });
                    }
                    if (sc > 0) {
                        folioEntries.push({
                            folio_id: primaryFolio[0].id,
                            date,
                            posting_type: "SERVICE_CHARGE",
                            debit: sc,
                            credit: 0,
                            room_id: room.room_id,
                            description: "Service Charge",
                            rack_rate: 0,
                        });
                    }
                }
            }
            let newTotalAmount = folioEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
            const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, primaryFolio[0].id);
            let prevRoomAmount = 0;
            const entryIdsToVoid = folioEntriesByFolio
                .filter((fe) => {
                if ((fe.posting_type == "ROOM_CHARGE" ||
                    fe.posting_type == "VAT" ||
                    fe.posting_type == "SERVICE_CHARGE") &&
                    fe.room_id) {
                    prevRoomAmount += Number(fe.debit);
                    return fe;
                }
            })
                .map((fe) => fe.id);
            if (entryIdsToVoid.length) {
                yield invoiceModel.updateFolioEntries({ is_void: true }, entryIdsToVoid);
            }
            yield invoiceModel.insertInFolioEntries(folioEntries);
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_decrease",
                rooms: booking_rooms,
                hotel_code,
            });
            const updateRooms = [];
            for (const r of booking_rooms) {
                updateRooms.push(Object.assign(Object.assign({}, r), { check_in,
                    check_out, changed_rate: r.unit_changed_rate * nights, base_rate: r.unit_base_rate * nights }));
            }
            const roomsUpdate = updateRooms.map((r) => {
                return reservationModel.updateSingleBookingRoom({
                    check_in,
                    check_out,
                    changed_rate: r.unit_changed_rate * nights,
                    base_rate: r.unit_base_rate * nights,
                }, { room_id: r.room_id, booking_id });
            });
            yield Promise.all(roomsUpdate);
            //  Block inventory for new range
            yield this.updateRoomAvailabilityService({
                reservation_type: "booked_room_increase",
                rooms: updateRooms,
                hotel_code,
            });
            //------------------ Accounting ------------------//
            const helper = new helperFunction_1.HelperFunction();
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const difference = Math.abs(newTotalAmount - prevRoomAmount);
            const isIncrease = newTotalAmount > prevRoomAmount;
            const actionText = isIncrease
                ? "Increased Reservation Date"
                : "Decreased Reservation Date";
            if (difference !== 0) {
                const receivableEntry = {
                    acc_head_id: receivable_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? difference : 0,
                    credit: isIncrease ? 0 : difference,
                    description: `Receivable for ${actionText} of overall room booking ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                const salesEntry = {
                    acc_head_id: sales_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? 0 : difference,
                    credit: isIncrease ? difference : 0,
                    description: `Sales for ${actionText} of overall room booking ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            }
        });
    }
}
exports.SubReservationService = SubReservationService;
//# sourceMappingURL=subreservation.service.js.map