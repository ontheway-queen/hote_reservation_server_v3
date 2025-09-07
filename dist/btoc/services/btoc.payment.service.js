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
const helperFunction_1 = require("../../appAdmin/utlis/library/helperFunction");
const btoc_subHotel_service_1 = require("./btoc.subHotel.service");
const btoc_subpayment_service_1 = require("./btoc.subpayment.service");
class BtocPaymentServices extends abstract_service_1.default {
    createSurjopayPaymentOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { checkin, checkout, holder, rate_plan_id, room_type_id, rooms, special_requests, } = req.body;
                const { hotel_code } = req.web_token;
                const { id: user_id, email } = req.btoc_user;
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
                const create_payment = yield new btoc_subpayment_service_1.BtocSubPaymentService().createSurjopayPaymentOrderForHotel({
                    amount: recheck.price.toString(),
                    customer_email: email,
                    customer_first_name: holder.first_name,
                    customer_last_name: holder.last_name,
                    customer_phone_number: holder.phone,
                    ip: req.ip,
                    user_id,
                    is_app: String(is_app),
                    hb_sl_id: booking.id,
                    hotel_code,
                });
                console.log({ create_payment });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        checkout_url: create_payment.checkout_url,
                        order_id: create_payment === null || create_payment === void 0 ? void 0 : create_payment.sp_order_id,
                    },
                };
            }));
        });
    }
}
exports.BtocPaymentServices = BtocPaymentServices;
//# sourceMappingURL=btoc.payment.service.js.map