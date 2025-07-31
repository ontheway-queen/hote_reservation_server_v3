import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class MoneyRecieptService extends AbstractServices {
  constructor() {
    super();
  }

  public async getMoneyReceiptByFolio(req: Request) {
    const data = await this.Model.hotelInvoiceModel().getMoneyReceiptByFolio({
      folio_id: Number(req.params.id),
      hotel_code: req.hotel_admin.hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
}

export default MoneyRecieptService;
