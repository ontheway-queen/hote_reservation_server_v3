import { v4 as uuidv4 } from "uuid";
import AbstractServices from "../../abstarcts/abstract.service";
import { SurjoPaymentService } from "./surjoPaymentService";
import config from "../../config/config";
import {
  SERVER_SRJ_PAYMENT_CANCELLED_URL,
  SERVER_SRJ_PAYMENT_SUCCESS_RETURN_URL,
} from "../../utils/miscellaneous/constants";
export class BtocSubPaymentService extends AbstractServices {
  //surjopay sub payment for hotel
  public async createSurjopayPaymentOrderForHotel({
    amount,
    customer_email,
    customer_first_name,
    customer_last_name,
    customer_phone_number,
    ip,
    user_id,
    is_app,
    payment_for,
    hb_sl_id,
    booking_ref,
    hotel_code,
  }: {
    amount: string;
    ip: string;
    customer_first_name: string;
    customer_last_name: string;
    customer_email: string;
    customer_phone_number: string;
    booking_ref: string;
    user_id: number;
    is_app: string;
    payment_for?: string;
    hb_sl_id?: number;
    hotel_code: number;
  }) {
    const getToken = await new SurjoPaymentService().getSJToken(hotel_code);

    console.log({ getToken });

    if (!getToken) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "Token not found",
      };
    }

    const create_payment = await new SurjoPaymentService().createPayment({
      prefix: getToken.gateway.details.prefix,
      token: getToken.token,
      return_url:
        SERVER_SRJ_PAYMENT_SUCCESS_RETURN_URL + `?queries=${hotel_code}`,
      cancel_url: SERVER_SRJ_PAYMENT_CANCELLED_URL + `?queries=${hotel_code}`,
      store_id: getToken.store_id.toString(),
      amount,
      client_ip: ip as string,
      currency: "BDT",
      order_id: `BTCP_${uuidv4()}`,
      customer_name: customer_first_name + " " + customer_last_name,
      customer_email: customer_email,
      customer_phone: customer_phone_number,
      customer_address: "unknown",
      customer_city: "unknown",
      value1: JSON.stringify({
        payment_for,
        is_app: is_app ? Boolean(is_app) : false,
        user_id: user_id.toString(),
        hb_sl_id,
        hotel_code,
        booking_ref,
      }),
    });

    return create_payment;
  }
}
