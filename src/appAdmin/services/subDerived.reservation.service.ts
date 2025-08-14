import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  BookingRoom,
  IBookingDetails,
} from "../utlis/interfaces/reservation.interface";
import { Knex } from "knex";
import { IinsertFolioEntriesPayload } from "../utlis/interfaces/invoice.interface";
import { SubReservationService } from "./subreservation.service";
import { HelperFunction } from "../utlis/library/helperFunction";
import CustomError from "../../utils/lib/customEror";

export class SubDerivedReservationService extends AbstractServices {
  private sub: SubReservationService;
  constructor(private trx: Knex.Transaction) {
    super();
    this.sub = new SubReservationService(trx);
  }
  public async changeRoomOfAIndividualReservation({
    booking_id,
    req,
    body,
    previouseRoom,
    booking,
    nights,
    new_rooms_rm_type_id,
  }: {
    previouseRoom: BookingRoom;
    booking_id: number;
    new_rooms_rm_type_id: number;
    nights: number;
    req: Request;
    booking: IBookingDetails;
    body: {
      previous_room_id: number;
      new_room_id: number;
      base_rate: number;
      changed_rate: number;
    };
  }) {
    const { new_room_id, previous_room_id, base_rate, changed_rate } = body;

    const reservationModel = this.Model.reservationModel(this.trx);
    const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
    const accountModel = this.Model.accountModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const hotel_code = req.hotel_admin.hotel_code;
    const admin_id = req.hotel_admin.id;

    let prevRoomAmount = 0;
    let newTotalAmount = 0;

    const primaryFolio = await invoiceModel.getFoliosbySingleBooking({
      booking_id,
      hotel_code,
      type: "Primary",
    });

    if (!primaryFolio.length) {
      return {
        success: false,
        code: 404,
        message: "Primary folio not found.",
      };
    }

    const folioEntriesByFolio = await invoiceModel.getFolioEntriesbyFolioID(
      hotel_code,
      primaryFolio[0].id
    );

    const folioEntryIDs = folioEntriesByFolio
      .filter((fe) => {
        if (
          (fe.posting_type == "ROOM_CHARGE" ||
            fe.posting_type == "VAT" ||
            fe.posting_type == "SERVICE_CHARGE") &&
          fe.room_id == previous_room_id
        ) {
          prevRoomAmount += Number(fe.debit);
          return fe;
        }
      })
      .map((fe) => fe.id);

    if (!folioEntryIDs.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Previous room folio entries not found",
      };
    }
    await invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);

    // update single boooking
    await this.sub.updateRoomAvailabilityService({
      reservation_type: "booked_room_decrease",
      rooms: [previouseRoom],
      hotel_code,
    });

    if (nights <= 0) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Invalid check‑in / check‑out dates.",
      };
    }

    const folioEntries: IinsertFolioEntriesPayload[] = [];

    for (let i = 0; i < nights; i++) {
      const date = this.sub.addDays(previouseRoom.check_in, i);
      const tariff = changed_rate;
      const vat = (tariff * booking.vat_percentage) / 100;
      const sc = (tariff * booking.service_charge_percentage) / 100;

      // Tariff
      folioEntries.push({
        folio_id: primaryFolio[0].id,
        date,
        posting_type: "ROOM_CHARGE",
        debit: tariff,
        credit: 0,
        room_id: new_room_id,
        description: "Room Tariff",
        rack_rate: base_rate,
      });

      // VAT
      if (vat > 0) {
        folioEntries.push({
          folio_id: primaryFolio[0].id,
          date,
          posting_type: "VAT",
          debit: vat,
          credit: 0,
          description: "VAT",
          rack_rate: 0,
          room_id: new_room_id,
        });
      }
      // Service Charge
      if (sc > 0) {
        folioEntries.push({
          folio_id: primaryFolio[0].id,
          date,
          posting_type: "SERVICE_CHARGE",
          debit: sc,
          credit: 0,
          description: "Service Charge",
          rack_rate: 0,
          room_id: new_room_id,
        });
      }
    }

    // insert new folio entries
    newTotalAmount = folioEntries.reduce(
      (ac, cu) => ac + Number(cu?.debit ?? 0),
      0
    );

    await invoiceModel.insertInFolioEntries(folioEntries);

    // update single booking rooms
    await reservationModel.updateSingleBookingRoom(
      {
        room_id: new_room_id,
        room_type_id: new_rooms_rm_type_id,
        unit_changed_rate: changed_rate,
        unit_base_rate: base_rate,
        changed_rate: changed_rate * nights,
        base_rate: base_rate * nights,
      },
      { booking_id, room_id: previous_room_id }
    );

    await this.sub.updateRoomAvailabilityService({
      reservation_type: "booked_room_increase",
      rooms: [
        {
          check_in: previouseRoom.check_in,
          check_out: previouseRoom.check_out,
          room_type_id: new_rooms_rm_type_id,
        },
      ],
      hotel_code,
    });

    //get folio entries calculation
    const { total_debit } =
      await invoiceModel.getFolioEntriesCalculationByBookingID({
        booking_id,
        hotel_code,
      });

    await reservationModel.updateRoomBooking(
      {
        total_amount: total_debit,
      },
      hotel_code,
      booking_id
    );

    //------------------ Accounting ------------------//

    const hotelModel = this.Model.HotelModel(this.trx);

    const heads = await hotelModel.getHotelAccConfig(hotel_code, [
      "RECEIVABLE_HEAD_ID",
      "HOTEL_REVENUE_HEAD_ID",
    ]);

    const receivable_head = heads.find(
      (h) => h.config === "RECEIVABLE_HEAD_ID"
    );

    if (!receivable_head) {
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
    }

    const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");

    if (!sales_head) {
      throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
    }

    const difference = Math.abs(newTotalAmount - prevRoomAmount);

    const isIncrease = newTotalAmount > prevRoomAmount;

    if (difference !== 0) {
      const receivableEntry = {
        acc_head_id: receivable_head.head_id,
        created_by: admin_id,
        debit: isIncrease ? difference : 0,
        credit: isIncrease ? 0 : difference,
        description: `Receivable for Change Room Of a reservation. Booking Ref ${booking.booking_reference}`,
        voucher_date: today,
        voucher_no: booking.voucher_no,
        hotel_code,
      };

      const salesEntry = {
        acc_head_id: sales_head.head_id,
        created_by: admin_id,
        debit: isIncrease ? 0 : difference,
        credit: isIncrease ? difference : 0,
        description: `Sales for Change Room Of a reservation. Booking Ref ${booking.booking_reference}`,
        voucher_date: today,
        voucher_no: booking.voucher_no,
        hotel_code,
      };

      await accountModel.insertAccVoucher([receivableEntry, salesEntry]);
    }
  }

  public async changeRoomOfAGroupReservation({
    booking_id,
    req,
    body,
    previouseRoom,
    booking,
    nights,
    new_rooms_rm_type_id,
    checkNewRoom,
  }: {
    previouseRoom: BookingRoom;
    booking_id: number;
    new_rooms_rm_type_id: number;
    nights: number;
    req: Request;
    booking: IBookingDetails;
    checkNewRoom: {
      id: number;
      room_name: string;
      floor_no: string;
      room_type_id: number;
      status: string;
    }[];
    body: {
      previous_room_id: number;
      new_room_id: number;
      base_rate: number;
      changed_rate: number;
    };
  }) {
    const { new_room_id, previous_room_id, base_rate, changed_rate } = body;

    const reservationModel = this.Model.reservationModel(this.trx);
    const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
    const accountModel = this.Model.accountModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const hotel_code = req.hotel_admin.hotel_code;
    const admin_id = req.hotel_admin.id;

    let prevRoomAmount = 0;
    let newTotalAmount = 0;
    // for group
    const roomFolios = await invoiceModel.getFoliosbySingleBooking({
      booking_id,
      hotel_code,
      type: "room_primary",
    });

    if (!roomFolios.length) {
      return {
        success: false,
        code: 404,
        message: "No room-primary folios found.",
      };
    }

    const prevRoomFolio = roomFolios.find(
      (rf) => rf.room_id === previous_room_id
    );

    if (!prevRoomFolio) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Previous rooms folio not found",
      };
    }

    const folioEntriesByFolio = await invoiceModel.getFolioEntriesbyFolioID(
      hotel_code,
      prevRoomFolio.id
    );

    // const folioEntryIDs = folioEntriesByFolio.map((fe) => fe.id);

    const folioEntryIDs = folioEntriesByFolio
      .filter((fe) => {
        if (
          fe.posting_type == "ROOM_CHARGE" ||
          fe.posting_type == "VAT" ||
          fe.posting_type == "SERVICE_CHARGE"
        ) {
          prevRoomAmount += Number(fe.debit);
          return fe;
        }
      })
      .map((fe) => fe.id);

    if (!folioEntryIDs.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Previous room folio entries not found",
      };
    }
    await invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);

    // update single boooking
    await this.sub.updateRoomAvailabilityService({
      reservation_type: "booked_room_decrease",
      rooms: [previouseRoom],
      hotel_code,
    });

    if (nights <= 0) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Invalid check‑in / check‑out dates.",
      };
    }

    const folioEntries: IinsertFolioEntriesPayload[] = [];

    for (let i = 0; i < nights; i++) {
      const date = this.sub.addDays(previouseRoom.check_in, i);
      const tariff = changed_rate;
      const vat = (tariff * booking.vat_percentage) / 100;
      const sc = (tariff * booking.service_charge_percentage) / 100;

      // Tariff
      folioEntries.push({
        folio_id: prevRoomFolio.id,
        date,
        posting_type: "ROOM_CHARGE",
        debit: tariff,
        credit: 0,
        room_id: new_room_id,
        description: "Room Tariff",
        rack_rate: base_rate,
      });

      // VAT
      if (vat > 0) {
        folioEntries.push({
          folio_id: prevRoomFolio.id,
          date,
          posting_type: "VAT",
          debit: vat,
          credit: 0,
          description: "VAT",
          rack_rate: 0,
        });
      }
      // Service Charge
      if (sc > 0) {
        folioEntries.push({
          folio_id: prevRoomFolio.id,
          date,
          posting_type: "SERVICE_CHARGE",
          debit: sc,
          credit: 0,
          description: "Service Charge",
          rack_rate: 0,
        });
      }
    }

    // insert new folio entries
    newTotalAmount = folioEntries.reduce(
      (ac, cu) => ac + Number(cu?.debit ?? 0),
      0
    );

    await invoiceModel.insertInFolioEntries(folioEntries);

    // update folio
    await invoiceModel.updateSingleFolio(
      {
        room_id: new_room_id,
        name: `Room ${checkNewRoom[0].room_name} Folio`,
      },
      { hotel_code, booking_id, folio_id: prevRoomFolio.id }
    );

    // update single booking rooms
    await reservationModel.updateSingleBookingRoom(
      {
        room_id: new_room_id,
        room_type_id: new_rooms_rm_type_id,
        unit_changed_rate: changed_rate,
        unit_base_rate: base_rate,
        changed_rate: changed_rate * nights,
        base_rate: base_rate * nights,
      },
      { booking_id, room_id: previous_room_id }
    );

    await this.sub.updateRoomAvailabilityService({
      reservation_type: "booked_room_increase",
      rooms: [
        {
          check_in: previouseRoom.check_in,
          check_out: previouseRoom.check_out,
          room_type_id: new_rooms_rm_type_id,
        },
      ],
      hotel_code,
    });

    //get folio entries calculation
    const { total_debit } =
      await invoiceModel.getFolioEntriesCalculationByBookingID({
        booking_id,
        hotel_code,
      });

    await reservationModel.updateRoomBooking(
      {
        total_amount: total_debit,
      },
      hotel_code,
      booking_id
    );

    //------------------ Accounting ------------------//

    const hotelModel = this.Model.HotelModel(this.trx);

    const heads = await hotelModel.getHotelAccConfig(hotel_code, [
      "RECEIVABLE_HEAD_ID",
      "HOTEL_REVENUE_HEAD_ID",
    ]);

    const receivable_head = heads.find(
      (h) => h.config === "RECEIVABLE_HEAD_ID"
    );

    if (!receivable_head) {
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
    }

    const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");

    if (!sales_head) {
      throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
    }

    const difference = Math.abs(newTotalAmount - prevRoomAmount);

    const isIncrease = newTotalAmount > prevRoomAmount;

    if (difference !== 0) {
      const receivableEntry = {
        acc_head_id: receivable_head.head_id,
        created_by: admin_id,
        debit: isIncrease ? difference : 0,
        credit: isIncrease ? 0 : difference,
        description: `Receivable for Change Room Of a reservation. Booking Ref ${booking.booking_reference}`,
        voucher_date: today,
        voucher_no: booking.voucher_no,
        hotel_code,
      };

      const salesEntry = {
        acc_head_id: sales_head.head_id,
        created_by: admin_id,
        debit: isIncrease ? 0 : difference,
        credit: isIncrease ? difference : 0,
        description: `Sales for Change Room Of a reservation. Booking Ref ${booking.booking_reference}`,
        voucher_date: today,
        voucher_no: booking.voucher_no,
        hotel_code,
      };

      await accountModel.insertAccVoucher([receivableEntry, salesEntry]);
    }
  }

  public async individualRoomDatesChangeOfBookingForIndividual({
    req,
    booking_id,
    nights,
    check_in,
    check_out,
    booking,
    bookingRoom,
    room_id,
    service_charge_percentage,
    vat_percentage,
  }: {
    req: Request;
    booking_id: number;
    check_in: string;
    check_out: string;
    booking: IBookingDetails;
    room_id: number;
    bookingRoom: BookingRoom;
    nights: number;
    vat_percentage: number;
    service_charge_percentage: number;
  }) {
    const reservationModel = this.Model.reservationModel(this.trx);
    const invoiceModel = this.Model.hotelInvoiceModel(this.trx);

    const hotel_code = req.hotel_admin.hotel_code;
    const admin_id = req.hotel_admin.id;

    const {
      check_in: prevCheckIn,
      check_out: prevCheckOut,
      unit_base_rate,
      unit_changed_rate,
      room_type_id,
    } = bookingRoom;

    const primaryFolio = await invoiceModel.getFoliosbySingleBooking({
      hotel_code,
      booking_id,
      type: "Primary",
    });
    console.log({ primaryFolio });
    if (!primaryFolio.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Primary folio not found",
      };
    }

    const folioEntries: IinsertFolioEntriesPayload[] = [];

    for (let i = 0; i < nights; i++) {
      const date = this.sub.addDays(check_in, i);
      const tariff = unit_changed_rate;
      const vat = (tariff * vat_percentage) / 100;
      const sc = (tariff * service_charge_percentage) / 100;

      // Tariff
      folioEntries.push({
        folio_id: primaryFolio[0].id,
        date,
        posting_type: "ROOM_CHARGE",
        debit: tariff,
        credit: 0,
        room_id,
        description: "Room Tariff",
        rack_rate: unit_base_rate,
      });

      // VAT
      if (vat > 0) {
        folioEntries.push({
          folio_id: primaryFolio[0].id,
          date,
          posting_type: "VAT",
          debit: vat,
          credit: 0,
          description: "VAT",
          rack_rate: 0,
          room_id,
        });
      }

      // Service Charge
      if (sc > 0) {
        folioEntries.push({
          folio_id: primaryFolio[0].id,
          date,
          posting_type: "SERVICE_CHARGE",
          debit: sc,
          credit: 0,
          description: "Service Charge",
          rack_rate: 0,
          room_id,
        });
      }
    }

    const folioEntriesByFolio = await invoiceModel.getFolioEntriesbyFolioID(
      hotel_code,
      primaryFolio[0].id
    );

    let prevRoomAmount = 0;

    const folioEntryIDs = folioEntriesByFolio
      .filter((fe) => {
        if (
          (fe.posting_type == "ROOM_CHARGE" ||
            fe.posting_type == "VAT" ||
            fe.posting_type == "SERVICE_CHARGE") &&
          fe.room_id == room_id
        ) {
          prevRoomAmount += Number(fe.debit);
          return fe;
        }
      })
      .map((fe) => fe.id);

    if (!folioEntryIDs.length) {
      new CustomError(
        "No folio entries found for the specified room.",
        this.StatusCode.HTTP_NOT_FOUND
      );
    }

    await invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);

    await this.sub.updateRoomAvailabilityService({
      reservation_type: "booked_room_decrease",
      rooms: [bookingRoom], // uses previous dates
      hotel_code,
    });

    // insert new folio entries
    let newTotalAmount = folioEntries.reduce(
      (ac, cu) => ac + Number(cu?.debit ?? 0),
      0
    );

    await invoiceModel.insertInFolioEntries(folioEntries);

    console.log({ room_id, booking_id });
    await reservationModel.updateSingleBookingRoom(
      {
        check_in,
        check_out,
        changed_rate: unit_changed_rate * nights,
        base_rate: unit_base_rate * nights,
      },
      { room_id, booking_id }
    );

    //------------------ Accounting ------------------//

    const hotelModel = this.Model.HotelModel(this.trx);

    const heads = await hotelModel.getHotelAccConfig(hotel_code, [
      "RECEIVABLE_HEAD_ID",
      "HOTEL_REVENUE_HEAD_ID",
    ]);

    const receivable_head = heads.find(
      (h) => h.config === "RECEIVABLE_HEAD_ID"
    );

    if (!receivable_head) {
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
    }

    const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");

    if (!sales_head) {
      throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
    }

    const accountModel = this.Model.accountModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const difference = Math.abs(newTotalAmount - prevRoomAmount);
    const isIncrease = newTotalAmount > prevRoomAmount;
    const actionText = isIncrease
      ? "Increased Reservation Date"
      : "Decreased Reservation Date";

    const receivableEntry = {
      acc_head_id: receivable_head.head_id,
      created_by: admin_id,
      debit: isIncrease ? difference : 0,
      credit: isIncrease ? 0 : difference,
      description: `Receivable for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
      voucher_date: today,
      voucher_no: booking.voucher_no,
      hotel_code,
    };

    const salesEntry = {
      acc_head_id: sales_head.head_id,
      created_by: admin_id,
      debit: isIncrease ? 0 : difference,
      credit: isIncrease ? difference : 0,
      description: `Sales for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
      voucher_date: today,
      voucher_no: booking.voucher_no,
      hotel_code,
    };

    await accountModel.insertAccVoucher([receivableEntry, salesEntry]);

    // updat room availability
    await this.sub.updateRoomAvailabilityService({
      reservation_type: "booked_room_increase",
      rooms: [
        {
          ...bookingRoom,
          check_in,
          check_out,
        },
      ],
      hotel_code,
    });
  }

  public async individualRoomDatesChangeOfBookingForGroup({
    req,
    booking_id,
    nights,
    check_in,
    check_out,
    booking,
    bookingRoom,
    room_id,
    service_charge_percentage,
    vat_percentage,
  }: {
    req: Request;
    booking_id: number;
    check_in: string;
    check_out: string;
    booking: IBookingDetails;
    room_id: number;
    bookingRoom: BookingRoom;
    nights: number;
    vat_percentage: number;
    service_charge_percentage: number;
  }) {
    const reservationModel = this.Model.reservationModel(this.trx);
    const invoiceModel = this.Model.hotelInvoiceModel(this.trx);

    const hotel_code = req.hotel_admin.hotel_code;
    const admin_id = req.hotel_admin.id;

    const {
      check_in: prevCheckIn,
      check_out: prevCheckOut,
      unit_base_rate,
      unit_changed_rate,
      room_type_id,
    } = bookingRoom;

    const roomFoliosByBooking = await invoiceModel.getFoliosbySingleBooking({
      booking_id,
      hotel_code,
      type: "room_primary",
    });

    if (!roomFoliosByBooking.length) {
      return {
        success: false,
        code: 404,
        message: "No room-primary folios found.",
      };
    }

    const prevRoomFolio = roomFoliosByBooking.find(
      (rf) => rf.room_id === room_id
    );

    if (!prevRoomFolio) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Previous rooms folio not found",
      };
    }

    const folioEntries: IinsertFolioEntriesPayload[] = [];

    for (let i = 0; i < nights; i++) {
      const date = this.sub.addDays(check_in, i);
      const tariff = unit_changed_rate;
      const vat = (tariff * vat_percentage) / 100;
      const sc = (tariff * service_charge_percentage) / 100;

      // Tariff
      folioEntries.push({
        folio_id: prevRoomFolio.id,
        date,
        posting_type: "ROOM_CHARGE",
        debit: tariff,
        credit: 0,
        room_id,
        description: "Room Tariff",
        rack_rate: unit_base_rate,
      });

      // VAT
      if (vat > 0) {
        folioEntries.push({
          folio_id: prevRoomFolio.id,
          date,
          posting_type: "VAT",
          debit: vat,
          credit: 0,
          description: "VAT",
          rack_rate: 0,
        });
      }

      // Service Charge
      if (sc > 0) {
        folioEntries.push({
          folio_id: prevRoomFolio.id,
          date,
          posting_type: "SERVICE_CHARGE",
          debit: sc,
          credit: 0,
          description: "Service Charge",
          rack_rate: 0,
        });
      }
    }

    const folioEntriesByFolio = await invoiceModel.getFolioEntriesbyFolioID(
      hotel_code,
      prevRoomFolio.id
    );

    console.log({ folioEntriesByFolio });

    // const folioEntryIDs = folioEntriesByFolio.map((fe) => fe.id);

    let prevRoomAmount = 0;

    const folioEntryIDs = folioEntriesByFolio
      .filter((fe) => {
        if (
          fe.posting_type == "ROOM_CHARGE" ||
          fe.posting_type == "VAT" ||
          fe.posting_type == "SERVICE_CHARGE"
        ) {
          prevRoomAmount += Number(fe.debit);
          return fe;
        }
      })
      .map((fe) => fe.id);

    console.log({ room_id, folioEntryIDs, prevRoomAmount });

    if (!folioEntryIDs.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "No folio entries found for the specified room.",
      };
    }
    await invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);

    await this.sub.updateRoomAvailabilityService({
      reservation_type: "booked_room_decrease",
      rooms: [bookingRoom], // uses previous dates
      hotel_code,
    });

    // insert new folio entries
    let newTotalAmount = folioEntries.reduce(
      (ac, cu) => ac + Number(cu?.debit ?? 0),
      0
    );

    await invoiceModel.insertInFolioEntries(folioEntries);

    await reservationModel.updateSingleBookingRoom(
      {
        check_in,
        check_out,
        changed_rate: unit_changed_rate * nights,
        base_rate: unit_base_rate * nights,
      },
      { room_id, booking_id }
    );

    //------------------ Accounting ------------------//

    const hotelModel = this.Model.HotelModel(this.trx);

    const heads = await hotelModel.getHotelAccConfig(hotel_code, [
      "RECEIVABLE_HEAD_ID",
      "HOTEL_REVENUE_HEAD_ID",
    ]);

    const receivable_head = heads.find(
      (h) => h.config === "RECEIVABLE_HEAD_ID"
    );

    if (!receivable_head) {
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
    }

    const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");

    if (!sales_head) {
      throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
    }

    const accountModel = this.Model.accountModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const difference = Math.abs(newTotalAmount - prevRoomAmount);
    const isIncrease = newTotalAmount > prevRoomAmount;
    const actionText = isIncrease
      ? "Increased Reservation Date"
      : "Decreased Reservation Date";

    const receivableEntry = {
      acc_head_id: receivable_head.head_id,
      created_by: admin_id,
      debit: isIncrease ? difference : 0,
      credit: isIncrease ? 0 : difference,
      description: `Receivable for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
      voucher_date: today,
      voucher_no: booking.voucher_no,
      hotel_code,
    };

    const salesEntry = {
      acc_head_id: sales_head.head_id,
      created_by: admin_id,
      debit: isIncrease ? 0 : difference,
      credit: isIncrease ? difference : 0,
      description: `Sales for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
      voucher_date: today,
      voucher_no: booking.voucher_no,
      hotel_code,
    };

    await accountModel.insertAccVoucher([receivableEntry, salesEntry]);

    // updat room availability
    await this.sub.updateRoomAvailabilityService({
      reservation_type: "booked_room_increase",
      rooms: [
        {
          ...bookingRoom,
          check_in,
          check_out,
        },
      ],
      hotel_code,
    });
  }

  public async changeDateOfBookingForIndividual({
    booking_rooms,
    nights,
    check_in,
    vat_percentage,
    service_charge_percentage,
    check_out,
    req,
    booking_id,
    booking,
    primaryFolio,
  }: {
    booking_rooms: BookingRoom[];
    nights: number;
    check_in: string;
    vat_percentage: number;
    service_charge_percentage: number;
    check_out: string;
    req: Request;
    booking_id: number;
    booking: IBookingDetails;
    primaryFolio: { id: number; name: string; room_id: number }[];
  }) {
    const reservationModel = this.Model.reservationModel(this.trx);
    const invoiceModel = this.Model.hotelInvoiceModel(this.trx);

    const hotel_code = req.hotel_admin.hotel_code;
    const admin_id = req.hotel_admin.id;

    const folioEntries: IinsertFolioEntriesPayload[] = [];
    for (const room of booking_rooms) {
      for (let i = 0; i < nights; i++) {
        const date = this.sub.addDays(check_in, i);
        const tariff = room.unit_changed_rate;
        const vat = (tariff * vat_percentage) / 100;
        const sc = (tariff * service_charge_percentage) / 100;

        folioEntries.push({
          folio_id: primaryFolio[0].id,
          date,
          posting_type: "ROOM_CHARGE",
          debit: tariff,
          credit: 0,
          room_id: room.room_id,
          description: "Room Tariff",
          rack_rate: room.unit_base_rate,
        });

        if (vat > 0) {
          folioEntries.push({
            folio_id: primaryFolio[0].id,
            date,
            posting_type: "VAT",
            debit: vat,
            credit: 0,
            room_id: room.room_id,
            description: "VAT",
            rack_rate: 0,
          });
        }

        if (sc > 0) {
          folioEntries.push({
            folio_id: primaryFolio[0].id,
            date,
            posting_type: "SERVICE_CHARGE",
            debit: sc,
            credit: 0,
            room_id: room.room_id,
            description: "Service Charge",
            rack_rate: 0,
          });
        }
      }
    }

    let newTotalAmount = folioEntries.reduce(
      (ac, cu) => ac + Number(cu?.debit ?? 0),
      0
    );

    const folioEntriesByFolio = await invoiceModel.getFolioEntriesbyFolioID(
      hotel_code,
      primaryFolio[0].id
    );

    let prevRoomAmount = 0;

    const entryIdsToVoid = folioEntriesByFolio
      .filter((fe) => {
        if (
          (fe.posting_type == "ROOM_CHARGE" ||
            fe.posting_type == "VAT" ||
            fe.posting_type == "SERVICE_CHARGE") &&
          fe.room_id
        ) {
          prevRoomAmount += Number(fe.debit);
          return fe;
        }
      })
      .map((fe) => fe.id);

    if (entryIdsToVoid.length) {
      await invoiceModel.updateFolioEntries({ is_void: true }, entryIdsToVoid);
    }

    await invoiceModel.insertInFolioEntries(folioEntries);

    await this.sub.updateRoomAvailabilityService({
      reservation_type: "booked_room_decrease",
      rooms: booking_rooms,
      hotel_code,
    });

    const updateRooms: BookingRoom[] = [];

    for (const r of booking_rooms) {
      updateRooms.push({
        ...r,
        check_in,
        check_out,
        changed_rate: r.unit_changed_rate * nights,
        base_rate: r.unit_base_rate * nights,
      });
    }

    const roomsUpdate = updateRooms.map((r) => {
      return reservationModel.updateSingleBookingRoom(
        {
          check_in,
          check_out,
          changed_rate: r.unit_changed_rate * nights,
          base_rate: r.unit_base_rate * nights,
        },
        { room_id: r.room_id, booking_id }
      );
    });
    await Promise.all(roomsUpdate);

    //  Block inventory for new range
    await this.sub.updateRoomAvailabilityService({
      reservation_type: "booked_room_increase",
      rooms: updateRooms,
      hotel_code,
    });

    //------------------ Accounting ------------------//

    const helper = new HelperFunction();
    const hotelModel = this.Model.HotelModel(this.trx);

    const heads = await hotelModel.getHotelAccConfig(hotel_code, [
      "RECEIVABLE_HEAD_ID",
      "HOTEL_REVENUE_HEAD_ID",
    ]);

    const receivable_head = heads.find(
      (h) => h.config === "RECEIVABLE_HEAD_ID"
    );

    if (!receivable_head) {
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
    }

    const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");

    if (!sales_head) {
      throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
    }

    const accountModel = this.Model.accountModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const difference = Math.abs(newTotalAmount - prevRoomAmount);
    const isIncrease = newTotalAmount > prevRoomAmount;
    const actionText = isIncrease
      ? "Increased Reservation Date"
      : "Decreased Reservation Date";

    if (difference !== 0) {
      const receivableEntry = {
        acc_head_id: receivable_head.head_id,
        created_by: admin_id,
        debit: isIncrease ? difference : 0,
        credit: isIncrease ? 0 : difference,
        description: `Receivable for ${actionText} of overall room booking ${booking.booking_reference}`,
        voucher_date: today,
        voucher_no: booking.voucher_no,
        hotel_code,
      };

      const salesEntry = {
        acc_head_id: sales_head.head_id,
        created_by: admin_id,
        debit: isIncrease ? 0 : difference,
        credit: isIncrease ? difference : 0,
        description: `Sales for ${actionText} of overall room booking ${booking.booking_reference}`,
        voucher_date: today,
        voucher_no: booking.voucher_no,
        hotel_code,
      };

      await accountModel.insertAccVoucher([receivableEntry, salesEntry]);
    }
  }

  public async changeDateOfBookingForGroupReservation({
    booking_rooms,
    nights,
    check_in,
    vat_percentage,
    service_charge_percentage,
    check_out,
    req,
    booking_id,
    booking,
    primaryFolio,
  }: {
    booking_rooms: BookingRoom[];
    nights: number;
    check_in: string;
    vat_percentage: number;
    service_charge_percentage: number;
    check_out: string;
    req: Request;
    booking_id: number;
    booking: IBookingDetails;
    primaryFolio: { id: number; name: string; room_id: number }[];
  }) {
    const reservationModel = this.Model.reservationModel(this.trx);
    const invoiceModel = this.Model.hotelInvoiceModel(this.trx);

    const hotel_code = req.hotel_admin.hotel_code;
    const admin_id = req.hotel_admin.id;

    const folioEntries: IinsertFolioEntriesPayload[] = [];
    for (const room of booking_rooms) {
      for (let i = 0; i < nights; i++) {
        const date = this.sub.addDays(check_in, i);
        const tariff = room.unit_changed_rate;
        const vat = (tariff * vat_percentage) / 100;
        const sc = (tariff * service_charge_percentage) / 100;

        folioEntries.push({
          folio_id: primaryFolio[0].id,
          date,
          posting_type: "ROOM_CHARGE",
          debit: tariff,
          credit: 0,
          room_id: room.room_id,
          description: "Room Tariff",
          rack_rate: room.unit_base_rate,
        });

        if (vat > 0) {
          folioEntries.push({
            folio_id: primaryFolio[0].id,
            date,
            posting_type: "VAT",
            debit: vat,
            credit: 0,
            room_id: room.room_id,
            description: "VAT",
            rack_rate: 0,
          });
        }

        if (sc > 0) {
          folioEntries.push({
            folio_id: primaryFolio[0].id,
            date,
            posting_type: "SERVICE_CHARGE",
            debit: sc,
            credit: 0,
            room_id: room.room_id,
            description: "Service Charge",
            rack_rate: 0,
          });
        }
      }
    }

    let newTotalAmount = folioEntries.reduce(
      (ac, cu) => ac + Number(cu?.debit ?? 0),
      0
    );

    const folioEntriesByFolio = await invoiceModel.getFolioEntriesbyFolioID(
      hotel_code,
      primaryFolio[0].id
    );

    let prevRoomAmount = 0;

    const entryIdsToVoid = folioEntriesByFolio
      .filter((fe) => {
        if (
          (fe.posting_type == "ROOM_CHARGE" ||
            fe.posting_type == "VAT" ||
            fe.posting_type == "SERVICE_CHARGE") &&
          fe.room_id
        ) {
          prevRoomAmount += Number(fe.debit);
          return fe;
        }
      })
      .map((fe) => fe.id);

    if (entryIdsToVoid.length) {
      await invoiceModel.updateFolioEntries({ is_void: true }, entryIdsToVoid);
    }

    await invoiceModel.insertInFolioEntries(folioEntries);

    await this.sub.updateRoomAvailabilityService({
      reservation_type: "booked_room_decrease",
      rooms: booking_rooms,
      hotel_code,
    });

    const updateRooms: BookingRoom[] = [];

    for (const r of booking_rooms) {
      updateRooms.push({
        ...r,
        check_in,
        check_out,
        changed_rate: r.unit_changed_rate * nights,
        base_rate: r.unit_base_rate * nights,
      });
    }

    const roomsUpdate = updateRooms.map((r) => {
      return reservationModel.updateSingleBookingRoom(
        {
          check_in,
          check_out,
          changed_rate: r.unit_changed_rate * nights,
          base_rate: r.unit_base_rate * nights,
        },
        { room_id: r.room_id, booking_id }
      );
    });
    await Promise.all(roomsUpdate);

    //  Block inventory for new range
    await this.sub.updateRoomAvailabilityService({
      reservation_type: "booked_room_increase",
      rooms: updateRooms,
      hotel_code,
    });

    //------------------ Accounting ------------------//

    const helper = new HelperFunction();
    const hotelModel = this.Model.HotelModel(this.trx);

    const heads = await hotelModel.getHotelAccConfig(hotel_code, [
      "RECEIVABLE_HEAD_ID",
      "HOTEL_REVENUE_HEAD_ID",
    ]);

    const receivable_head = heads.find(
      (h) => h.config === "RECEIVABLE_HEAD_ID"
    );

    if (!receivable_head) {
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
    }

    const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");

    if (!sales_head) {
      throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
    }

    const accountModel = this.Model.accountModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const difference = Math.abs(newTotalAmount - prevRoomAmount);
    const isIncrease = newTotalAmount > prevRoomAmount;
    const actionText = isIncrease
      ? "Increased Reservation Date"
      : "Decreased Reservation Date";

    if (difference !== 0) {
      const receivableEntry = {
        acc_head_id: receivable_head.head_id,
        created_by: admin_id,
        debit: isIncrease ? difference : 0,
        credit: isIncrease ? 0 : difference,
        description: `Receivable for ${actionText} of overall room booking ${booking.booking_reference}`,
        voucher_date: today,
        voucher_no: booking.voucher_no,
        hotel_code,
      };

      const salesEntry = {
        acc_head_id: sales_head.head_id,
        created_by: admin_id,
        debit: isIncrease ? 0 : difference,
        credit: isIncrease ? difference : 0,
        description: `Sales for ${actionText} of overall room booking ${booking.booking_reference}`,
        voucher_date: today,
        voucher_no: booking.voucher_no,
        hotel_code,
      };

      await accountModel.insertAccVoucher([receivableEntry, salesEntry]);
    }
  }
}
