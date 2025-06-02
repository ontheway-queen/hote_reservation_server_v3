import { Knex } from "knex";
import {
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
      hotel_code,
    });

    if (existingGuests.length) return existingGuests[0].id;

    const [insertedGuest] = await guestModel.createGuest({
      hotel_code,
      first_name: guest.first_name,
      last_name: guest.last_name,
      nationality: guest.nationality,
      email: guest.email,
      phone: guest.phone,
    });

    return insertedGuest.id;
  }

  public calculateTotals(
    rooms: RoomRequest[],
    nights: number,
    fees: { vat: number; service_charge: number; discount: number }
  ) {
    let total_changed_price = 0;

    rooms.forEach((room) => {
      total_changed_price += room.rate.changed_price * room.number_of_rooms;
    });

    const total = total_changed_price * nights;
    const total_amount = total + fees.vat + fees.service_charge - fees.discount;
    const sub_total = total + fees.vat + fees.service_charge;

    return { total_amount, sub_total };
  }

  async createMainBooking({
    payload,
    hotel_code,
    guest_id,
    sub_total,
    total_amount,
    is_checked_in,
  }: {
    payload: {
      check_in: string;
      check_out: string;
      booking_type: string;
      special_requests?: string;
      vat: number;
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
    };
    hotel_code: number;
    guest_id: number;
    sub_total: number;
    total_amount: number;
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
      sub_total,
      total_amount,
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
        });
      });
    });

    await this.Model.reservationModel(this.trx).insertBookingRoom(payload);
  }

  async updateAvailabilityWhenRoomBooking(
    reservation_type: string,
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
        if (reservation_type === "confirm") {
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

  public async handlePaymentAndFolioForBooking(
    is_payment_given: boolean,
    payment: IbookingReqPayment | undefined,
    guest_id: number,
    req: Request,
    total_amount: number,
    booking_id: number
  ) {
    console.log({ is_payment_given, payment });
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
    console.log({ lastFolio });
    const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);
    console.log({ folio_number });
    const [folio] = await hotelInvModel.insertInFolio({
      booking_id,
      folio_number,
      guest_id,
      hotel_code: req.hotel_admin.hotel_code,
      name: "Room Booking",
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
      description: "For Add Money." + " " + remarks,
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
      description: payment_for + " " + remarks,
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
      debit: amount,
      credit: 0,
      folio_id: folio_id,
      posting_type: "Refund",
      description: payment_for + " " + remarks,
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
