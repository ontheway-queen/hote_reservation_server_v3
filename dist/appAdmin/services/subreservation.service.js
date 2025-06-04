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
    findOrCreateGuest(guest, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const guestModel = this.Model.guestModel(this.trx);
            const { data: existingGuests } = yield guestModel.getAllGuest({
                email: guest.email,
                hotel_code,
            });
            if (existingGuests.length)
                return existingGuests[0].id;
            const [insertedGuest] = yield guestModel.createGuest({
                hotel_code,
                first_name: guest.first_name,
                last_name: guest.last_name,
                nationality: guest.nationality,
                email: guest.email,
                phone: guest.phone,
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
        const total_amount = total + fees.vat + fees.service_charge - fees.discount;
        const sub_total = total + fees.vat + fees.service_charge;
        return { total_amount, sub_total };
    }
    createMainBooking({ payload, hotel_code, guest_id, sub_total, total_amount, is_checked_in, }) {
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
                total_amount,
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
            });
            return booking;
        });
    }
    insertBookingRooms(rooms, booking_id, nights) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = [];
            rooms.forEach((room) => {
                const base_rate = room.rate.base_price * nights;
                const changed_rate = room.rate.changed_price * nights;
                room.guests.forEach((guest) => {
                    payload.push({
                        booking_id,
                        room_id: guest.room_id,
                        room_type_id: room.room_type_id,
                        adults: guest.adults,
                        children: guest.children,
                        infant: guest.infant,
                        base_rate,
                        changed_rate,
                    });
                });
            });
            yield this.Model.reservationModel(this.trx).insertBookingRoom(payload);
        });
    }
    updateAvailabilityWhenRoomBooking(reservation_type, rooms, checkIn, checkOut, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservation_model = this.Model.reservationModel(this.trx);
            const dates = helperFunction_1.HelperFunction.getDatesBetween(checkIn, checkOut);
            const reservedRoom = rooms.map((item) => ({
                room_type_id: item.room_type_id,
                total_room: item.guests.length,
            }));
            for (const { room_type_id, total_room } of reservedRoom) {
                for (const date of dates) {
                    if (reservation_type === "confirm") {
                        yield reservation_model.updateRoomAvailability({
                            type: "booked_room_increase",
                            hotel_code,
                            room_type_id,
                            date,
                            rooms_to_book: total_room,
                        });
                    }
                    else {
                        yield reservation_model.updateRoomAvailabilityHold({
                            hotel_code,
                            room_type_id,
                            date,
                            rooms_to_book: total_room,
                            type: "hold_increase",
                        });
                    }
                }
            }
        });
    }
    updateRoomAvailabilityService(type, rooms, checkIn, checkOut, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservation_model = this.Model.reservationModel(this.trx);
            const dates = helperFunction_1.HelperFunction.getDatesBetween(checkIn, checkOut);
            const uniqueRooms = Object.values(rooms.reduce((acc, curr) => {
                if (!acc[curr.room_type_id]) {
                    acc[curr.room_type_id] = {
                        room_type_id: curr.room_type_id,
                        total_room: 1,
                    };
                }
                else {
                    acc[curr.room_type_id].total_room += 1;
                }
                return acc;
            }, {}));
            for (const { room_type_id, total_room } of uniqueRooms) {
                for (const date of dates) {
                    yield reservation_model.updateRoomAvailability({
                        type,
                        hotel_code,
                        room_type_id,
                        date,
                        rooms_to_book: total_room,
                    });
                }
            }
        });
    }
    updateRoomAvailabilityForHoldService(hold_type, rooms, checkIn, checkOut, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservation_model = this.Model.reservationModel(this.trx);
            const dates = helperFunction_1.HelperFunction.getDatesBetween(checkIn, checkOut);
            const uniqueRooms = Object.values(rooms.reduce((acc, curr) => {
                if (!acc[curr.room_type_id]) {
                    acc[curr.room_type_id] = {
                        room_type_id: curr.room_type_id,
                        total_room: 1,
                    };
                }
                else {
                    acc[curr.room_type_id].total_room += 1;
                }
                return acc;
            }, {}));
            console.log({ dates, uniqueRooms });
            for (const { room_type_id, total_room } of uniqueRooms) {
                for (const date of dates) {
                    yield reservation_model.updateRoomAvailabilityHold({
                        hotel_code,
                        room_type_id,
                        date,
                        rooms_to_book: total_room,
                        type: hold_type,
                    });
                }
            }
        });
    }
    handlePaymentAndFolioForBooking(is_payment_given, payment, guest_id, req, total_amount, booking_id) {
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
                name: "Room Booking",
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
                description: "For Add Money." + " " + remarks,
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
                description: payment_for + " " + remarks,
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
                debit: amount,
                credit: 0,
                folio_id: folio_id,
                posting_type: "Refund",
                description: payment_for + " " + remarks,
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