import { Knex } from "knex";
import {
  BookingRequestBody,
  BookingRoom,
  IbookingReqPayment,
  IbookingRooms,
  IguestReqBody,
  RoomRequest,
} from "../utlis/interfaces/reservation.interface";

import AbstractServices from "../../abstarcts/abstract.service";
import Lib from "../../utils/lib/lib";
import { HelperFunction } from "../utlis/library/helperFunction";
import { Request } from "express";
import { IinsertFolioEntriesPayload } from "../utlis/interfaces/invoice.interface";

export class SubReservationService extends AbstractServices {
  constructor(private trx: Knex.Transaction) {
    super();
  }

  public calculateNights(checkIn: string, checkOut: string): number {
    const from = new Date(checkIn);
    const to = new Date(checkOut);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public async findOrCreateGuest(
    guest: IguestReqBody,
    hotel_code: number
  ): Promise<number> {
    const guestModel = this.Model.guestModel(this.trx);
    const { data: existingGuests } = await guestModel.getAllGuest({
      email: guest.email,
      phone: guest.phone,
      hotel_code,
    });

    if (existingGuests.length) return existingGuests[0].id;

    const [insertedGuest] = await guestModel.createGuest({
      hotel_code,
      first_name: guest.first_name,
      last_name: guest.last_name,
      nationality: guest.nationality,
      country: guest.country,
      email: guest.email,
      phone: guest.phone,
      address: guest.address,
    });

    return insertedGuest.id;
  }

  public calculateTotals(
    rooms: RoomRequest[],
    nights: number,
    fees: { vat: number; service_charge: number }
  ): { total_amount: number } {
    let total_changed_price = 0;

    rooms.forEach((room) => {
      total_changed_price += room.rate.changed_price * room.number_of_rooms;
    });

    const total = total_changed_price * nights;

    const total_amount = total + fees.vat + fees.service_charge;

    return { total_amount };
  }

  public calculateTotalsByBookingRooms(rooms: BookingRoom[], nights: number) {
    let total_changed_price = 0;

    rooms.forEach((room) => {
      total_changed_price += room.unit_changed_rate;
    });

    const total_amount = total_changed_price * nights;

    return { total_amount };
  }

  async createMainBooking({
    payload,
    hotel_code,
    guest_id,
    // sub_total,
    total_amount,
    is_checked_in,
    total_nights,
  }: {
    payload: {
      check_in: string;
      check_out: string;
      booking_type: string;
      special_requests?: string;
      vat: number;
      is_individual_booking: boolean;
      service_charge: number;
      discount_amount: number;
      source_id: number;
      created_by: number;
      drop: boolean;
      drop_time?: string;
      drop_to?: string;
      pickup: boolean;
      pickup_from?: string;
      pickup_time?: string;
      is_company_booked: boolean;
      company_name?: string;
      visit_purpose?: string;
    };
    hotel_code: number;
    guest_id: number;
    // sub_total: number;
    total_amount: number;
    total_nights: number;
    is_checked_in: boolean;
  }): Promise<{ id: number }> {
    const reservation_model = this.Model.reservationModel(this.trx);
    const last = await reservation_model.getLastBooking();
    const lastId = last?.[0]?.id ?? 1;

    const ref = Lib.generateBookingReferenceWithId(`BK`, lastId);

    const [booking] = await reservation_model.insertBooking({
      booking_date: new Date().toLocaleDateString(),
      booking_reference: ref,
      check_in: payload.check_in,
      check_out: payload.check_out,
      guest_id,
      hotel_code,
      // sub_total,
      is_individual_booking: payload.is_individual_booking,
      total_amount,
      total_nights,
      vat: payload.vat,
      service_charge: payload.service_charge,
      discount_amount: payload.discount_amount,
      source_id: payload.source_id,
      created_by: payload.created_by,
      comments: payload.special_requests,
      booking_type: payload.booking_type,
      status: is_checked_in ? "checked_in" : "confirmed",
      drop: payload.drop,
      drop_time: payload.drop_time,
      drop_to: payload.drop_to,
      pickup: payload.pickup,
      pickup_from: payload.pickup_from,
      pickup_time: payload.pickup_time,
      is_company_booked: payload.is_company_booked,
      company_name: payload.company_name,
      visit_purpose: payload.visit_purpose,
    });

    return booking;
  }

  async insertBookingRooms(
    rooms: RoomRequest[],
    booking_id: number,
    nights: number
  ) {
    const payload: IbookingRooms[] = [];

    rooms.forEach((room) => {
      const base_rate = room.rate.base_price * nights;
      const changed_rate = room.rate.changed_price * nights;

      room.guests.forEach((guest) => {
        payload.push({
          booking_id,
          room_id: guest.room_id,
          room_type_id: room.room_type_id,
          adults: guest.adults,
          children: guest.children,
          infant: guest.infant,
          base_rate,
          changed_rate,
          unit_base_rate: room.rate.base_price,
          unit_changed_rate: room.rate.changed_price,
          cbf: guest.cbf,
        });
      });
    });

    await this.Model.reservationModel(this.trx).insertBookingRoom(payload);
  }

  async insertInBookingRoomsBySingleBookingRooms(
    rooms: BookingRoom[],
    booking_id: number,
    nights: number
  ) {
    const payload: IbookingRooms[] = [];

    rooms.forEach((room) => {
      const base_rate = room.unit_base_rate * nights;
      const changed_rate = room.unit_changed_rate * nights;

      rooms.forEach((room) => {
        payload.push({
          booking_id,
          room_id: room.room_id,
          room_type_id: room.room_type_id,
          adults: room.adults,
          children: room.children,
          infant: room.infant,
          base_rate,
          changed_rate,
          unit_base_rate: room.unit_base_rate,
          unit_changed_rate: room.unit_changed_rate,
        });
      });
    });

    await this.Model.reservationModel(this.trx).insertBookingRoom(payload);
  }

  async updateAvailabilityWhenRoomBooking(
    reservation_type: "booked" | "hold",
    rooms: RoomRequest[],
    checkIn: string,
    checkOut: string,
    hotel_code: number
  ) {
    const reservation_model = this.Model.reservationModel(this.trx);
    const dates = HelperFunction.getDatesBetween(checkIn, checkOut);

    const reservedRoom = rooms.map((item) => ({
      room_type_id: item.room_type_id,
      total_room: item.guests.length,
    }));

    for (const { room_type_id, total_room } of reservedRoom) {
      for (const date of dates) {
        if (reservation_type === "booked") {
          await reservation_model.updateRoomAvailability({
            type: "booked_room_increase",
            hotel_code,
            room_type_id,
            date,
            rooms_to_book: total_room,
          });
        } else {
          await reservation_model.updateRoomAvailabilityHold({
            hotel_code,
            room_type_id,
            date,
            rooms_to_book: total_room,
            type: "hold_increase",
          });
        }
      }
    }
  }

  async updateRoomAvailabilityService(
    type: "booked_room_increase" | "booked_room_decrease",
    rooms: BookingRoom[],
    checkIn: string,
    checkOut: string,
    hotel_code: number
  ) {
    const reservation_model = this.Model.reservationModel(this.trx);
    const dates = HelperFunction.getDatesBetween(checkIn, checkOut);

    const uniqueRooms = Object.values(
      rooms.reduce((acc, curr) => {
        if (!acc[curr.room_type_id]) {
          acc[curr.room_type_id] = {
            room_type_id: curr.room_type_id,
            total_room: 1,
          };
        } else {
          acc[curr.room_type_id].total_room += 1;
        }
        return acc;
      }, {} as Record<number, { room_type_id: number; total_room: number }>)
    );

    for (const { room_type_id, total_room } of uniqueRooms) {
      for (const date of dates) {
        await reservation_model.updateRoomAvailability({
          type,
          hotel_code,
          room_type_id,
          date,
          rooms_to_book: total_room,
        });
      }
    }
  }

  async updateRoomAvailabilityForHoldService(
    hold_type: "hold_increase" | "hold_decrease",
    rooms: BookingRoom[],
    checkIn: string,
    checkOut: string,
    hotel_code: number
  ) {
    const reservation_model = this.Model.reservationModel(this.trx);
    const dates = HelperFunction.getDatesBetween(checkIn, checkOut);

    const uniqueRooms = Object.values(
      rooms.reduce((acc, curr) => {
        if (!acc[curr.room_type_id]) {
          acc[curr.room_type_id] = {
            room_type_id: curr.room_type_id,
            total_room: 1,
          };
        } else {
          acc[curr.room_type_id].total_room += 1;
        }
        return acc;
      }, {} as Record<number, { room_type_id: number; total_room: number }>)
    );
    console.log({ dates, uniqueRooms });

    for (const { room_type_id, total_room } of uniqueRooms) {
      for (const date of dates) {
        await reservation_model.updateRoomAvailabilityHold({
          hotel_code,
          room_type_id,
          date,
          rooms_to_book: total_room,
          type: hold_type,
        });
      }
    }
  }

  public async handlePaymentAndFolioForBooking({
    booking_id,
    is_payment_given,
    guest_id,
    req,
    total_amount,
    payment,
  }: {
    is_payment_given: boolean;
    payment: IbookingReqPayment | undefined;
    guest_id: number;
    req: Request;
    total_amount: number;
    booking_id: number;
  }) {
    const accountModel = this.Model.accountModel(this.trx);

    let voucherData: any;
    if (is_payment_given) {
      if (!payment)
        throw new Error(
          "Payment data is required when is_payment_given is true"
        );
      const [account] = await accountModel.getSingleAccount({
        hotel_code: req.hotel_admin.hotel_code,
        id: payment.acc_id,
      });

      if (!account) throw new Error("Invalid Account");

      const voucher_no = await new HelperFunction().generateVoucherNo();

      const [voucher] = await accountModel.insertAccVoucher({
        acc_head_id: account.acc_head_id,
        created_by: req.hotel_admin.id,
        debit: payment.amount,
        credit: 0,
        description: "For room booking payment",
        voucher_type: "PAYMENT",
        voucher_date: new Date().toISOString(),
        voucher_no,
      });

      voucherData = voucher;
    }

    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    const [lastFolio] = await hotelInvModel.getLasFolioId();

    const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);

    const [folio] = await hotelInvModel.insertInFolio({
      booking_id,
      folio_number,
      guest_id,
      hotel_code: req.hotel_admin.hotel_code,
      name: "Reservation",
      status: "open",
      type: "Primary",
    });

    console.log({ folio });

    await hotelInvModel.insertInFolioEntries({
      acc_voucher_id: voucherData?.id,
      debit: total_amount,
      credit: 0,
      folio_id: folio.id,
      posting_type: "Charge",
      description: "room booking",
    });

    if (is_payment_given) {
      if (!payment)
        throw new Error(
          "Payment data is required when is_payment_given is true"
        );

      await hotelInvModel.insertInFolioEntries({
        acc_voucher_id: voucherData.id,
        debit: 0,
        credit: payment.amount,
        folio_id: folio.id,
        posting_type: "Payment",
        description: "Payment given",
      });
    }

    const guestModel = this.Model.guestModel(this.trx);

    await guestModel.insertGuestLedger({
      hotel_code: req.hotel_admin.hotel_code,
      guest_id,
      credit: 0,
      remarks: "Owes for booking",
      debit: total_amount,
    });

    if (is_payment_given) {
      if (!payment)
        throw new Error(
          "Payment data is required when is_payment_given is true"
        );

      await guestModel.insertGuestLedger({
        hotel_code: req.hotel_admin.hotel_code,
        guest_id,
        credit: payment.amount,
        remarks: "Paid amount for booking",
        debit: 0,
      });
    }
  }

  // public async createRoomBookingFolioWithEntries({
  //   body,
  //   booking_id,
  //   guest_id,
  //   req,
  // }: {
  //   req: Request;
  //   body: BookingRequestBody;
  //   booking_id: number;
  //   guest_id: number;
  // }) {
  //   const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);

  //   // 1. Generate Folio Number
  //   const [lastFolio] = await hotelInvModel.getLasFolioId();
  //   const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);

  //   // 2. Insert Folio
  //   const [folio] = await hotelInvModel.insertInFolio({
  //     booking_id,
  //     folio_number,
  //     guest_id,
  //     hotel_code: req.hotel_admin.hotel_code,
  //     name: "Reservation",
  //     status: "open",
  //     type: "Primary",
  //   });

  //   // 3. Generate Folio Entries per night
  //   const folioEntriesBookingPayload: IinsertFolioEntriesPayload[] = [];

  //   const checkInDate = new Date(body.check_in);
  //   const checkOutDate = new Date(body.check_out);

  //   for (
  //     let currentDate = new Date(checkInDate);
  //     currentDate < checkOutDate;
  //     currentDate.setDate(currentDate.getDate() + 1)
  //   ) {
  //     const formattedDate = currentDate.toISOString().split("T")[0];

  //     body.rooms.forEach((room) => {
  //       room.guests.forEach((guest) => {
  //         folioEntriesBookingPayload.push({
  //           folio_id: folio.id,
  //           date: formattedDate,
  //           posting_type: "Charge",
  //           debit: room.rate.changed_price,
  //           room_id: guest.room_id,
  //           description: `Room Tariff`,
  //           rack_rate: room.rate.base_price,
  //         });
  //       });
  //     });
  //   }

  //   const today = new Date().toISOString().split("T")[0];

  //   // 5. VAT
  //   if (body.vat && body.vat > 0) {
  //     for (
  //       let currentDate = new Date(checkInDate);
  //       currentDate < checkOutDate;
  //       currentDate.setDate(currentDate.getDate() + 1)
  //     ) {
  //       const formattedDate = currentDate.toISOString().split("T")[0];

  //       folioEntriesBookingPayload.push({
  //         folio_id: folio.id,
  //         date: formattedDate,
  //         posting_type: "Charge",
  //         debit: body.vat,
  //         room_id: 0,
  //         description: `VAT`,
  //         rack_rate: 0,
  //       });
  //     }
  //   }

  //   // 4. Service Charge
  //   if (body.service_charge && body.service_charge > 0) {
  //     for (
  //       let currentDate = new Date(checkInDate);
  //       currentDate < checkOutDate;
  //       currentDate.setDate(currentDate.getDate() + 1)
  //     ) {
  //       const formattedDate = currentDate.toISOString().split("T")[0];

  //       folioEntriesBookingPayload.push({
  //         folio_id: folio.id,
  //         date: formattedDate,
  //         posting_type: "Charge",
  //         debit: body.service_charge,
  //         room_id: 0,
  //         description: `Service Charge`,
  //         rack_rate: 0,
  //       });
  //     }
  //   }

  //   // 6. Payment (if given)
  //   if (body.is_payment_given && body.payment?.amount > 0) {
  //     folioEntriesBookingPayload.push({
  //       folio_id: folio.id,
  //       date: today,
  //       posting_type: "Payment",
  //       debit: body.payment.amount,
  //       room_id: 0,
  //       description: `Payment Received`,
  //       rack_rate: 0,
  //     });
  //   }

  //   // 7. Insert All Entries
  //   await hotelInvModel.insertInFolioEntries(folioEntriesBookingPayload);

  //   return {
  //     folio,
  //     entries: folioEntriesBookingPayload,
  //   };
  // }

  public async createRoomBookingFolioWithEntries({
    body,
    booking_id,
    guest_id,
    req,
  }: {
    req: Request;
    body: BookingRequestBody;
    booking_id: number;
    guest_id: number;
  }) {
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);

    // 1. Generate Folio Number
    const [lastFolio] = await hotelInvModel.getLasFolioId();
    const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);

    // 2. Insert Folio
    const [folio] = await hotelInvModel.insertInFolio({
      booking_id,
      folio_number,
      guest_id,
      hotel_code: req.hotel_admin.hotel_code,
      name: "Reservation",
      status: "open",
      type: "Primary",
    });

    // 3. Generate Folio Entries per night in proper order
    const folioEntriesBookingPayload: IinsertFolioEntriesPayload[] = [];

    const checkInDate = new Date(body.check_in);
    const checkOutDate = new Date(body.check_out);

    for (
      let currentDate = new Date(checkInDate);
      currentDate < checkOutDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const formattedDate = currentDate.toISOString().split("T")[0];

      // 1. Room Tariff
      body.rooms.forEach((room) => {
        room.guests.forEach((guest) => {
          folioEntriesBookingPayload.push({
            folio_id: folio.id,
            date: formattedDate,
            posting_type: "Charge",
            debit: room.rate.changed_price,
            room_id: guest.room_id,
            description: `Room Tariff`,
            rack_rate: room.rate.base_price,
          });
        });
      });

      // 2. VAT
      if (body.vat && body.vat > 0) {
        folioEntriesBookingPayload.push({
          folio_id: folio.id,
          date: formattedDate,
          posting_type: "Charge",
          debit: body.vat,
          room_id: 0,
          description: `VAT`,
          rack_rate: 0,
        });
      }

      // 3. Service Charge
      if (body.service_charge && body.service_charge > 0) {
        folioEntriesBookingPayload.push({
          folio_id: folio.id,
          date: formattedDate,
          posting_type: "Charge",
          debit: body.service_charge,
          room_id: 0,
          description: `Service Charge`,
          rack_rate: 0,
        });
      }
    }

    // 4. Payment (if given)
    const today = new Date().toISOString().split("T")[0];
    if (body.is_payment_given && body.payment?.amount > 0) {
      folioEntriesBookingPayload.push({
        folio_id: folio.id,
        date: today,
        posting_type: "Payment",
        debit: body.payment.amount,
        room_id: 0,
        description: `Payment Received`,
        rack_rate: 0,
      });
    }

    // 5. Insert All Entries
    await hotelInvModel.insertInFolioEntries(folioEntriesBookingPayload);

    return {
      folio,
      entries: folioEntriesBookingPayload,
    };
  }

  public async handlePaymentAndFolioForAddPayment({
    acc_id,
    amount,
    folio_id,
    guest_id,
    remarks,
    req,
    payment_for,
    payment_date,
  }: {
    acc_id: number;
    guest_id: number;
    req: Request;
    amount: number;
    remarks: string;
    folio_id: number;
    payment_for: string;
    payment_date: string;
  }) {
    const accountModel = this.Model.accountModel(this.trx);

    const [account] = await accountModel.getSingleAccount({
      hotel_code: req.hotel_admin.hotel_code,
      id: acc_id,
    });

    if (!account) throw new Error("Invalid Account");

    const voucher_no = await new HelperFunction().generateVoucherNo();

    const [voucher] = await accountModel.insertAccVoucher({
      acc_head_id: account.acc_head_id,
      created_by: req.hotel_admin.id,
      debit: amount,
      credit: 0,
      description: remarks,
      voucher_type: "PAYMENT",
      voucher_date: payment_date,
      voucher_no,
    });

    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);

    await hotelInvModel.insertInFolioEntries({
      acc_voucher_id: voucher.id,
      debit: 0,
      credit: amount,
      folio_id: folio_id,
      posting_type: "Payment",
      description: remarks,
    });

    const guestModel = this.Model.guestModel(this.trx);

    await guestModel.insertGuestLedger({
      hotel_code: req.hotel_admin.hotel_code,
      guest_id,
      credit: amount,
      remarks: payment_for,
      debit: 0,
    });
  }

  public async handlePaymentAndFolioForRefundPayment({
    acc_id,
    amount,
    folio_id,
    guest_id,
    remarks,
    req,
    payment_for,
    payment_date,
  }: {
    acc_id: number;
    guest_id: number;
    req: Request;

    amount: number;
    remarks: string;
    folio_id: number;
    payment_for: string;
    payment_date: string;
  }) {
    const accountModel = this.Model.accountModel(this.trx);

    const [account] = await accountModel.getSingleAccount({
      hotel_code: req.hotel_admin.hotel_code,
      id: acc_id,
    });

    if (!account) throw new Error("Invalid Account");

    const voucher_no = await new HelperFunction().generateVoucherNo();

    const [voucher] = await accountModel.insertAccVoucher({
      acc_head_id: account.acc_head_id,
      created_by: req.hotel_admin.id,
      debit: 0,
      credit: amount,
      description: remarks,
      voucher_type: "REFUND",
      voucher_date: payment_date,
      voucher_no,
    });

    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);

    await hotelInvModel.insertInFolioEntries({
      acc_voucher_id: voucher.id,
      debit: 0,
      credit: -amount,
      folio_id: folio_id,
      posting_type: "Refund",
      description: remarks,
    });

    const guestModel = this.Model.guestModel(this.trx);

    await guestModel.insertGuestLedger({
      hotel_code: req.hotel_admin.hotel_code,
      guest_id,
      credit: 0,
      remarks: payment_for,
      debit: amount,
    });
  }
}
