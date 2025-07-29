import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IinsertFolioInvoiceReqPayload } from "../utlis/interfaces/invoice.interface";
import { HelperFunction } from "../utlis/library/helperFunction";

export class FolioService extends AbstractServices {
  constructor() {
    super();
  }

  public async createFolio(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { booking_id, name } = req.body;

      const invoiceModel = this.Model.hotelInvoiceModel(trx);
      const reservationModel = this.Model.reservationModel(trx);

      const checkSingleBooking = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );

      if (!checkSingleBooking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      const [lastFolio] = await invoiceModel.getLasFolioId();

      const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);
      await invoiceModel.insertInFolio({
        booking_id,
        name,
        folio_number,
        hotel_code,
        type: "Custom",
        status: "open",
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Folio has been created",
      };
    });
  }
  public async splitMasterFolio(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { booking_id, name } = req.body;

      const invoiceModel = this.Model.hotelInvoiceModel(trx);
      const reservationModel = this.Model.reservationModel(trx);

      const checkSingleBooking = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );

      if (!checkSingleBooking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Entries has been splitted",
      };
    });
  }
}
