// invoice.service.ts
import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IcreateInvoicePayload } from "../utlis/interfaces/invoice.interface";

export class InvoiceService extends AbstractServices {
  constructor() {
    super();
  }

  // get All invoice service
  public async getAllInvoice(req: Request) {
    const { from_date, to_date, key, limit, skip, due_inovice, user_id } =
      req.query;
    const { hotel_code } = req.hotel_admin;

    // model
    const model = this.Model.hotelInvoiceModel();

    const { data, total } = await model.getAllInvoice({
      hotel_code,
      from_date: from_date as string,
      to_date: to_date as string,
      key: key as string,
      limit: limit as string,
      skip: skip as string,
      due_inovice: due_inovice as string,
      user_id: user_id as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // get Single invoice service
  public async getSingleInvoice(req: Request) {
    const { invoice_id } = req.params;

    const model = this.Model.hotelInvoiceModel();
    const singleInvoiceData = await model.getSingleInvoice({
      hotel_code: req.hotel_admin.hotel_code,
      invoice_id: parseInt(invoice_id),
    });
    if (!singleInvoiceData.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: singleInvoiceData[0],
    };
  }

  // get All invoice for money receipt service
  public async getAllInvoiceForMoneyReceipt(req: Request) {
    const { from_date, to_date, key, limit, skip, due_inovice, user_id } =
      req.query;
    const { hotel_code } = req.hotel_admin;

    // model
    const model = this.Model.hotelInvoiceModel();

    const data = await model.getAllInvoiceForMoneyReciept({
      hotel_code,
      from_date: from_date as string,
      to_date: to_date as string,
      key: key as string,
      limit: limit as string,
      skip: skip as string,
      due_inovice: due_inovice as string,
      user_id: user_id as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,

      data,
    };
  }

  // create an invoice
  public async createInvoice(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id } = req.hotel_admin;
      const { user_id, discount_amount, tax_amount, invoice_item } =
        req.body as IcreateInvoicePayload;

      const guestModel = this.Model.guestModel(trx);

      //   checking user
      const checkUser = await guestModel.getSingleGuest({ id: user_id });
      if (!checkUser.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "User not found",
        };
      }

      let totalSubAmount = 0;

      if (invoice_item.length) {
        totalSubAmount = invoice_item.reduce((acc, item) => {
          const amount = (item.total_price || 0) * item.quantity;
          return acc + amount;
        }, 0);
      }

      const grandTotal = totalSubAmount + tax_amount - discount_amount;

      //=================== step for invoice ======================//

      // insert in invoice
      const invoiceModel = this.Model.hotelInvoiceModel(trx);

      // get last invoice
      const invoiceData = await invoiceModel.getAllInvoiceForLastId();

      const year = new Date().getFullYear();
      const InvoiceNo = invoiceData.length ? invoiceData[0].id + 1 : 1;

      // insert invoice
      const invoiceRes = await invoiceModel.insertHotelInvoice({
        invoice_no: `PNL-INV-${year}${InvoiceNo}`,
        description: `Inovice created by invoice Module, ${`due amount is =${grandTotal}`}`,
        created_by: id,
        discount_amount: discount_amount,
        grand_total: grandTotal,
        tax_amount: tax_amount,
        sub_total: totalSubAmount,
        due: grandTotal,
        hotel_code,
        type: "front_desk",
        user_id,
      });

      // insert invoice item
      const invoiceItem = invoice_item.map((item) => {
        return {
          invoice_id: invoiceRes[0],
          name: item.name,
          quantity: item.quantity,
          total_price: item.total_price,
        };
      });

      await invoiceModel.insertHotelInvoiceItem(invoiceItem);

      // debit
      await guestModel.insertGuestLedger({
        name: `PNL-INV-${year}${InvoiceNo}`,
        amount: grandTotal,
        pay_type: "debit",
        user_id,
        hotel_code,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Invoice has been created",
      };
    });
  }
}
export default InvoiceService;
