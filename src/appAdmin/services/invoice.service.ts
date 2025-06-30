import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IinsertFolioInvoiceReqPayload } from "../utlis/interfaces/invoice.interface";
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
        await invoiceModel.getFoliosEntriesbySingleBooking({
          hotel_code,
          booking_id,
          entry_ids: entryIDs,
        });

      console.log({ checkFolioEntries });

      if (checkFolioEntries.length !== entryIDs.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Invalid entries",
        };
      }

      // get folio entries amount
      const folioCalculation = await invoiceModel.getFolioEntriesCalculation(
        entryIDs
      );

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

      await Promise.all(
        folioInvoicePaylod.map(async (in_pld_item) => {
          const invFolioRes = await invoiceModel.insertFolioInvoice(
            in_pld_item
          );

          // insert in invoice items
          const invoiceItemPayload: {
            inv_folio_id: number;
            folio_entry_id: number;
            description: string;
            posting_type: string;
            debit: number;
            credit: number;
            room_id?: number;
            folio_id: number;
            rack_rate: number;
            date: string;
          }[] = [];

          checkFolioEntries.forEach((item) => {
            if (in_pld_item.folio_id === item.id)
              invoiceItemPayload.push({
                inv_folio_id: invFolioRes[0].id,
                debit: item.debit,
                credit: item.credit,
                posting_type: item.posting_type,
                rack_rate: item.rack_rate,
                date: item.date,
                folio_id: item.id,
                room_id: item.room_id as number,
                description: item.description,
                folio_entry_id: item.entries_id,
              });
          });

          await invoiceModel.insertInFolioInvoiceItems(invoiceItemPayload);
        })
      );
      // updated entries with invoice
      await invoiceModel.updateFolioEntries({ invoiced: true }, entryIDs);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Invoice has been created",
        data: {
          invoice_id: invRes[0].id,
        },
      };
    });
  }

  public async getAllFolioInvoice(req: Request) {
    const data =
      await this.Model.hotelInvoiceModel().getAllFolioInvoiceByBookingId({
        booking_id: parseInt(req.query.booking_id as string),
        hotel_code: req.hotel_admin.hotel_code,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getSingleFolioInvoice(req: Request) {
    const data = await this.Model.hotelInvoiceModel().getSingleFolioInvoice({
      inv_id: parseInt(req.params.id),
      hotel_code: req.hotel_admin.hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async deleteSingleFolioInvoice(req: Request) {
    const invModel = this.Model.hotelInvoiceModel();

    const inv_id = parseInt(req.params.id);
    const data = await invModel.getSingleFolioInvoice({
      inv_id,
      hotel_code: req.hotel_admin.hotel_code,
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const { inv_items } = data;

    const entryIds = inv_items.map((item) => item.folio_entry_id);

    await invModel.updateFolioEntries({ invoiced: false }, entryIds);

    await invModel.updateFolioInvoice({ is_void: true }, inv_id);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "The invoice has been voided",
    };
  }

  public async getSingleBookingRoomsInvoice(req: Request) {
    const data = await this.Model.hotelInvoiceModel().getSingleFolioInvoice({
      inv_id: parseInt(req.params.id),
      hotel_code: req.hotel_admin.hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
}
export default InvoiceService;
