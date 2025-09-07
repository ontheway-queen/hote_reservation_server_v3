import axios from "axios";
import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { SurjoPaymentService } from "../../btoc/services/surjoPaymentService";
import { BTOC_CLIENT_DOMAIN } from "../../utils/miscellaneous/constants";
import CustomError from "../../utils/lib/customEror";
import Lib from "../../utils/lib/lib";
import { SubBtocHotelService } from "../../btoc/services/btoc.subHotel.service";
import { IGBookedRoomTypeRequest } from "../../appAdmin/utlis/interfaces/reservation.interface";

class PaymentService extends AbstractServices {
  constructor() {
    super();
  }

  public async btocSurjoPaymentSuccess(req: Request) {
    const parseJsonSafe = <T = any>(raw: string): T | null => {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    };

    return this.db.transaction(async (trx) => {
      console.log(req.query, "query");
      console.log(req.body, "req body");

      const query = req.query?.queries as string;
      const split_queries = query.split("?");

      console.log({ split_queries });
      const hotel_code = split_queries[0];
      console.log(hotel_code);
      const split_order_id = split_queries[1].split("=");
      console.log({ split_order_id });
      const order_id = split_order_id[1];

      console.log(order_id);

      if (!hotel_code) {
        throw new CustomError(
          "Did not pass hotel code into payment success",
          400
        );
      }
      const surjoService = new SurjoPaymentService();
      const token = await surjoService.getSJToken(Number(hotel_code));

      const verify = await surjoService.verifyPayment(
        String(order_id ?? ""),
        token.token
      );

      console.log({ verify });

      const sp_verify = Array.isArray(verify) ? verify[0] : undefined;
      if (!sp_verify) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Unable to verify payment.",
        };
      }

      const isSuccess = sp_verify.sp_code === "1000";

      const payload = parseJsonSafe<{
        is_app?: string | number | boolean;
        payment_for?: string;
        user_id: number;
        booking_id?: string | number;
        hb_sl_id: number;
        invoice_id?: number;
        hotel_code: number;
      }>(sp_verify.value1 as string);

      console.log({ payload });

      if (!isSuccess) {
        return {
          success: false,
          code: this.StatusCode.HTTP_OK,
          message: this.ResMsg.PAYMENT_CANCELLED,
          redirect_url: Lib.buildURL(`${BTOC_CLIENT_DOMAIN}/payment/failed`, {
            order_id: req.query.order_id ?? "",
            payment_for: payload?.payment_for ?? "",
            invoice_id: payload?.invoice_id ?? "",
            booking_id: payload?.booking_id ?? "",
            sp_code: sp_verify.sp_code ?? "",
            gross_amount: sp_verify.amount ?? "",
            payable_amount: sp_verify.payable_amount ?? "",
            customer_order_id: sp_verify.customer_order_id ?? "",
            order_id_pg: sp_verify.order_id ?? "",
            trx_no: sp_verify.invoice_no ?? "",
            payment_time: sp_verify.date_time ?? "",
            status: "failed",
          }),
        };
      }

      // get single booking
      const singleBooking =
        await this.Model.reservationModel().getSingleBooking(
          Number(hotel_code),
          payload?.hb_sl_id as number
        );

      if (!singleBooking) {
        throw new CustomError("Reservation not found", 404);
      }

      const sub = new SubBtocHotelService(trx);
      const hotelInvModel = this.Model.btocInvoiceModel(trx);

      const {
        booking_rooms,
        address,
        booking_date,
        booking_reference,
        booking_type,
        check_in,
        check_out,
        comments,
        country_name,
        drop,
        drop_time,
        drop_to,
        first_name,
        guest_email,
        guest_id,
        is_individual_booking,
        last_name,
        pickup,
      } = singleBooking;

      const body = sub.mapSingleBookingToFolioBody(singleBooking);

      await sub.createBtocRoomBookingFolioWithEntries({
        body,
        hotel_code: Number(hotel_code),
        guest_id: singleBooking.guest_id,
        booking_id: payload?.hb_sl_id as number,
        booking_ref: singleBooking.booking_reference,
        req,
      });

      // const [invoice] = await invModel.singleInvoice({
      //   id: payload.invoice_id,
      // });

      // const invRes = await invModel.insertInInvoice({
      //   hotel_code: Number(hotel_code),
      //   invoice_date: new Date().toUTCString(),
      //   invoice_number: singleBooking.booking_reference,
      //   total_amount: singleBooking.total_amount,
      // });

      // invoice item

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.PAYMENT_SUCCESS,
        redirect_url: Lib.buildURL(`${BTOC_CLIENT_DOMAIN}/payment/success`, {
          sp_invoice_no: sp_verify.invoice_no ?? "",
          gross_amount: sp_verify.amount ?? "",
          net_paid_amount: sp_verify.payable_amount ?? "",
          net_received_amount: sp_verify.received_amount,
          // gateway_fee_percentage: SHURJO_PAY_PERCENTAGE,
          payment_time: sp_verify.date_time ?? "",
          customer_order_id: sp_verify.customer_order_id ?? "",
          order_id: sp_verify.order_id ?? "",
          order_id_query: req.query.order_id ?? "",
          user_id: payload?.user_id ?? "",
          booking_id: payload?.booking_id ?? "",
          hb_sl_id: payload?.hb_sl_id ?? "",
          // invoice_id: invoice?.id,
          // trx_id: transactionRes?.[0]?.id ?? "",
          status: "success",
        }),
      };
    });
  }

  public async btocSurjoPaymentCancelled(req: Request) {
    const getToken = await new SurjoPaymentService().getSJToken(
      Number(req.query.hotel_code as string)
    );
    const verify_payment = await new SurjoPaymentService().verifyPayment(
      req.query.order_id as string,
      getToken.token
    );

    const { value2: is_app } = verify_payment[0];

    // if (parseInt(is_app)) {
    //   return {
    //     success: true,
    //     code: this.StatusCode.HTTP_OK,
    //     message: "Payment has been canceled",
    //   };
    // }

    return {
      success: false,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.PAYMENT_CANCELLED,
      redirect_url: `${BTOC_CLIENT_DOMAIN}/payment/failed`,
    };
  }

  // payment failed
  public async btocSurjoPaymentFailed(req: Request) {
    const body = req.body;

    // const tran_id = body.tran_id.split("-");
    // if (tran_id.length !== 3) {
    //   return {
    //     success: true,
    //     code: this.StatusCode.HTTP_OK,
    //     message: "Unverified Transaction",
    //     redirect_url: `${CLIENT_DOMAIN}/failure`,
    //   };
    // }
    // const [paymentTryId, bookingId, user_id] = tran_id;
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Payment Failed",

      redirect_url: `${BTOC_CLIENT_DOMAIN}/payment/failed`,
    };
  }
}
export default PaymentService;
