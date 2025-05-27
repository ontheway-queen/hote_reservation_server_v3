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
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class HallBookingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // create hall booking
    createHallBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id } = req.hotel_admin;
                const { name, email, phone, booking_halls, start_time, end_time, check_in, booking_date, event_date, discount_amount, tax_amount, total_occupancy, paid_amount, payment_type, ac_tr_ac_id, extra_charge, } = req.body;
                // number of hours
                const startTime = new Date(`2000-01-01 ${start_time}`);
                const endTime = new Date(`2000-01-01 ${end_time}`);
                const timeDifference = endTime - startTime;
                const millisecondsInHour = 60 * 60 * 1000;
                let numberOfHours = Math.round(timeDifference / millisecondsInHour);
                if (!numberOfHours)
                    numberOfHours = 1;
                const hallBookingModel = this.Model.hallBookingModel(trx);
                // number of hours end
                const guestModel = this.Model.guestModel(trx);
                const checkUser = yield guestModel.getSingleGuest({
                    email,
                    phone,
                    hotel_code,
                });
                let userRes;
                let userLastBalance = 0;
                if (checkUser.length) {
                    const { last_balance } = checkUser[0];
                    userLastBalance = last_balance;
                }
                if (!checkUser.length) {
                    // create user
                    userRes = yield guestModel.createGuest({
                        name,
                        phone,
                        email,
                        hotel_code,
                    });
                }
                const userID = checkUser.length
                    ? checkUser[0].id
                    : userRes[0];
                if (!checkUser.length || checkUser[0].user_type !== "hall-guest") {
                    const existingUserType = yield guestModel.getExistsUserType(userID, "hall-guest");
                    if (!existingUserType) {
                        yield guestModel.createUserType({
                            user_id: userID,
                            user_type: "hall-guest",
                        });
                    }
                }
                console.log(req.body);
                // ========== step for amount ============ //
                const hallModel = this.Model.hallModel(trx);
                // hall model
                const bookingHallsList = booking_halls.map((item) => item.hall_id);
                // get all hall by halls
                const { data: allBookingHall } = yield hallModel.getAllHall({
                    hotel_code,
                    halls: bookingHallsList,
                });
                // Check if all halls are available
                if (!allBookingHall.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Hall is not found with this hotel",
                    };
                }
                // check if unavaiable hall or not
                const checkUnavailableHall = allBookingHall.filter((item) => !item.hall_status);
                if (checkUnavailableHall.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: `This Hall is unavailable`,
                    };
                }
                const tempAllBookingHall = [];
                for (let i = 0; i < allBookingHall.length; i++) {
                    let found = false;
                    for (let j = 0; j < booking_halls.length; j++) {
                        if (allBookingHall[i].id === booking_halls[j].hall_id) {
                            found = true;
                            tempAllBookingHall.push({
                                hall_id: allBookingHall[i].id,
                                hall_name: allBookingHall[i].name,
                                rate_per_hour: allBookingHall[i].rate_per_hour,
                                hall_status: allBookingHall[i].hall_status,
                            });
                        }
                    }
                    if (!found) {
                        tempAllBookingHall.push({
                            hall_id: allBookingHall[i].id,
                            hall_name: allBookingHall[i].name,
                            rate_per_hour: allBookingHall[i].rate_per_hour,
                            hall_status: allBookingHall[i].hall_status,
                        });
                    }
                }
                let totalSubAmount = 0;
                if (tempAllBookingHall.length) {
                    totalSubAmount = tempAllBookingHall.reduce((acc, hall) => {
                        const ratePerNight = (hall.rate_per_hour || 0) * numberOfHours;
                        return acc + ratePerNight;
                    }, 0);
                }
                const grandTotal = totalSubAmount + (extra_charge || 0) + tax_amount - discount_amount;
                // =============== step end amount =====================
                // get last booking id
                const checkLastBookingId = yield hallBookingModel.getLastHallBookingId(hotel_code);
                const lastBookingId = checkLastBookingId.length
                    ? checkLastBookingId[0].id + 1
                    : 1;
                const booking_no = `HB-${new Date().getFullYear()}${lastBookingId}`;
                // insert hall booking
                const hbRes = yield hallBookingModel.insertHallBooking({
                    hotel_code,
                    user_id: userID,
                    grand_total: grandTotal,
                    number_of_hours: numberOfHours,
                    booking_no,
                    start_time,
                    end_time,
                    event_date,
                    extra_charge,
                    booking_status: "confirmed",
                    total_occupancy,
                    booking_date,
                    created_by: id,
                });
                // insert booking halls
                const BookingHallPayload = booking_halls.map((item) => {
                    return {
                        booking_id: hbRes[0],
                        hall_id: item.hall_id,
                    };
                });
                yield hallBookingModel.insertBookingHall(BookingHallPayload);
                // Hall Check in
                const bookingModel = this.Model.hallBookingModel(trx);
                //=================== step for invoice ======================//
                let advanceAmount = 0;
                let due_amount = 0;
                if (grandTotal < paid_amount) {
                    advanceAmount = paid_amount - grandTotal;
                }
                else {
                    due_amount = grandTotal - paid_amount;
                }
                // insert in invoice
                const hallBokingInvoiceModel = this.Model.hallBookingInvoiceModel(trx);
                // insert in invoice
                const invoiceModel = this.Model.hotelInvoiceModel(trx);
                // get last invoice
                const invoiceData = yield invoiceModel.getAllInvoiceForLastId();
                const year = new Date().getFullYear();
                const InvoiceNo = invoiceData.length ? invoiceData[0].id + 1 : 1;
                // insert invoice
                const invoiceRes = yield invoiceModel.insertHotelInvoice({
                    invoice_no: `HBPNL-${year}${InvoiceNo}`,
                    description: `For Hall booking, booking id =${hbRes[0]}, ${due_amount
                        ? `due amount is =${due_amount}`
                        : `fully paid amount is = ${grandTotal}`}`,
                    created_by: id,
                    discount_amount: discount_amount,
                    grand_total: grandTotal,
                    tax_amount: tax_amount,
                    sub_total: totalSubAmount,
                    due: due_amount,
                    hotel_code,
                    type: "front_desk",
                    user_id: userID,
                });
                // insert sub invoice
                const subInvoiceRes = yield hallBokingInvoiceModel.insertHallBookingSubInvoice({
                    inv_id: invoiceRes[0],
                    hall_booking_id: hbRes[0],
                });
                // insert sub invoice item
                const invoiceItem = tempAllBookingHall.map((item) => {
                    return {
                        sub_inv_id: subInvoiceRes[0],
                        hall_id: item.hall_id,
                        name: item.hall_name,
                        total_price: item.rate_per_hour,
                    };
                });
                yield hallBokingInvoiceModel.insertHallBookingSubInvoiceItem(invoiceItem);
                //=============== Money reciept step ============== //
                // get last money reciept
                const moneyRecieptData = yield invoiceModel.getAllMoneyRecieptFoLastId();
                const moneyRecieptNo = moneyRecieptData.length
                    ? moneyRecieptData[0].id + 1
                    : 1;
                let moneyRecieptRes;
                if (paid_amount > 0) {
                    moneyRecieptRes = yield invoiceModel.createMoneyReciept({
                        hotel_code,
                        created_by: id,
                        user_id: userID,
                        payment_type,
                        total_collected_amount: paid_amount,
                        description: `Money reciept for invoice id = ${invoiceRes[0]},Total amount ${grandTotal} and Total due amount is ${due_amount}`,
                        money_receipt_no: `${`MR-${year}-${moneyRecieptNo}`}`,
                        remarks: "For Hall booking",
                        ac_tr_ac_id,
                        inv_id: invoiceRes[0],
                    });
                    // insert money reciept item start
                    yield invoiceModel.insertMoneyRecieptItem({
                        invoice_id: invoiceRes[0],
                        money_reciept_id: moneyRecieptRes[0],
                    });
                }
                // =================== accounting part ============== //
                const accountModel = this.Model.accountModel(trx);
                // full payment payment
                if (paid_amount === grandTotal) {
                    yield hallBookingModel.updateHallBooking({ pay_status: 1, full_payment: 1, reserved_hall: 1 }, { id: hbRes[0] });
                    if (!ac_tr_ac_id) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "You have to give account transaction id",
                        };
                    }
                    // check account
                    const checkAccount = yield accountModel.getSingleAccount({
                        hotel_code,
                        id: ac_tr_ac_id,
                        type: payment_type,
                    });
                    if (!checkAccount.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Account not found with this id and type",
                        };
                    }
                    // get last account ledger
                    const lastAL = yield accountModel.getLastAccountLedgerId(hotel_code);
                    const acc_ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
                    // insert account ledger
                    const accLedgerRes = yield accountModel.insertAccountLedger({
                        ac_tr_ac_id,
                        hotel_code,
                        transaction_no: `TRX-U-${year}${acc_ledger_id}`,
                        ledger_credit_amount: paid_amount,
                        ledger_details: `Balance has been credited by room booking, Room booking id =${hbRes[0]}`,
                    });
                    //======== insert guest ledger =============//
                    yield guestModel.insertGuestLedger({
                        name: booking_no,
                        amount: paid_amount,
                        pay_type: "credit",
                        user_id: userID,
                        hotel_code,
                        ac_tr_ac_id,
                        acc_ledger_id: accLedgerRes[0],
                    });
                    if (check_in) {
                        yield bookingModel.insertHallBookingCheckIn({
                            booking_id: hbRes[0],
                            check_in: start_time,
                            event_date: event_date,
                            created_by: id,
                        });
                    }
                    // debit
                    yield guestModel.insertGuestLedger({
                        name: booking_no,
                        amount: grandTotal,
                        pay_type: "debit",
                        user_id: userID,
                        hotel_code,
                    });
                }
                else if (paid_amount > 0) {
                    if (check_in) {
                        yield bookingModel.insertHallBookingCheckIn({
                            booking_id: hbRes[0],
                            check_in: start_time,
                            event_date: event_date,
                            created_by: id,
                        });
                    }
                    yield hallBookingModel.updateHallBooking({ pay_status: 1, partial_payment: 1, reserved_hall: 1 }, { id: hbRes[0] });
                    // partial payment part
                    if (!ac_tr_ac_id) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "You have to give account transaction id",
                        };
                    }
                    // check account
                    const checkAccount = yield accountModel.getSingleAccount({
                        hotel_code,
                        id: ac_tr_ac_id,
                        type: payment_type,
                    });
                    if (!checkAccount.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Account not found with this id and type",
                        };
                    }
                    // get last account ledger
                    const lastAL = yield accountModel.getLastAccountLedgerId(hotel_code);
                    const acc_ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
                    // insert account ledger
                    const accLedgerRes = yield accountModel.insertAccountLedger({
                        ac_tr_ac_id,
                        hotel_code,
                        transaction_no: `TRX-U-${year}${acc_ledger_id}`,
                        ledger_credit_amount: paid_amount,
                        ledger_details: `Balance has been credited by room booking with partial payment, Room booking id =${hbRes[0]}`,
                    });
                    //======== insert guest ledger =============//
                    yield guestModel.insertGuestLedger({
                        name: booking_no,
                        amount: grandTotal,
                        pay_type: "debit",
                        user_id: userID,
                        hotel_code,
                    });
                    yield guestModel.insertGuestLedger({
                        name: booking_no,
                        amount: paid_amount,
                        pay_type: "credit",
                        user_id: userID,
                        hotel_code,
                        ac_tr_ac_id,
                        acc_ledger_id: accLedgerRes[0],
                    });
                }
                else {
                    // no payment
                    //======== insert guest ledger =============//
                    if (check_in) {
                        yield guestModel.insertGuestLedger({
                            name: booking_no,
                            amount: grandTotal,
                            pay_type: "debit",
                            user_id: userID,
                            hotel_code,
                        });
                    }
                    yield hallBookingModel.updateHallBooking({ no_payment: 1 }, { id: hbRes[0] });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Hall booked succesfully",
                };
            }));
        });
    }
    // get all hall booking
    getAllHallBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, booking_status, from_date, to_date, event_date, user_id, } = req.query;
            const model = this.Model.hallBookingModel();
            const { data, total } = yield model.getAllHallBooking({
                limit: limit,
                skip: skip,
                key: key,
                from_date: from_date,
                to_date: to_date,
                hotel_code,
                event_date: event_date,
                booking_status: booking_status,
                user_id: user_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // get single hall booking
    getSingleHallBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.hallBookingModel().getSingleHallBooking(parseInt(id), hotel_code);
            if (!data.length) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: data,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0],
            };
        });
    }
    // insert check in hall booking
    insertHallBookingCheckIn(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id } = req.hotel_admin;
                const { booking_id, check_in, event_date } = req.body;
                const bookingModel = this.Model.hallBookingModel(trx);
                const checkBooking = yield bookingModel.getSingleHallBooking(booking_id, hotel_code);
                if (!checkBooking.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Booking not found",
                    };
                }
                // check already checked in or not with this booking id
                const { data: checkBookingCheckedIn } = yield bookingModel.getAllHallBookingCheckIn({ booking_id, hotel_code });
                if (checkBookingCheckedIn.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Already checked in by this booking ID",
                    };
                }
                const { check_out_time, pay_status, grand_total, user_id, booking_no, check_in_out_status, } = checkBooking[0];
                // hall booking check in time
                const hb_last_check_in_time = new Date(check_out_time);
                const after_hb_check_in_time = new Date(check_in);
                if (after_hb_check_in_time > hb_last_check_in_time) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Hall booking check in time expired, so you can not check in for this booking",
                    };
                }
                if (!pay_status) {
                    const guestModel = this.Model.guestModel(trx);
                    //======== insert guest ledger =============//
                    if (check_in_out_status != "checked-in" && check_in) {
                        yield guestModel.insertGuestLedger({
                            name: booking_no,
                            amount: grand_total,
                            pay_type: "debit",
                            user_id,
                            hotel_code,
                        });
                    }
                    yield bookingModel.updateHallBooking({ pay_status: 1, reserved_hall: 1 }, { id: booking_id });
                }
                // insert hall booking check in
                yield bookingModel.insertHallBookingCheckIn({
                    booking_id,
                    check_in,
                    event_date,
                    created_by: id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Hall Booking checked in",
                };
            }));
        });
    }
    // get all Hall booking check in
    getAllHallBookingCheckIn(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, from_date, to_date } = req.query;
            const model = this.Model.hallBookingModel();
            const { data, total } = yield model.getAllHallBookingCheckIn({
                limit: limit,
                skip: skip,
                hotel_code,
                key: key,
                from_date: from_date,
                to_date: to_date,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // add check out hall booking
    updateBookingCheckOut(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { check_out } = req.body;
                const bookingModel = this.Model.hallBookingModel(trx);
                const checkBooking = yield bookingModel.getSingleHallBookingCheckIn(parseInt(req.params.id), hotel_code);
                if (!checkBooking.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Booking not found",
                    };
                }
                const { user_id, booking_id, status } = checkBooking[0];
                if (status === "checked-out") {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Already checked out",
                    };
                }
                const invoiceModel = this.Model.hotelInvoiceModel(trx);
                // get all invoice by user
                const { data: checkUpaidInvoice } = yield invoiceModel.getAllInvoice({
                    user_id,
                    due_inovice: "1",
                    hotel_code,
                });
                if (checkUpaidInvoice.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        data: {
                            other_due: 1,
                        },
                        message: "This user has due amount. So cannot check out at this moment",
                    };
                }
                // check hall booking due invoice or not
                const hallBookingInvoiceModel = this.Model.hallBookingInvoiceModel(trx);
                const { data: checkUpaidRbInvoice } = yield hallBookingInvoiceModel.getAllHallBookingInvoice({
                    user_id,
                    due_inovice: "1",
                    hotel_code,
                });
                if (checkUpaidRbInvoice.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        data: {
                            other_due: 1,
                        },
                        message: "This user has due amount. So cannot check out at this moment",
                    };
                }
                // add checkout time
                const checkout = yield bookingModel.updateBookingCheckOut({ check_out, status: "checked-out" }, parseInt(req.params.id));
                //==================== steps for room update ================== //
                const getAllHallByBookingId = yield bookingModel.getSingleHallBooking(booking_id, hotel_code);
                const { booking_halls } = getAllHallByBookingId[0];
                const bookingHallsList = booking_halls.map((item) => item.hall_id);
                const hallModel = this.Model.hallModel(trx);
                // hall update for avaliblity
                yield hallModel.updateManyHall(bookingHallsList, hotel_code, {
                    hall_status: "available",
                });
                // update hall booking status
                yield bookingModel.updateHallBooking({
                    booking_status: "left",
                    no_payment: 0,
                    partial_payment: 0,
                    full_payment: 1,
                }, { id: booking_id });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Booking checked out",
                };
            }));
        });
    }
}
exports.default = HallBookingService;
//# sourceMappingURL=hall-booking.service.js.map