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
exports.BtocPaymentServices = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const constants_1 = require("../../utils/miscellaneous/constants");
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const helperFunction_1 = require("../../appAdmin/utlis/library/helperFunction");
const btoc_subHotel_service_1 = require("./btoc.subHotel.service");
class BtocPaymentServices extends abstract_service_1.default {
    // private subPaymentServices = new BtocSubPaymentService();
    //create payment
    // public async createPayment(req: Request) {
    //   const { id: user_id, first_name, email, phone_number } = req.user;
    //   const { booking_id } = req.body;
    //   if (!booking_id) {
    //     return {
    //       success: false,
    //       code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
    //       message: this.ResMsg.HTTP_UNPROCESSABLE_ENTITY,
    //     };
    //   }
    //   const booking_model = this.Model.flightBookingModel();
    //   const booking_data = await booking_model.getSingleFlightBooking({
    //     id: Number(booking_id),
    //     status: "pending",
    //   });
    //   if (!booking_data.length) {
    //     return {
    //       success: false,
    //       code: this.StatusCode.HTTP_NOT_FOUND,
    //       message: this.ResMsg.HTTP_NOT_FOUND,
    //     };
    //   }
    //   //payment session
    //   const paymentModel = this.Model.paymentModel();
    //   const paymentTry = await paymentModel.createPaymentTry({
    //     user_id,
    //     pnr_id: booking_data[0].pnr_code,
    //     booking_id: Number(booking_id),
    //     status: "INITIATE",
    //     description: "Payment initiate completed.",
    //     amount: booking_data[0].payable_amount,
    //     currency: "BDT",
    //   });
    //   return await this.subPaymentServices.sslPayment({
    //     total_amount: booking_data[0].payable_amount,
    //     currency: "BDT",
    //     tran_id: `${paymentTry[0].id}-${booking_id}-${user_id}`,
    //     cus_name: first_name,
    //     cus_email: email,
    //     cus_add1: "Dhaka",
    //     cus_city: "Dhaka",
    //     cus_country: "Bangladesh",
    //     cus_phone: phone_number,
    //     product_name: "ticket issue",
    //   });
    // }
    createSurjopayPaymentOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { checkin, checkout, holder, rate_plan_id, room_type_id, rooms, special_requests, } = req.body;
                const { hotel_code } = req.web_token;
                const { id: user_id, email } = req.btoc_user;
                const btocReservationModel = this.BtocModels.btocReservationModel(trx);
                // _____________________________ recheck and nights_________________
                const nights = helperFunction_1.HelperFunction.calculateNights(checkin, checkout);
                const recheck = yield this.BtocModels.btocReservationModel().recheck({
                    hotel_code,
                    nights,
                    checkin: checkin,
                    checkout: checkout,
                    rooms,
                    rate_plan_id,
                    room_type_id,
                });
                if (!recheck) {
                    throw new Error("Room not available for booking");
                }
                console.log({ recheck });
                const sub = new btoc_subHotel_service_1.SubBtocHotelService(trx);
                // Insert or get lead guest
                const guest_id = yield sub.findOrCreateGuest(holder, hotel_code);
                // Create main booking
                const booking = yield sub.createMainBooking({
                    payload: {
                        is_individual_booking: true,
                        check_in: checkin,
                        check_out: checkout,
                        created_by: req.btoc_user.id,
                        booking_type: "B",
                        special_requests,
                        payment_status: "unpaid",
                    },
                    hotel_code,
                    guest_id,
                    total_nights: nights,
                    total_amount: recheck.price,
                    sub_total: recheck.price,
                });
                const booked_room_types = [];
                rooms.forEach((room) => {
                    var _a;
                    const guestRoom = {
                        check_in: checkin,
                        check_out: checkout,
                        adults: room.adults,
                        children: room.children_ages.length,
                        rate: {
                            base_rate: recheck.rate.base_rate,
                            changed_rate: recheck.rate.base_rate,
                        },
                        guest_info: (_a = room === null || room === void 0 ? void 0 : room.paxes) === null || _a === void 0 ? void 0 : _a.map((pax) => ({
                            title: pax.title,
                            first_name: pax.name,
                            last_name: pax.surname,
                            is_room_primary_guest: false,
                            type: pax.type === "AD"
                                ? "adult"
                                : pax.type === "CH"
                                    ? "child"
                                    : "infant",
                        })),
                    };
                    booked_room_types.push({
                        room_type_id,
                        rate_plan_id,
                        rooms: [guestRoom],
                    });
                });
                // Insert booking rooms
                yield sub.insertBookingRooms({
                    booked_room_types,
                    booking_id: booking.id,
                    hotel_code,
                });
                const { payment_for, is_app } = req.query ||
                    {};
                // Common builders
                const buildUrls = () => ({
                    return_url: `${constants_1.BTOC_PAYMENT_SUCCESS_RETURN_URL}?payment_for=${payment_for}&booking_`,
                    cancel_url: `${constants_1.BTOC_PAYMENT_CANCELLED_URL}?payment_for=${payment_for}`,
                });
                const buildPaymentResponse = (checkout_url, sp_order_id) => ({
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: Object.assign(Object.assign({ checkout_url }, buildUrls()), { order_id: sp_order_id }),
                });
                const inv_model = this.Model.btocInvoiceModel(trx);
                const { id: last_id } = yield btocReservationModel.getLastBooking();
                const booking_id = lib_1.default.generateBookingReferenceWithId("WB", last_id ? Number(last_id) + 1 : 1);
                console.log({ last_id, booking_id });
                // stash temp booking
                const [tempBooking] = yield btocReservationModel.insertBooking({
                    book_from: "web",
                    booking_date: new Date().toUTCString(),
                    booking_reference: booking_id,
                    booking_type: "B",
                    check_in: checkin,
                    check_out: checkout,
                    created_by: req.btoc_user.id,
                    guest_id: 2,
                    hotel_code,
                    is_individual_booking: false,
                    payment_status: "unpaid",
                    status: "",
                    total_nights: 2,
                    comments: special_requests,
                    sub_total: 0,
                    total_amount: 0,
                    voucher_no: "ds",
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
}
exports.BtocPaymentServices = BtocPaymentServices;
//# sourceMappingURL=btoc.payment.service.js.map