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
        return { total_amount };
    }
    calculateTotalsForGroupBooking(booked_room_types, nights, fees) {
        let total_changed_price = 0;
        booked_room_types.forEach((rt) => {
            rt.rooms.forEach((room) => {
                total_changed_price += room.rate.changed_rate * rt.rooms.length;
            });
        });
        console.log({ total_changed_price, nights });
        const total = total_changed_price * nights;
        console.log({ total });
        console.log({ fees });
        const total_amount = total + fees.vat * nights + fees.service_charge * nights;
        console.log({ total_amount });
        return { total_amount };
    }
    calculateTotalsByBookingRooms(rooms, nights) {
        let total_changed_price = 0;
        rooms.forEach((room) => {
            total_changed_price += room.unit_changed_rate;
        });
        const total_amount = total_changed_price * nights;
        return { total_amount };
    }
    createMainBooking({ payload, hotel_code, guest_id, 
    // sub_total,
    total_amount, is_checked_in, total_nights, }) {
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
                // sub_total,
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
                        unit_base_rate: room.rate.base_price,
                        unit_changed_rate: room.rate.changed_price,
                        cbf: guest.cbf,
                    });
                });
            });
            yield this.Model.reservationModel(this.trx).insertBookingRoom(payload);
        });
    }
    // async insertBookingRoomsForGroupBooking(
    //   booked_room_types: IGBookedRoomTypeRequest[],
    //   booking_id: number,
    //   nights: number,
    //   hotel_code: number
    // ) {
    //   const payload: IbookingRooms[] = [];
    //   booked_room_types.forEach(async (rt) => {
    //     let adults = 0,
    //       childs = 0,
    //       infants = 0;
    //     rt.rooms.forEach((room) => {
    //       room.guest_info.forEach((guest) => {
    //         if (guest.type === "adult") {
    //           adults++;
    //         } else if (guest.type === "child") {
    //           childs++;
    //         } else {
    //           infants++;
    //         }
    //       });
    //     });
    //     rt.rooms.forEach((room) => {
    //       payload.push({
    //         booking_id,
    //         room_id: room.room_id,
    //         room_type_id: rt.room_type_id,
    //         adults: adults,
    //         children: childs,
    //         infant: infants,
    //         base_rate: room.rate.base_rate,
    //         changed_rate: room.rate.changed_rate,
    //         unit_base_rate: room.rate.base_rate * nights,
    //         unit_changed_rate: room.rate.changed_rate * nights,
    //         cbf: room.cbf,
    //       });
    //     });
    //     await Promise.all(
    //       // first will be insert in booking room
    //       rt.rooms.map(async (room) => {
    //         const bookingRoomRes = await this.Model.reservationModel(
    //           this.trx
    //         ).insertBookingRoom(payload);
    //         room.guest_info.forEach(async (guest) => {
    //           // insert in guest
    //           const guestRes = await this.Model.guestModel(
    //             this.trx
    //           ).createGuestForGroupBooking({
    //             first_name: guest.first_name,
    //             hotel_code,
    //             last_name: guest.last_name,
    //             email: guest.email,
    //             address: guest.address,
    //             country_id: guest.country_id,
    //             phone: guest.phone,
    //           });
    //           // insert in booking room guest
    //           await this.Model.reservationModel(this.trx).insertBookingRoomGuest({
    //             is_lead_guest: guest.is_lead_guest,
    //             guest_id: guestRes[0].id,
    //             hotel_code,
    //             booking_room_id: bookingRoomRes[0].id,
    //           });
    //         });
    //       })
    //     );
    //   });
    // }
    insertBookingRoomsForGroupBooking(booked_room_types, booking_id, nights, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const rt of booked_room_types) {
                // let adults = 0,
                //   childs = 0,
                //   infants = 0;
                // Count guests
                // for (const room of rt.rooms) {
                //   for (const guest of room.guest_info) {
                //     if (guest.type === "adult") adults++;
                //     else if (guest.type === "child") childs++;
                //     else infants++;
                //   }
                // }
                for (const room of rt.rooms) {
                    // Insert booking room
                    const [bookingRoomRes] = yield this.Model.reservationModel(this.trx).insertBookingRoom([
                        {
                            booking_id,
                            room_id: room.room_id,
                            room_type_id: rt.room_type_id,
                            adults: room.adults,
                            children: room.children,
                            infant: room.infant,
                            base_rate: room.rate.base_rate,
                            changed_rate: room.rate.changed_rate,
                            unit_base_rate: room.rate.base_rate * nights,
                            unit_changed_rate: room.rate.changed_rate * nights,
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
    insertInBookingRoomsBySingleBookingRooms(rooms, booking_id, nights) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = [];
            rooms.forEach((room) => {
                const base_rate = room.unit_base_rate * nights;
                const changed_rate = room.unit_changed_rate * nights;
                rooms.forEach((room) => {
                    payload.push({
                        booking_id,
                        room_id: room.room_id,
                        room_type_id: room.room_type_id,
                        adults: room.adults,
                        children: room.children,
                        infant: room.infant,
                        base_rate,
                        changed_rate,
                        unit_base_rate: room.unit_base_rate,
                        unit_changed_rate: room.unit_changed_rate,
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
                    if (reservation_type === "booked") {
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
    updateAvailabilityWhenGroupRoomBooking(reservation_type, booked_room_types, checkIn, checkOut, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservation_model = this.Model.reservationModel(this.trx);
            const dates = helperFunction_1.HelperFunction.getDatesBetween(checkIn, checkOut);
            const reservedRoom = booked_room_types.map((rt) => ({
                room_type_id: rt.room_type_id,
                total_room: rt.rooms.length,
            }));
            for (const { room_type_id, total_room } of reservedRoom) {
                for (const date of dates) {
                    if (reservation_type === "booked") {
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
    createRoomBookingFolioWithEntries({ body, booking_id, guest_id, req, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            // 1. Generate Folio Number
            const [lastFolio] = yield hotelInvModel.getLasFolioId();
            const folio_number = helperFunction_1.HelperFunction.generateFolioNumber(lastFolio === null || lastFolio === void 0 ? void 0 : lastFolio.id);
            // 2. Insert Folio
            const [folio] = yield hotelInvModel.insertInFolio({
                booking_id,
                folio_number,
                guest_id,
                hotel_code: req.hotel_admin.hotel_code,
                name: "Reservation",
                status: "open",
                type: "Primary",
            });
            // 3. Generate Folio Entries per night in proper order
            const folioEntriesBookingPayload = [];
            const checkInDate = new Date(body.check_in);
            const checkOutDate = new Date(body.check_out);
            for (let currentDate = new Date(checkInDate); currentDate < checkOutDate; currentDate.setDate(currentDate.getDate() + 1)) {
                const formattedDate = currentDate.toISOString().split("T")[0];
                // 1. Room Tariff
                body.rooms.forEach((room) => {
                    room.guests.forEach((guest) => {
                        folioEntriesBookingPayload.push({
                            folio_id: folio.id,
                            date: formattedDate,
                            posting_type: "Charge",
                            debit: room.rate.changed_price,
                            room_id: guest.room_id,
                            description: `Room Tariff`,
                            rack_rate: room.rate.base_price,
                        });
                    });
                });
                // 2. VAT
                if (body.vat && body.vat > 0) {
                    folioEntriesBookingPayload.push({
                        folio_id: folio.id,
                        date: formattedDate,
                        posting_type: "Charge",
                        debit: body.vat,
                        room_id: 0,
                        description: `VAT`,
                        rack_rate: 0,
                    });
                }
                // 3. Service Charge
                if (body.service_charge && body.service_charge > 0) {
                    folioEntriesBookingPayload.push({
                        folio_id: folio.id,
                        date: formattedDate,
                        posting_type: "Charge",
                        debit: body.service_charge,
                        room_id: 0,
                        description: `Service Charge`,
                        rack_rate: 0,
                    });
                }
            }
            // 4. Payment (if given)
            const today = new Date().toISOString().split("T")[0];
            if (body.is_payment_given && ((_a = body.payment) === null || _a === void 0 ? void 0 : _a.amount) > 0) {
                // const accountModel = this.Model.accountModel(this.trx);
                // const [account] = await accountModel.getSingleAccount({
                //   hotel_code: req.hotel_admin.hotel_code,
                //   id: body.payment.acc_id,
                // });
                // if (!account) throw new Error("Invalid Account");
                // const voucher_no = await new HelperFunction().generateVoucherNo();
                // const [voucher] = await accountModel.insertAccVoucher({
                //   acc_head_id: account.acc_head_id,
                //   created_by: req.hotel_admin.id,
                //   debit: body.payment.amount,
                //   credit: 0,
                //   description: `Payment for booking ${booking_id}`,
                //   voucher_type: "PAYMENT",
                //   voucher_date: today,
                //   voucher_no,
                // });
                folioEntriesBookingPayload.push({
                    folio_id: folio.id,
                    // acc_voucher_id:voucher.id,
                    date: today,
                    posting_type: "Payment",
                    credit: body.payment.amount,
                    room_id: 0,
                    description: `Payment Received`,
                    rack_rate: 0,
                });
            }
            // 5. Insert All Entries
            yield hotelInvModel.insertInFolioEntries(folioEntriesBookingPayload);
            return {
                folio,
                entries: folioEntriesBookingPayload,
            };
        });
    }
    // public async createGroupRoomBookingFolioWithEntries({
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
    //   const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    //   // 1. Generate Folio Number
    //   const [lastFolio] = await hotelInvModel.getLasFolioId();
    //   const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);
    //   // 2. Insert Folio
    //   const [folio] = await hotelInvModel.insertInFolio({
    //     booking_id,
    //     folio_number,
    //     guest_id,
    //     hotel_code: req.hotel_admin.hotel_code,
    //     name: "Reservation",
    //     status: "open",
    //     type: "Primary",
    //   });
    //   // 3. Generate Folio Entries per night in proper order
    //   const folioEntriesBookingPayload: IinsertFolioEntriesPayload[] = [];
    //   const checkInDate = new Date(body.check_in);
    //   const checkOutDate = new Date(body.check_out);
    //   for (
    //     let currentDate = new Date(checkInDate);
    //     currentDate < checkOutDate;
    //     currentDate.setDate(currentDate.getDate() + 1)
    //   ) {
    //     const formattedDate = currentDate.toISOString().split("T")[0];
    //     // 1. Room Tariff
    //     body.booked_room_types.forEach((rt) => {
    //       rt.rooms.forEach((room) => {
    //         folioEntriesBookingPayload.push({
    //           folio_id: folio.id,
    //           date: formattedDate,
    //           posting_type: "Charge",
    //           debit: room.rate.changed_rate,
    //           room_id: room.room_id,
    //           description: `Room Tariff`,
    //           rack_rate: room.rate.base_rate,
    //         });
    //       });
    //     });
    //     // 2. VAT
    //     if (body.vat && body.vat > 0) {
    //       folioEntriesBookingPayload.push({
    //         folio_id: folio.id,
    //         date: formattedDate,
    //         posting_type: "Charge",
    //         debit: body.vat,
    //         room_id: 0,
    //         description: `VAT`,
    //         rack_rate: 0,
    //       });
    //     }
    //     // 3. Service Charge
    //     if (body.service_charge && body.service_charge > 0) {
    //       folioEntriesBookingPayload.push({
    //         folio_id: folio.id,
    //         date: formattedDate,
    //         posting_type: "Charge",
    //         debit: body.service_charge,
    //         room_id: 0,
    //         description: `Service Charge`,
    //         rack_rate: 0,
    //       });
    //     }
    //   }
    //   // 4. Payment (if given)
    //   const today = new Date().toISOString().split("T")[0];
    //   if (body.is_payment_given && body.payment?.amount > 0) {
    //     const accountModel = this.Model.accountModel(this.trx);
    //     const [account] = await accountModel.getSingleAccount({
    //       hotel_code: req.hotel_admin.hotel_code,
    //       id: body.payment.acc_id,
    //     });
    //     if (!account) throw new Error("Invalid Account");
    //     const voucher_no = await new HelperFunction().generateVoucherNo();
    //     const [voucher] = await accountModel.insertAccVoucher({
    //       acc_head_id: account.acc_head_id,
    //       created_by: req.hotel_admin.id,
    //       debit: body.payment.amount,
    //       credit: 0,
    //       description: `Payment for booking ${booking_id}`,
    //       voucher_type: "PAYMENT",
    //       voucher_date: today,
    //       voucher_no,
    //     });
    //     folioEntriesBookingPayload.push({
    //       folio_id: folio.id,
    //       acc_voucher_id: voucher.id,
    //       date: today,
    //       posting_type: "Payment",
    //       credit: body.payment.amount,
    //       room_id: 0,
    //       description: `Payment Received`,
    //       rack_rate: 0,
    //     });
    //   }
    //   // 5. Insert All Entries
    //   await hotelInvModel.insertInFolioEntries(folioEntriesBookingPayload);
    //   return {
    //     folio,
    //     entries: folioEntriesBookingPayload,
    //   };
    // }
    createGroupRoomBookingFolioWithEntries({ body, booking_id, guest_id, req, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotel_code = req.hotel_admin.hotel_code;
            const created_by = req.hotel_admin.id;
            const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
            // 1. Generate Folio Number
            const [lastFolio] = yield hotelInvModel.getLasFolioId();
            const folio_number = helperFunction_1.HelperFunction.generateFolioNumber(lastFolio === null || lastFolio === void 0 ? void 0 : lastFolio.id);
            // 2. Insert Folio
            const [folio] = yield hotelInvModel.insertInFolio({
                booking_id,
                folio_number,
                guest_id,
                hotel_code,
                name: "Reservation",
                status: "open",
                type: "Primary",
            });
            // 3. Generate Folio Entries
            const folioEntries = [];
            const checkInDate = new Date(body.check_in);
            const checkOutDate = new Date(body.check_out);
            const today = new Date().toISOString().split("T")[0];
            for (let current = new Date(checkInDate); current < checkOutDate; current.setDate(current.getDate() + 1)) {
                const formattedDate = current.toISOString().split("T")[0];
                for (const rt of body.booked_room_types) {
                    for (const room of rt.rooms) {
                        folioEntries.push({
                            folio_id: folio.id,
                            date: formattedDate,
                            posting_type: "Charge",
                            debit: room.rate.changed_rate,
                            room_id: room.room_id,
                            description: "Room Tariff",
                            rack_rate: room.rate.base_rate,
                        });
                    }
                }
                // VAT (posted once per night)
                if (body.vat && body.vat > 0) {
                    folioEntries.push({
                        folio_id: folio.id,
                        date: formattedDate,
                        posting_type: "Charge",
                        debit: body.vat,
                        room_id: 0,
                        description: "VAT",
                        rack_rate: 0,
                    });
                }
                // Service Charge
                if (body.service_charge && body.service_charge > 0) {
                    folioEntries.push({
                        folio_id: folio.id,
                        date: formattedDate,
                        posting_type: "Charge",
                        debit: body.service_charge,
                        room_id: 0,
                        description: "Service Charge",
                        rack_rate: 0,
                    });
                }
            }
            // 4. Handle Payment (if given)
            if (body.is_payment_given && body.payment && body.payment.amount > 0) {
                const accountModel = this.Model.accountModel(this.trx);
                const [account] = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: body.payment.acc_id,
                });
                if (!account) {
                    throw new Error("Invalid Account");
                }
                const voucher_no = yield new helperFunction_1.HelperFunction().generateVoucherNo();
                const [voucher] = yield accountModel.insertAccVoucher({
                    acc_head_id: account.acc_head_id,
                    created_by,
                    debit: body.payment.amount,
                    credit: 0,
                    description: `Payment for booking ${booking_id}`,
                    voucher_type: "PAYMENT",
                    voucher_date: today,
                    voucher_no,
                });
                folioEntries.push({
                    folio_id: folio.id,
                    acc_voucher_id: voucher.id,
                    date: today,
                    posting_type: "Payment",
                    credit: body.payment.amount,
                    room_id: 0,
                    description: "Payment Received",
                    rack_rate: 0,
                });
            }
            // 5. Insert all folio entries
            yield hotelInvModel.insertInFolioEntries(folioEntries);
            return {
                folio,
                entries: folioEntries,
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