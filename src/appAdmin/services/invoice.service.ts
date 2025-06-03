import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IcreateInvoicePayload,
  IinsertFolioInvoiceReqPayload,
} from "../utlis/interfaces/invoice.interface";

export class InvoiceService extends AbstractServices {
  constructor() {
    super();
  }

  public async createFolioInvoice(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { booking_id, folio_entry_ids } =
        req.body as IinsertFolioInvoiceReqPayload;

      const invoiceModel = this.Model.hotelInvoiceModel(trx);
      const reservationModel = this.Model.reservationModel(trx);

      const entryIDs: number[] = [];

      folio_entry_ids.forEach((item) =>
        item.entry_ids.forEach((i) => {
          entryIDs.push(i);
        })
      );

      // get folio entries
      const checkFolioEntries =
        await reservationModel.getFoliosEntriesbySingleBooking({
          hotel_code,
          booking_id,
          entry_ids: entryIDs,
        });

      if (checkFolioEntries.length !== entryIDs.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Invalid entries",
        };
      }

      // get folio entries amount
      const folioCalculation =
        await reservationModel.getFolioEntriesCalculation(entryIDs);

      const { due_amount, paid_amount, total_amount } = folioCalculation;

      // create invoice

      // const invRes = await invoiceModel.insertInFolioInvoice({
      //   hotel_code
      //   folio_id,
      // });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Invoice has been created",
      };
    });
  }
}
export default InvoiceService;
