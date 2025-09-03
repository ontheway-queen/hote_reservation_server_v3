import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

export class BtocCommonService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAllPaymentGateway(req: Request) {
    const { hotel_code } = req.web_token;

    const data = await this.Model.paymentModel().getAllPaymentGatewayForBTOC({
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
}
