import axios from "axios";

import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import CustomError from "../../utils/lib/customEror";
import {
  GET_TOKEN_URL,
  PAYMENT_PAY_URL,
  PAYMENT_VERIFY_URL,
} from "../../utils/miscellaneous/constants";
import {
  IGetPaymentGatewaySetting,
  IShurjoVerifyPayment,
} from "../../appAdmin/utlis/interfaces/payment.gateway.interface";

export class SurjoPaymentService extends AbstractServices {
  public async getSJToken(hotel_code: number): Promise<{
    token: string;
    store_id: number;
    execute_url: string;
    token_type: string;
    sp_code: string;
    message: string;
    gateway: IGetPaymentGatewaySetting<any>;
  }> {
    // get surjo pay username, password
    const gateway =
      await this.Model.paymentModel().getSinglePaymentGatewayByType({
        hotel_code,
        type: "SURJO_PAY",
      });

    if (!gateway) {
      throw new CustomError("Surjopay gateway Not found", 404);
    }

    const details = gateway.details as any;

    const { data } = await axios.post(GET_TOKEN_URL, {
      username: details.username,
      password: details.password,
    });

    return { ...data, gateway };
  }

  //   create payment
  public async createPayment(payload: {
    prefix: string;
    token: string;
    return_url: string;
    cancel_url: string;
    store_id: string;
    amount: string;
    currency: string;
    order_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    client_ip: string;
    value1?: string;
    value2?: boolean;
    value3?: string;
  }) {
    const response = await axios.post(PAYMENT_PAY_URL, payload);

    return response.data;
  }

  public async verifyPayment(
    order_id: string,
    token: string
  ): Promise<IShurjoVerifyPayment[]> {
    const response = await axios.post(PAYMENT_VERIFY_URL, {
      order_id,
      token,
    });

    return response.data;
  }
}
