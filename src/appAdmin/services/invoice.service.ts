import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IcreateInvoicePayload,
  IinsertFolioInvoiceReqPayload,
} from "../utlis/interfaces/invoice.interface";
import { HelperFunction } from "../utlis/library/helperFunction";

export class InvoiceService extends AbstractServices {
  constructor() {
    super();
  }

  public async createFolioInvoice(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { booking_id, folio_entry_ids, notes } =
        req.body as IinsertFolioInvoiceReqPayload;

      const invoiceModel = this.Model.hotelInvoiceModel(trx);
      const reservationModel = this.Model.reservationModel(trx);

      const entryIDs: number[] = [];
      const folioIDs: number[] = [];

      folio_entry_ids.forEach((item) => {
        folioIDs.push(item.folio_id);

        item.entry_ids.forEach((i) => {
          entryIDs.push(i);
        });
      });

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

      const invoice_no = await new HelperFunction().generateInvoiceNumber();

      // create invoice
      const invRes = await invoiceModel.insertInInvoice({
        hotel_code,
        invoice_date: new Date().toISOString(),
        invoice_number: invoice_no,
        total_amount,
        notes,
      });

      // insert in folio invoice
      const folioInvoicePaylod = folioIDs.map((item) => {
        return {
          invoice_id: invRes[0].id,
          folio_id: item,
          booking_id,
        };
      });

      await invoiceModel.insertFolioInvoice(folioInvoicePaylod);

      // insert in invoice items
      const invoiceItemPayload: {
        invoice_id: number;
        folio_entry_id: number;
        description: string;
        type: string;
        amount: number;
        folio_id: number;
      }[] = [];

      checkFolioEntries.forEach((item) => {
        invoiceItemPayload.push({
          invoice_id: invRes[0].id,
          amount: item.debit ? item.debit : item.credit,
          type: item.posting_type,
          folio_id: item.id,
          description: item.description,
          folio_entry_id: item.entries_id,
        });
      });

      await invoiceModel.insertInFolioInvoiceItems(invoiceItemPayload);

      // updated entries with invoice
      await reservationModel.updateFolioEntries({ invoiced: true }, entryIDs);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Invoice has been created",
      };
    });
  }
}
export default InvoiceService;
