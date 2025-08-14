import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { addPaymentReqBody } from "../utlis/interfaces/reservation.interface";
import { HelperFunction } from "../utlis/library/helperFunction";
import { SubReservationService } from "./subreservation.service";

export class ReservationService3 extends AbstractServices {
  constructor() {
    super();
  }

  public async getFoliosbySingleBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const invModel = this.Model.hotelInvoiceModel(trx);

      const data = await invModel.getFoliosbySingleBooking({
        hotel_code: req.hotel_admin.hotel_code,
        booking_id: parseInt(req.params.id),
      });

      const { total_credit, total_debit } =
        await invModel.getFolioEntriesCalculationByBookingID({
          hotel_code: req.hotel_admin.hotel_code,
          booking_id: parseInt(req.params.id),
        });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        total_credit,
        total_debit,
        data,
      };
    });
  }

  public async getFoliosWithEntriesbySingleBooking(req: Request) {
    const data =
      await this.Model.hotelInvoiceModel().getFoliosWithEntriesbySingleBooking({
        hotel_code: req.hotel_admin.hotel_code,
        booking_id: parseInt(req.params.id),
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getFolioEntriesbyFolioID(req: Request) {
    const data = await this.Model.hotelInvoiceModel().getFolioEntriesbyFolioID(
      req.hotel_admin.hotel_code,
      parseInt(req.params.id)
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async addPaymentByFolioID(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { acc_id, amount, folio_id, payment_date, remarks } =
        req.body as addPaymentReqBody;
      const sub = new SubReservationService(trx);

      const invModel = this.Model.hotelInvoiceModel(trx);
      const checkSingleFolio =
        await invModel.getSingleFoliobyHotelCodeAndFolioID(
          req.hotel_admin.hotel_code,
          folio_id
        );

      if (!checkSingleFolio) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // insert entries
      await sub.handlePaymentAndFolioForAddPayment({
        acc_id,
        amount,
        folio_id,
        guest_id: checkSingleFolio.guest_id,
        payment_for: "ADD MONEY",
        remarks,
        req,
        payment_date,
        booking_ref: checkSingleFolio.booking_ref,
        booking_id: Number(checkSingleFolio.booking_id),
        room_id: checkSingleFolio?.room_id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Payment has been added",
      };
    });
  }

  public async refundPaymentByFolioID(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { acc_id, amount, folio_id, payment_date, payment_type, remarks } =
        req.body as addPaymentReqBody;
      const sub = new SubReservationService(trx);

      const invModel = this.Model.hotelInvoiceModel(trx);
      const checkSingleFolio =
        await invModel.getSingleFoliobyHotelCodeAndFolioID(
          req.hotel_admin.hotel_code,
          folio_id
        );

      if (!checkSingleFolio) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // insert entries
      await sub.handlePaymentAndFolioForRefundPayment({
        acc_id,
        amount,
        folio_id,
        guest_id: checkSingleFolio.guest_id,
        payment_for: "REFUND",
        remarks,
        req,
        payment_date,
        booking_id: Number(checkSingleFolio.booking_id),
        booking_ref: checkSingleFolio.booking_ref,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Payment has been refunded",
      };
    });
  }

  public async adjustAmountByFolioID(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { amount, folio_id, remarks } = req.body as addPaymentReqBody;

      const invModel = this.Model.hotelInvoiceModel(trx);
      const checkSingleFolio =
        await invModel.getSingleFoliobyHotelCodeAndFolioID(
          req.hotel_admin.hotel_code,
          folio_id
        );

      if (!checkSingleFolio) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // check booking
      const booking = await this.Model.reservationModel(trx).getSingleBooking(
        req.hotel_admin.hotel_code,
        Number(checkSingleFolio.booking_id)
      );

      await this.Model.hotelInvoiceModel().insertInFolioEntries({
        debit: -amount,
        credit: 0,
        folio_id: folio_id,
        posting_type: "Adjustment",
        description: remarks,
      });

      const hotelModel = this.Model.HotelModel(trx);

      const heads = await hotelModel.getHotelAccConfig(
        req.hotel_admin.hotel_code,
        ["RECEIVABLE_HEAD_ID", "HOTEL_REVENUE_HEAD_ID"]
      );

      const receivable_head = heads.find(
        (h) => h.config === "RECEIVABLE_HEAD_ID"
      );
      if (!receivable_head) {
        throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
      }

      const sales_head = heads.find(
        (h) => h.config === "HOTEL_REVENUE_HEAD_ID"
      );

      if (!sales_head) {
        throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
      }

      const today = new Date().toISOString().split("T")[0];

      if (booking?.voucher_no)
        await this.Model.accountModel(trx).insertAccVoucher([
          {
            acc_head_id: receivable_head.head_id,
            created_by: req.hotel_admin.id,
            debit: 0,
            credit: amount,
            description: `Receivable for Adjusted amount, Booking Ref ${checkSingleFolio.booking_ref}`,
            voucher_date: today,
            voucher_no: booking?.voucher_no as string,
            hotel_code: req.hotel_admin.hotel_code,
          },
          {
            acc_head_id: sales_head.head_id,
            created_by: req.hotel_admin.id,
            debit: amount,
            credit: 0,
            description: `Sales for Adjusted amount, Booking ref ${checkSingleFolio.booking_ref}`,
            voucher_date: today,
            voucher_no: booking?.voucher_no as string,
            hotel_code: req.hotel_admin.hotel_code,
          },
        ]);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async addItemByFolioID(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { amount, folio_id, remarks } = req.body as addPaymentReqBody;

      const invModel = this.Model.hotelInvoiceModel(trx);
      const checkSingleFolio =
        await invModel.getSingleFoliobyHotelCodeAndFolioID(
          req.hotel_admin.hotel_code,
          folio_id
        );

      if (!checkSingleFolio) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await this.Model.hotelInvoiceModel(trx).insertInFolioEntries({
        debit: amount,
        folio_id: folio_id,
        posting_type: "CHARGE",
        description: remarks,
      });

      // insert entries
      const helper = new HelperFunction();
      const hotelModel = this.Model.HotelModel(trx);

      const heads = await hotelModel.getHotelAccConfig(
        req.hotel_admin.hotel_code,
        ["RECEIVABLE_HEAD_ID", "HOTEL_REVENUE_HEAD_ID"]
      );

      const receivable_head = heads.find(
        (h) => h.config === "RECEIVABLE_HEAD_ID"
      );

      if (!receivable_head) {
        throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
      }

      const sales_head = heads.find(
        (h) => h.config === "HOTEL_REVENUE_HEAD_ID"
      );

      if (!sales_head) {
        throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
      }
      // const voucher_no1 = await helper.generateVoucherNo("JV", trx);

      // check booking
      const booking = await this.Model.reservationModel(trx).getSingleBooking(
        req.hotel_admin.hotel_code,
        Number(checkSingleFolio.booking_id)
      );

      const today = new Date().toISOString().split("T")[0];

      if (booking?.voucher_no)
        await this.Model.accountModel(trx).insertAccVoucher([
          {
            acc_head_id: receivable_head.head_id,
            created_by: req.hotel_admin.id,
            debit: amount,
            credit: 0,
            description: `Receivable for ADD ITEM in ${checkSingleFolio.booking_ref}`,
            voucher_date: today,
            voucher_no: booking.voucher_no,
            hotel_code: req.hotel_admin.hotel_code,
          },
          {
            acc_head_id: sales_head.head_id,
            created_by: req.hotel_admin.id,
            debit: 0,
            credit: amount,
            description: `Sales for ADD ITEM in ${checkSingleFolio.booking_ref}`,
            voucher_date: today,
            voucher_no: booking.voucher_no,
            hotel_code: req.hotel_admin.hotel_code,
          },
        ]);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
