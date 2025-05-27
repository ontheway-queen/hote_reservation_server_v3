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
class AdvancedRoomBookingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // create room booking
    createRoomBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id } = req.hotel_admin;
                const { name, email, phone, group_name, nationality, check_in_time, check_out_time, total_room, } = req.body;
                // number of nights step
                const checkInTime = new Date(check_in_time);
                const checkOutTime = new Date(check_out_time);
                const timeDifference = checkOutTime - checkInTime;
                const millisecondsInADay = 24 * 60 * 60 * 1000;
                let numberOfNights = Math.floor(timeDifference / millisecondsInADay);
                if (!numberOfNights)
                    numberOfNights = 1;
                // number of nights end
                const guestModel = this.Model.guestModel(trx);
                const roomBookingModel = this.Model.roomBookingModel(trx);
                const checkUser = yield guestModel.getSingleGuest({
                    email,
                    phone,
                    hotel_code,
                });
                let userRes;
                if (!checkUser.length) {
                    // create user
                    userRes = yield guestModel.createGuest({
                        name,
                        email,
                        phone,
                        hotel_code,
                        nationality,
                    });
                }
                const userID = checkUser.length
                    ? checkUser[0].id
                    : userRes[0];
                if (!checkUser.length || checkUser[0].user_type !== "room-guest") {
                    const existingUserType = yield guestModel.getExistsUserType(userID, "room-guest");
                    if (!existingUserType) {
                        yield guestModel.createUserType({
                            user_id: userID,
                            user_type: "room-guest",
                        });
                    }
                }
                // get last booking id
                const checkLastBookingId = yield roomBookingModel.getLastRoomBookingId(hotel_code);
                const lastBookingId = checkLastBookingId.length
                    ? checkLastBookingId[0].id + 1
                    : 1;
                const booking_no = `RB-${new Date().getFullYear()}${lastBookingId}`;
                // insert room booking
                const rmbRes = yield roomBookingModel.insertRoomBooking({
                    hotel_code,
                    check_in_time,
                    check_out_time,
                    number_of_nights: numberOfNights,
                    status: "pending",
                    user_id: userID,
                    booking_no,
                    created_by: id,
                    is_adv_booking: 1,
                    total_room,
                    group_name,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Room succesfully booked",
                };
            }));
        });
    }
    // get all room booking
    getAllRoomBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, name, from_date, to_date, status, user_id } = req.query;
            const model = this.Model.roomBookingModel();
            const { data, total } = yield model.getAllRoomBooking({
                limit: limit,
                skip: skip,
                name: name,
                from_date: from_date,
                to_date: to_date,
                hotel_code,
                status: status,
                user_id: user_id,
                is_adv_booking: 1,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // get single room booking
    getSingleRoomBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.roomBookingModel().getSingleRoomBooking(parseInt(id), hotel_code);
            if (!data.length) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0],
            };
        });
    }
    // confirm room booking
    confirmRoomBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { id: booking_id } = req.params;
                const { discount_amount, tax_amount, payment_type, ac_tr_ac_id, paid_amount, check_in, extra_charge, booking_rooms, check_in_time, } = req.body;
                const roomBookingModel = this.Model.roomBookingModel(trx);
                // get room booking
                const checkSingleBooking = yield roomBookingModel.getSingleRoomBooking(parseInt(booking_id), hotel_code);
                if (!checkSingleBooking.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Booking not found",
                    };
                }
                const { user_id, booking_no, booking_rooms: booked_rooms, } = checkSingleBooking[0];
                if (booked_rooms === null || booked_rooms === void 0 ? void 0 : booked_rooms.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Already this booking has been confirmed",
                    };
                }
                const sub_total = booking_rooms.reduce((acc, curr) => {
                    return acc + curr.amount;
                }, 0);
                const grand_total = sub_total + tax_amount + extra_charge - discount_amount;
                // updating room booking
                yield roomBookingModel.updateRoomBooking({
                    sub_total,
                    grand_total,
                    extra_charge,
                    discount: discount_amount,
                    tax: tax_amount,
                }, { id: parseInt(booking_id) });
                // insert booking rooms
                const BookingRoomPayload = booking_rooms.map((item) => {
                    return {
                        booking_id: parseInt(booking_id),
                        room_id: item.room_id,
                    };
                });
                yield roomBookingModel.insertBookingRoom(BookingRoomPayload);
                //=================== step for invoice ======================//
                let due_amount = 0;
                if (grand_total > paid_amount) {
                    due_amount = grand_total - paid_amount;
                }
                const roomBokingInvoiceModel = this.Model.roomBookingInvoiceModel(trx);
                // insert in invoice
                const invoiceModel = this.Model.hotelInvoiceModel(trx);
                // get last invoice
                const invoiceData = yield invoiceModel.getAllInvoiceForLastId();
                const year = new Date().getFullYear();
                const InvoiceNo = invoiceData.length ? invoiceData[0].id + 1 : 1;
                // insert invoice
                const invoiceRes = yield invoiceModel.insertHotelInvoice({
                    invoice_no: `ARMB-${year}${InvoiceNo}`,
                    description: `For Advanced room booking, booking id =${parseInt(booking_id)}, ${due_amount
                        ? `due amount is =${due_amount}`
                        : `fully paid amount is = ${grand_total}`}`,
                    created_by: admin_id,
                    discount_amount: discount_amount,
                    grand_total,
                    tax_amount,
                    sub_total: sub_total,
                    due: due_amount,
                    hotel_code,
                    type: "front_desk",
                    user_id,
                });
                // insert sub invoice
                const subInvoiceRes = yield roomBokingInvoiceModel.insertRoomBookingSubInvoice({
                    inv_id: invoiceRes[0],
                    room_booking_id: parseInt(booking_id),
                });
                // insert sub invoice item
                const invoiceItem = booking_rooms.map((item) => {
                    return {
                        sub_inv_id: subInvoiceRes[0],
                        room_id: item.room_id,
                        name: item.name,
                        total_price: item.amount,
                    };
                });
                yield roomBokingInvoiceModel.insertRoomBookingSubInvoiceItem(invoiceItem);
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
                        created_by: admin_id,
                        user_id,
                        payment_type,
                        total_collected_amount: paid_amount,
                        description: `Money reciept for invoice id = ${invoiceRes[0]},Total amount ${grand_total} and Total due amount is ${due_amount}`,
                        money_receipt_no: `${`MR-${year}-${moneyRecieptNo}`}`,
                        inv_id: invoiceRes[0],
                        remarks: "For room booking",
                        ac_tr_ac_id,
                    });
                    // insert money reciept item start
                    yield invoiceModel.insertMoneyRecieptItem({
                        invoice_id: invoiceRes[0],
                        money_reciept_id: moneyRecieptRes[0],
                    });
                }
                // =================== accounting part ============== //
                const accountModel = this.Model.accountModel(trx);
                const guestModel = this.Model.guestModel(trx);
                // get last acc ledger id
                const lastAL = yield accountModel.getLastAccountLedgerId(hotel_code);
                const acc_ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
                if (check_in) {
                    yield roomBookingModel.insertRoomBookingCheckIn({
                        booking_id: parseInt(booking_id),
                        check_in: check_in_time,
                        created_by: admin_id,
                    });
                    yield roomBookingModel.updateRoomBooking({ reserved_room: 1 }, { id: parseInt(booking_id) });
                }
                //  no payment section
                if (paid_amount <= 0) {
                    if (check_in) {
                        // user ledger added
                        yield guestModel.insertGuestLedger({
                            name: booking_no,
                            amount: grand_total,
                            pay_type: "debit",
                            user_id,
                            hotel_code,
                        });
                    }
                    // updating room booking
                    yield roomBookingModel.updateRoomBooking({ no_payment: 1 }, { id: parseInt(booking_id) });
                }
                else if (paid_amount == grand_total) {
                    const guestModel = this.Model.guestModel(trx);
                    // full payment part
                    if (!ac_tr_ac_id) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "You have to give account id",
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
                    // insert account ledger
                    const accLedgerRes = yield accountModel.insertAccountLedger({
                        ac_tr_ac_id,
                        hotel_code,
                        transaction_no: `TRX-U-${year}${acc_ledger_id}`,
                        ledger_credit_amount: paid_amount,
                        ledger_details: `Balance has been credited by Advanced room booking with full payment, Advanced Room booking id =${booking_no}`,
                    });
                    //======== insert guest ledger =============//
                    // credit
                    yield guestModel.insertGuestLedger({
                        name: booking_no,
                        amount: paid_amount,
                        pay_type: "credit",
                        user_id,
                        hotel_code,
                        acc_ledger_id: accLedgerRes[0],
                        ac_tr_ac_id,
                    });
                    // debit
                    yield guestModel.insertGuestLedger({
                        name: booking_no,
                        amount: grand_total,
                        pay_type: "debit",
                        user_id,
                        hotel_code,
                    });
                    // update room booking
                    yield roomBookingModel.updateRoomBooking({ pay_status: 1, full_payment: 1, reserved_room: 1 }, { id: parseInt(booking_id) });
                    // update money reciept
                    yield invoiceModel.updateMoneyReciept({ ac_ldg_id: accLedgerRes[0] }, moneyRecieptRes[0]);
                }
                else if (paid_amount > 0) {
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
                    // insert account ledger
                    const accLedgerRes = yield accountModel.insertAccountLedger({
                        ac_tr_ac_id,
                        transaction_no: `TRX-U-${year}${acc_ledger_id}`,
                        hotel_code,
                        ledger_credit_amount: paid_amount,
                        ledger_details: `Balance has been credited by room booking with partial payment, Room booking id =${booking_id}`,
                    });
                    // update money reciept
                    yield invoiceModel.updateMoneyReciept({ ac_ldg_id: accLedgerRes[0] }, moneyRecieptRes[0]);
                    //======== insert guest ledger =============//
                    // debit
                    yield guestModel.insertGuestLedger({
                        name: booking_no,
                        amount: grand_total,
                        pay_type: "debit",
                        user_id,
                        hotel_code,
                    });
                    // credit
                    yield guestModel.insertGuestLedger({
                        name: booking_no,
                        amount: paid_amount,
                        pay_type: "credit",
                        user_id,
                        hotel_code,
                        acc_ledger_id: accLedgerRes[0],
                        ac_tr_ac_id,
                    });
                    yield roomBookingModel.updateRoomBooking({
                        pay_status: 1,
                        partial_payment: 1,
                        reserved_room: 1,
                    }, { id: parseInt(booking_id) });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Room succesfully booked",
                };
            }));
        });
    }
    // insert check in room booking
    insertBookingCheckIn(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id } = req.hotel_admin;
                const { booking_id, check_in } = req.body;
                const bookingModel = this.Model.roomBookingModel(trx);
                const checkBooking = yield bookingModel.getSingleRoomBooking(booking_id, hotel_code);
                if (!checkBooking.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Booking not found",
                    };
                }
                // check already checked in or not with this booking id
                const { data: checkBookingCheckedIn } = yield bookingModel.getAllRoomBookingCheckIn({ booking_id, hotel_code });
                if (checkBookingCheckedIn.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Already checked in by this booking ID",
                    };
                }
                const { check_out_time, pay_status, grand_total, user_id, booking_no } = checkBooking[0];
                console.log({ checkBooking });
                // room booking check in time
                const rmb_last_check_in_time = new Date(check_out_time);
                const after_rmb_check_in_time = new Date(check_in);
                if (after_rmb_check_in_time > rmb_last_check_in_time) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Room booking check in time expired, so you can not check in for this booking",
                    };
                }
                if (!pay_status) {
                    const guestModel = this.Model.guestModel(trx);
                    yield guestModel.insertGuestLedger({
                        name: booking_no,
                        amount: grand_total,
                        pay_type: "debit",
                        user_id,
                        hotel_code,
                    });
                    const roomBookingModel = this.Model.roomBookingModel(trx);
                    yield roomBookingModel.updateRoomBooking({ pay_status: 1, reserved_room: 1 }, { id: booking_id });
                }
                // insert room booking check in
                yield bookingModel.insertRoomBookingCheckIn({
                    booking_id,
                    check_in,
                    created_by: id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Booking checked in",
                };
            }));
        });
    }
    // get all room booking check in
    getAllRoomBookingCheckIn(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, from_date, to_date } = req.query;
            const model = this.Model.roomBookingModel();
            const { data, total } = yield model.getAllRoomBookingCheckIn({
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
    // add check out room booking
    addBookingCheckOut(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { check_out } = req.body;
                const bookingModel = this.Model.roomBookingModel(trx);
                const checkBooking = yield bookingModel.getSingleRoomBookingCheckIn(parseInt(req.params.id), hotel_code);
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
                const otherInvoiceModel = this.Model.hotelInvoiceModel(trx);
                // get all invoice by user
                const { data: checkUpaidInvoice } = yield otherInvoiceModel.getAllInvoice({
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
                        message: "This user has others due amount. So cannot check out at this moment",
                    };
                }
                // check room booking due invoice or not
                const roomBookingInvoiceModel = this.Model.roomBookingInvoiceModel(trx);
                const { data: checkUpaidRbInvoice } = yield roomBookingInvoiceModel.getAllRoomBookingInvoice({
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
                yield bookingModel.addRoomBookingCheckOut({ check_out, status: "checked-out" }, parseInt(req.params.id));
                //====================  update room booking ================== //
                // update room booking status
                yield bookingModel.updateRoomBooking({ status: "left", no_payment: 0, partial_payment: 0, full_payment: 1 }, { id: booking_id });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Booking checked out",
                };
            }));
        });
    }
    // refund room booking
    refundRoomBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { id } = req.params;
                const { charge, refund_from_acc, refund_type } = req.body;
                const accModel = this.Model.accountModel(trx);
                const rmbModel = this.Model.roomBookingModel(trx);
                const userModel = this.Model.guestModel(trx);
                const rmbInvModel = this.Model.roomBookingInvoiceModel(trx);
                // get room booking
                const getSingleRB = yield rmbModel.getSingleRoomBooking(parseInt(id), hotel_code);
                if (!getSingleRB.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { pay_status, grand_total, status, check_in_out_status, booking_no, user_id, } = getSingleRB[0];
                if (!pay_status) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "You cannot refund cause payment not done",
                    };
                }
                if (status != "approved") {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "You cannot refund without status approved",
                    };
                }
                if (check_in_out_status != null) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Refund only if not checked in",
                    };
                }
                // get single room booking inv
                const getSingleRBInv = yield rmbInvModel.getSingleRoomBookingInvoice({
                    hotel_code,
                    room_booking_id: parseInt(id),
                });
                const { due } = getSingleRBInv[0];
                // get single account
                const getSingleAcc = yield accModel.getSingleAccount({
                    hotel_code,
                    id: refund_from_acc,
                });
                if (!getSingleAcc.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Account not found",
                    };
                }
                const { last_balance } = getSingleAcc[0];
                // user paid amount
                const userPaidAmount = parseFloat(grand_total) - parseFloat(due);
                const nowUserRefundBlnc = userPaidAmount - charge;
                if (last_balance < nowUserRefundBlnc) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "You cannot refund cause account balance is lower than refund balance",
                    };
                }
                if (refund_type == "adjust_money") {
                    // charge added in user ledger
                    // const nowLedgerLastBalance
                    // const userLdg = await userModel.insertGuestLedger({
                    //   amount: charge,
                    //   hotel_code,
                    //   name: booking_no,
                    //   pay_type: "debit",
                    //   user_id,
                    //   last_balance:,
                    // });
                    // user balance update
                    // account transaction for debit
                }
                // Fetch additional fields
                // await rmbModel.refundRoomBooking(
                //   {
                //     hotel_code,
                //     pay_status: 0,
                //     reserved_room: 0,
                //     status: "refunded",
                //   },
                //   { id: parseInt(id) }
                // );
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Booking room successfully refunded",
                };
            }));
        });
    }
    // //======== extend Room Booking  =============//
    extendRoomBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
}
exports.default = AdvancedRoomBookingService;
//# sourceMappingURL=advanced-room-booking.service.js.map