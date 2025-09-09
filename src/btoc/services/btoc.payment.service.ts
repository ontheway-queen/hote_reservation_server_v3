import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

import { HelperFunction } from "../../appAdmin/utlis/library/helperFunction";
import {
  IBookedRoomTypeRequest,
  IBookingRequestBody,
  IBRoomGuest,
} from "../utills/interfaces/btoc.hotel.interface";
import { SubBtocHotelService } from "./btoc.subHotel.service";
import { BtocSubPaymentService } from "./btoc.subpayment.service";

export class BtocPaymentServices extends AbstractServices {
  public async createSurjopayPaymentOrder(req: Request) {
    return this.db.transaction(async (trx) => {
      const {
        checkin,
        checkout,
        holder,
        rate_plan_id,
        room_type_id,
        rooms,
        special_requests,
      } = req.body as IBookingRequestBody;

      const { hotel_code } = req.web_token;
      const { id: user_id, email } = req.btoc_user;

      // _____________________________ recheck and nights _______________________ //

      const nights = HelperFunction.calculateNights(checkin, checkout);

      const recheck = await this.BtocModels.btocReservationModel().recheck({
        hotel_code,
        nights,
        checkin: checkin as string,
        checkout: checkout as string,
        rooms,
        rate_plan_id,
        room_type_id,
      });

      if (!recheck) {
        throw new Error("Room not available for booking");
      }

      console.log({ recheck });
      const sub = new SubBtocHotelService(trx);
      // Insert or get lead guest
      const guest_id = await sub.findOrCreateGuest(holder, hotel_code);

      // Create main booking
      const booking = await sub.createMainBooking({
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

      const booked_room_types: IBookedRoomTypeRequest[] = [];

      rooms.forEach((room) => {
        const guestRoom: IBRoomGuest = {
          check_in: checkin,
          check_out: checkout,
          adults: room.adults,
          children: room.children_ages.length,
          rate: {
            base_rate: recheck.rate.base_rate,
            changed_rate: recheck.rate.base_rate,
          },
          guest_info: room?.paxes?.map((pax) => ({
            title: pax.title,
            first_name: pax.name,
            last_name: pax.surname,
            is_room_primary_guest: false,
            type:
              pax.type === "AD"
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
      await sub.insertBookingRooms({
        booked_room_types,
        booking_id: booking.id,
        hotel_code,
      });

      const { payment_for, is_app } =
        (req.query as unknown as { payment_for?: string; is_app?: boolean }) ||
        {};

      const create_payment =
        await new BtocSubPaymentService().createSurjopayPaymentOrderForHotel({
          amount: recheck.price.toString(),
          customer_email: email,
          customer_first_name: holder.first_name,
          customer_last_name: holder.last_name,
          customer_phone_number: holder.phone,
          ip: req.ip as string,
          user_id,
          is_app: String(is_app),
          hb_sl_id: booking.id,
          booking_ref: booking.booking_ref,
          hotel_code,
        });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          checkout_url: create_payment.checkout_url,
          order_id: create_payment?.sp_order_id,
        },
      };
    });
  }

  //get invoice list
  // public async getInvoice(req: Request) {
  //   const { id } = req.user;

  //   const { limit, skip, due } = req.query;
  //   const data = await this.Model.btocInvoiceModel().getInvoice({
  //     userId: id,
  //     limit,
  //     skip,
  //     due,
  //     status: true,
  //   });
  //   return {
  //     success: true,
  //     code: this.StatusCode.HTTP_OK,
  //     total: data.total,
  //     data: data.data,
  //   };
  // }

  // //single invoice
  // public async singleInvoice(req: Request) {
  //   const { id: user_id } = req.user;
  //   console.log({ user_id });
  //   const { id: invoice_id } = req.params as unknown as { id: number };
  //   const inv_model = this.Model.btocInvoiceModel();
  //   const data = await inv_model.singleInvoice({ id: invoice_id, user_id });

  //   if (!data.length) {
  //     return {
  //       success: false,
  //       code: this.StatusCode.HTTP_NOT_FOUND,
  //       message: `Invoice not found`,
  //     };
  //   }

  //   let flight_data: any = {};
  //   let visa_data: any = {};
  //   let tour_data: any = {};
  //   let umrah_data: any = {};

  //   // //get data if ref type is flight
  //   // if (data[0].ref_type === "flight") {
  //   //   const flightModel = this.Model.flightBookingModel();
  //   //   const flight_res = await flightModel.getSingleFlightBooking({
  //   //     id: data[0].ref_id,
  //   //   });

  //   //   flight_data = {
  //   //     base_fare: flight_res[0].base_fare,
  //   //     total_tax: flight_res[0].total_tax,
  //   //     ait: flight_res[0].ait,
  //   //     discount: flight_res[0].discount,
  //   //     pnr_code: flight_res[0].pnr_code,
  //   //     payable_amount: flight_res[0].payable_amount,
  //   //     journey_type: flight_res[0].journey_type,
  //   //     total_passenger: flight_res[0].total_passenger,
  //   //     route: flight_res[0].route,
  //   //   };
  //   // }

  //   // //get data if ref type is visa
  //   // else if (data[0].ref_type === "visa") {
  //   //   const visaModel = this.Model.VisaModel();
  //   //   const visa_res = await visaModel.b2cSingleApplication(data[0].ref_id);

  //   //   visa_data = {
  //   //     country_name: visa_res.country_name,
  //   //     visa_fee: visa_res.visa_fee,
  //   //     processing_fee: visa_res.processing_fee,
  //   //     payable: visa_res.payable,
  //   //     total_passenger: visa_res.traveler,
  //   //   };
  //   // }

  //   // //get data if ref type is tour
  //   // else if (data[0].ref_type === "tour") {
  //   //   const tourModel = this.Model.tourPackageBookingModel();
  //   //   const tour_res = await tourModel.getSingleBookingInfo(data[0].ref_id);
  //   //   tour_data = {
  //   //     tour_name: tour_res.title,
  //   //     country_name: tour_res.country_name,
  //   //     traveler_adult: tour_res.traveler_adult,
  //   //     traveler_child: tour_res.traveler_child,
  //   //     adult_price: tour_res.adult_price,
  //   //     child_price: tour_res.child_price,
  //   //     discount: tour_res.discount,
  //   //     discount_type: tour_res.discount_type,
  //   //   };
  //   // }

  //   const money_receipt = await inv_model.singleMoneyReceipt(invoice_id);

  //   return {
  //     success: true,
  //     code: this.StatusCode.HTTP_OK,
  //     data: {
  //       ...data[0],
  //       // flight_data,
  //       // visa_data,
  //       // tour_data,
  //       money_receipt: money_receipt.length ? money_receipt : [],
  //     },
  //   };
  // }
}
