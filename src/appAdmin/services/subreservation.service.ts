import { Knex } from "knex";
import {
  BookingRoom,
  IaddRoomInReservationRequestBody,
  IBookingDetails,
  IchangedRateOfARoomInReservationRequestBody,
  IGBookedRoomTypeRequest,
  IGBookingRequestBody,
  IguestReqBody,
  RoomRequest,
} from "../utlis/interfaces/reservation.interface";

import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import Lib from "../../utils/lib/lib";
import { IgetHotelAccConfig } from "../utlis/interfaces/account.interface";
import { IinsertFolioEntriesPayload } from "../utlis/interfaces/invoice.interface";
import { HelperFunction } from "../utlis/library/helperFunction";

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

  public addDays(date: string | Date, days = 0): string {
    const base =
      typeof date === "string" ? new Date(`${date}T00:00:00Z`) : new Date(date);
    base.setUTCHours(0, 0, 0, 0);

    base.setUTCDate(base.getUTCDate() + days);

    return base.toISOString().slice(0, 10);
  }

  public async findOrCreateGuest(
    guest: IguestReqBody,
    hotel_code: number
  ): Promise<number> {
    const guestModel = this.Model.guestModel(this.trx);
    const [insertedGuest] = await guestModel.createGuest({
      hotel_code,
      first_name: guest.first_name,
      last_name: guest.last_name,
      country_id: guest.country_id,
      email: guest.email,
      phone: guest.phone,
      address: guest.address,
      passport_no: guest.passport_no,
    });

    return insertedGuest.id;
  }

  public calculateTotals(
    rooms: RoomRequest[],
    nights: number,
    fees: { vat: number; service_charge: number }
  ): { total_amount: number; sub_total: number } {
    let total_changed_price = 0;

    rooms.forEach((room) => {
      total_changed_price += room.rate.changed_price * room.number_of_rooms;
    });

    const total = total_changed_price * nights;

    const total_amount =
      total + fees.vat * nights + fees.service_charge * nights;

    return { total_amount, sub_total: total };
  }

  public calculateTotalsForGroupBooking(
    booked_room_types: IGBookedRoomTypeRequest[],
    nights: number,
    fees: { vat: number; service_charge: number }
  ): { total_amount: number; sub_total: number } {
    let total_changed_price = 0;

    booked_room_types.forEach((rt) => {
      rt.rooms.forEach((room) => {
        total_changed_price += room.rate.changed_rate * rt.rooms.length;
      });
    });

    const total = total_changed_price * nights;

    const total_amount =
      total + fees.vat * nights + fees.service_charge * nights;

    console.log({ total_amount });

    return { total_amount, sub_total: total };
  }

  public calculateTotalsForGroupBookingv2(
    booked_room_types: IGBookedRoomTypeRequest[],
    fees: { vat: number; service_charge: number }
  ): { total_amount: number; sub_total: number } {
    let sub_total = 0;

    for (const rt of booked_room_types) {
      for (const room of rt.rooms) {
        const from = new Date(room.check_in);
        const to = new Date(room.check_out);

        const diffTime = Math.abs(to.getTime() - from.getTime());
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        sub_total += room.rate.changed_rate * nights;
      }
    }

    const vat_amount = (sub_total * fees.vat) / 100;
    const service_charge_amount = (sub_total * fees.service_charge) / 100;

    const total_amount = sub_total + vat_amount + service_charge_amount;

    return {
      total_amount,
      sub_total,
    };
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
    sub_total,
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
      service_charge_percentage: number;
      vat_percentage: number;
    };
    hotel_code: number;
    guest_id: number;
    sub_total?: number;
    total_amount?: number;
    total_nights: number;
    is_checked_in: boolean;
  }): Promise<{ id: number; booking_ref: string }> {
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
      service_charge_percentage: payload.service_charge_percentage,
      vat_percentage: payload.vat_percentage,
    });

    return { id: booking.id, booking_ref: ref };
  }

  async insertBookingRooms({
    booked_room_types,
    booking_id,
    nights,
    hotel_code,
    is_checked_in,
  }: {
    booked_room_types: IGBookedRoomTypeRequest[];
    booking_id: number;
    nights: number;
    hotel_code: number;
    is_checked_in: boolean;
  }) {
    for (const rt of booked_room_types) {
      for (const room of rt.rooms) {
        // Insert booking room
        const [bookingRoomRes] = await this.Model.reservationModel(
          this.trx
        ).insertBookingRoom([
          {
            check_in: room.check_in,
            check_out: room.check_out,
            status: is_checked_in ? "checked_in" : "confirmed",
            booking_id,
            room_id: room.room_id,
            room_type_id: rt.room_type_id,
            adults: room.adults,
            children: room.children,
            infant: room.infant,
            base_rate: room.rate.base_rate * nights,
            changed_rate: room.rate.changed_rate * nights,
            unit_base_rate: room.rate.base_rate,
            unit_changed_rate: room.rate.changed_rate,
            cbf: room.cbf,
          },
        ]);

        const booking_room_id = bookingRoomRes.id;

        // Insert guests and booking_room_guests
        if (room?.guest_info)
          for (const guest of room?.guest_info) {
            const [guestRes] = await this.Model.guestModel(
              this.trx
            ).createGuestForGroupBooking({
              first_name: guest.first_name,
              last_name: guest.last_name,
              email: guest.email,
              address: guest.address,
              country_id: guest.country_id,
              phone: guest.phone,
              hotel_code,
            });

            await this.Model.reservationModel(this.trx).insertBookingRoomGuest({
              // is_lead_guest: guest.is_lead_guest,
              guest_id: guestRes.id,
              hotel_code,
              is_room_primary_guest: guest.is_room_primary_guest,
              booking_room_id,
            });
          }
      }
    }
  }

  async insertBookingRoomsForGroupBooking({
    booked_room_types,
    booking_id,
    hotel_code,
    is_checked_in,
  }: {
    booked_room_types: IGBookedRoomTypeRequest[];
    booking_id: number;
    hotel_code: number;
    is_checked_in: boolean;
  }) {
    for (const rt of booked_room_types) {
      for (const room of rt.rooms) {
        const nights = HelperFunction.calculateNights(
          room.check_in,
          room.check_out
        );

        // Insert booking room
        const [bookingRoomRes] = await this.Model.reservationModel(
          this.trx
        ).insertBookingRoom([
          {
            check_in: room.check_in,
            check_out: room.check_out,
            status: is_checked_in ? "checked_in" : "confirmed",
            booking_id,
            room_id: room.room_id,
            room_type_id: rt.room_type_id,
            adults: room.adults,
            children: room.children,
            infant: room.infant,
            base_rate: room.rate.base_rate * nights,
            changed_rate: room.rate.changed_rate * nights,
            unit_base_rate: room.rate.base_rate,
            unit_changed_rate: room.rate.changed_rate,
            cbf: room.cbf,
          },
        ]);

        const booking_room_id = bookingRoomRes.id;

        // Insert guests and booking_room_guests
        if (room?.guest_info) {
          console.log(room.guest_info);
          let primaryGuestCount = 0;

          for (const guest of room?.guest_info) {
            if (guest.is_room_primary_guest) {
              primaryGuestCount++;
            }
          }

          if (!primaryGuestCount) {
            throw new Error(
              "At least one primary guest is required for each room."
            );
          }

          if (primaryGuestCount > 1) {
            throw new Error("Only one primary guest is allowed per room.");
          }

          for (const guest of room.guest_info) {
            const [guestRes] = await this.Model.guestModel(
              this.trx
            ).createGuestForGroupBooking({
              first_name: guest.first_name,
              last_name: guest.last_name,
              email: guest.email,
              address: guest.address,
              country_id: guest.country_id,
              phone: guest.phone,
              passport_no: guest.passport_no,
              hotel_code,
            });

            await this.Model.reservationModel(this.trx).insertBookingRoomGuest({
              // is_lead_guest: guest.is_lead_guest,
              guest_id: guestRes.id,
              hotel_code,
              booking_room_id,
              is_room_primary_guest: guest.is_room_primary_guest,
            });
          }
        }
      }
    }
  }

  async updateAvailabilityWhenRoomBooking(
    reservation_type: "booked" | "hold",
    booked_room_types: IGBookedRoomTypeRequest[],
    hotel_code: number
  ) {
    const reservation_model = this.Model.reservationModel(this.trx);

    for (const { rooms, room_type_id } of booked_room_types) {
      for (const { check_in, check_out } of rooms) {
        const dates = HelperFunction.getDatesBetween(check_in, check_out);

        const updatePromises = dates.map((date) => {
          if (reservation_type === "booked") {
            return reservation_model.updateRoomAvailability({
              type: "booked_room_increase",
              hotel_code,
              room_type_id,
              date,
              rooms_to_book: 1,
            });
          } else {
            return reservation_model.updateRoomAvailabilityHold({
              hotel_code,
              room_type_id,
              date,
              rooms_to_book: 1,
              type: "hold_increase",
            });
          }
        });

        await Promise.all(updatePromises);
      }
    }
  }

  async updateRoomAvailabilityService({
    reservation_type,
    rooms,
    hotel_code,
  }: {
    reservation_type:
      | "booked_room_increase"
      | "booked_room_decrease"
      | "hold_increase"
      | "hold_decrease";
    rooms: { check_in: string; check_out: string; room_type_id: number }[];
    hotel_code: number;
  }) {
    const reservation_model = this.Model.reservationModel(this.trx);

    for (const { check_in, check_out, room_type_id } of rooms) {
      const dates = HelperFunction.getDatesBetween(check_in, check_out);

      const updatePromises = dates.map((date) => {
        if (reservation_type === "booked_room_increase") {
          return reservation_model.updateRoomAvailability({
            type: "booked_room_increase",
            hotel_code,
            room_type_id,
            date,
            rooms_to_book: 1,
          });
        } else if (reservation_type === "booked_room_decrease") {
          return reservation_model.updateRoomAvailability({
            type: "booked_room_decrease",
            hotel_code,
            room_type_id,
            date,
            rooms_to_book: 1,
          });
        } else if (reservation_type == "hold_increase") {
          return reservation_model.updateRoomAvailabilityHold({
            hotel_code,
            room_type_id,
            date,
            rooms_to_book: 1,
            type: "hold_increase",
          });
        } else {
          return reservation_model.updateRoomAvailabilityHold({
            hotel_code,
            room_type_id,
            date,
            rooms_to_book: 1,
            type: "hold_decrease",
          });
        }
      });

      await Promise.all(updatePromises);
    }
  }

  public async createRoomBookingFolioWithEntries({
    body,
    booking_id,
    guest_id,
    req,
    booking_ref,
  }: {
    req: Request;
    body: IGBookingRequestBody;
    booking_id: number;
    guest_id: number;
    booking_ref: string;
  }) {
    const { hotel_code, id: created_by } = req.hotel_admin;
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    const accountModel = this.Model.accountModel(this.trx);
    const reservationModel = this.Model.reservationModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    type ChildCtx = {
      folioId: number;
      folioNumber: string;
      roomId: number;
      entries: IinsertFolioEntriesPayload[];
      totalDebit: number;
    };

    const child: ChildCtx[] = [];

    const push = (c: ChildCtx, e: IinsertFolioEntriesPayload) => {
      c.entries.push(e);
      c.totalDebit += e.debit ?? 0;
    };

    const folioNo = `F-${booking_ref}`;

    const [folio] = await hotelInvModel.insertInFolio({
      booking_id,
      folio_number: folioNo,
      guest_id,
      hotel_code,
      name: `Individual Folio`,
      status: "open",
      type: "Primary",
    });

    for (const { rooms } of body.booked_room_types) {
      for (const room of rooms) {
        const ctx: ChildCtx = {
          folioId: folio.id,
          folioNumber: folioNo,
          roomId: room.room_id,
          entries: [],
          totalDebit: 0,
        };

        /* date‑wise charges */
        const rates: Record<string, number> = {};
        for (
          let d = new Date(room.check_in);
          d < new Date(room.check_out);
          d.setDate(d.getDate() + 1)
        ) {
          rates[d.toISOString().split("T")[0]] = room.rate.changed_rate;
        }

        for (const date of Object.keys(rates).sort()) {
          const rate = rates[date];

          // Room tariff
          push(ctx, {
            folio_id: ctx.folioId,
            date,
            posting_type: "ROOM_CHARGE",
            debit: rate,
            credit: 0,
            description: "Room Tariff",
            rack_rate: room.rate.base_rate,
            room_id: room.room_id,
          });

          // VAT
          if (body.vat_percentage > 0) {
            push(ctx, {
              folio_id: ctx.folioId,
              date,
              posting_type: "VAT",
              debit: +((rate * body.vat_percentage) / 100).toFixed(2),
              credit: 0,
              description: "VAT",
              rack_rate: 0,
              room_id: room.room_id,
            });
          }

          // Service charge
          if (body.service_charge_percentage > 0) {
            push(ctx, {
              folio_id: ctx.folioId,
              date,
              posting_type: "SERVICE_CHARGE",
              debit: +((rate * body.service_charge_percentage) / 100).toFixed(
                2
              ),
              credit: 0,
              description: "Service Charge",
              rack_rate: 0,
              room_id: room.room_id,
            });
          }
        }

        child.push(ctx);
      }
    }

    /*  update booking total (only debits) */
    const totalDebit = child.reduce((s, c) => s + c.totalDebit, 0);

    const helper = new HelperFunction();
    const hotelModel = this.Model.HotelModel(this.trx);

    const heads = await hotelModel.getHotelAccConfig(hotel_code, [
      "RECEIVABLE_HEAD_ID",
      "HOTEL_REVENUE_HEAD_ID",
    ]);

    console.log({ heads, hotel_code });

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
    const voucher_no1 = await helper.generateVoucherNo("JV", this.trx);

    await accountModel.insertAccVoucher([
      {
        acc_head_id: receivable_head.head_id,
        created_by,
        debit: totalDebit,
        credit: 0,
        description: `Receivable for individual room booking ${booking_ref}`,
        voucher_date: today,
        voucher_no: voucher_no1,
        hotel_code,
      },
      {
        acc_head_id: sales_head.head_id,
        created_by,
        debit: 0,
        credit: totalDebit,
        description: `Sales for individual room booking ${booking_ref}`,
        voucher_date: today,
        voucher_no: voucher_no1,
        hotel_code,
      },
    ]);

    /*  persist entries */
    const allEntries = [...child.flatMap((c) => c.entries)];

    // payment
    if (body.is_payment_given && body.payment?.amount > 0) {
      allEntries.push({
        folio_id: child[0].folioId,
        date: today,
        posting_type: "Payment",
        credit: body.payment.amount,
        debit: 0,
        description: "Payment for room booking",
      });

      const [acc] = await accountModel.getSingleAccount({
        hotel_code,
        id: body.payment.acc_id,
      });

      if (!acc) throw new Error("Invalid Account");

      let voucher_type: "CCV" | "BCV" = "CCV";

      if (acc.acc_type === "BANK") {
        voucher_type = "BCV";
      }

      const voucher_no = await helper.generateVoucherNo(voucher_type, this.trx);

      const money_receipt_no = await helper.generateMoneyReceiptNo(this.trx);

      const mRes = await hotelInvModel.insertMoneyReceipt({
        hotel_code,
        receipt_date: today,
        amount_paid: body.payment.amount,
        payment_method: acc.acc_type,
        receipt_no: money_receipt_no,
        received_by: req.hotel_admin.id,
        acc_id: body.payment.acc_id,
        voucher_no,
        notes: "Advance Payment",
      });

      await hotelInvModel.insertFolioMoneyReceipt({
        amount: body.payment.amount,
        money_receipt_id: mRes[0].id,
        folio_id: child[0].folioId,
        booking_ref,
      });

      await accountModel.insertAccVoucher([
        {
          acc_head_id: acc.acc_head_id,
          created_by,
          debit: body.payment.amount,
          credit: 0,
          description: `Payment collection for booking ${booking_ref}`,
          voucher_date: today,
          voucher_no,
          hotel_code,
        },
        {
          acc_head_id: receivable_head.head_id,
          created_by,
          debit: 0,
          credit: body.payment.amount,
          description: `Payment collected for booking ${booking_ref}`,
          voucher_date: today,
          voucher_no,
          hotel_code,
        },
      ]);
    }

    // insert in folio entries
    await hotelInvModel.insertInFolioEntries(allEntries);

    // update room booking
    await reservationModel.updateRoomBooking(
      { total_amount: totalDebit, voucher_no: voucher_no1 },
      hotel_code,
      booking_id
    );

    return {
      childFolios: child.map((c) => ({
        id: c.folioId,
        folio_number: c.folioNumber,
        room_id: c.roomId,
      })),
      entries: allEntries,
    };
  }

  // This service is for group room booking
  public async createGroupRoomBookingFolios({
    body,
    booking_id,
    guest_id,
    booking_ref,
    req,
  }: {
    req: Request;
    body: IGBookingRequestBody;
    booking_id: number;
    guest_id: number;
    booking_ref: string;
  }) {
    const { hotel_code, id: created_by } = req.hotel_admin;
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    const accountModel = this.Model.accountModel(this.trx);
    const reservationModel = this.Model.reservationModel(this.trx);
    const roomModel = this.Model.RoomModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const [lastFolio] = await hotelInvModel.getLasFolioId();
    const masterNo = HelperFunction.generateFolioNumber(lastFolio?.id);
    const [masterFolio] = await hotelInvModel.insertInFolio({
      booking_id,
      folio_number: masterNo,
      guest_id,
      hotel_code,
      name: `Group Folio #${booking_id}`,
      status: "open",
      type: "group_master",
    });

    type ChildCtx = {
      folioId: number;
      folioNumber: string;
      roomId: number;
      entries: IinsertFolioEntriesPayload[];
      totalDebit: number;
    };
    const child: ChildCtx[] = [];
    const push = (c: ChildCtx, e: IinsertFolioEntriesPayload) => {
      c.entries.push(e);
      c.totalDebit += e.debit ?? 0;
    };

    for (const { rooms } of body.booked_room_types) {
      for (const room of rooms) {
        const [info] = await roomModel.getSingleRoom(hotel_code, room.room_id);
        const folioNo = `${masterNo}-R${info?.room_name ?? room.room_id}`;
        const [roomFolio] = await hotelInvModel.insertInFolio({
          booking_id,
          folio_number: folioNo,
          guest_id,
          hotel_code,
          name: `Room ${info.room_name} Folio`,
          status: "open",
          type: "room_primary",
          room_id: room.room_id,
        });

        const ctx: ChildCtx = {
          folioId: roomFolio.id,
          folioNumber: folioNo,
          roomId: room.room_id,
          entries: [],
          totalDebit: 0,
        };

        /* date‑wise charges */
        const rates: Record<string, number> = {};
        for (
          let d = new Date(room.check_in);
          d < new Date(room.check_out);
          d.setDate(d.getDate() + 1)
        ) {
          rates[d.toISOString().split("T")[0]] = room.rate.changed_rate;
        }

        for (const date of Object.keys(rates).sort()) {
          const rate = rates[date];

          // Room tariff
          push(ctx, {
            folio_id: ctx.folioId,
            date,
            posting_type: "ROOM_CHARGE",
            debit: rate,
            credit: 0,
            description: "Room Tariff",
            rack_rate: room.rate.base_rate,
            room_id: room.room_id,
          });

          // VAT
          if (body.vat_percentage > 0) {
            push(ctx, {
              folio_id: ctx.folioId,
              date,
              posting_type: "VAT",
              debit: +((rate * body.vat_percentage) / 100).toFixed(2),
              credit: 0,
              description: "VAT",
              rack_rate: 0,
            });
          }

          // Service charge
          if (body.service_charge_percentage > 0) {
            push(ctx, {
              folio_id: ctx.folioId,
              date,
              posting_type: "SERVICE_CHARGE",
              debit: +((rate * body.service_charge_percentage) / 100).toFixed(
                2
              ),
              credit: 0,
              description: "Service Charge",
              rack_rate: 0,
            });
          }
        }

        child.push(ctx);
      }
    }

    /*  update booking total (only debits) */
    const totalDebitAmount = child.reduce((s, c) => s + c.totalDebit, 0);

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
    const voucher_no1 = await helper.generateVoucherNo("JV", this.trx);

    await accountModel.insertAccVoucher([
      {
        acc_head_id: receivable_head.head_id,
        created_by,
        debit: totalDebitAmount,
        credit: 0,
        description: `Receivable for individual room booking ${booking_ref}`,
        voucher_date: today,
        voucher_no: voucher_no1,
        hotel_code,
      },
      {
        acc_head_id: sales_head.head_id,
        created_by,
        debit: 0,
        credit: totalDebitAmount,
        description: `Sales for individual room booking ${booking_ref}`,
        voucher_date: today,
        voucher_no: voucher_no1,
        hotel_code,
      },
    ]);

    /* master‑level entries (payment + discount) */
    const masterEntries: IinsertFolioEntriesPayload[] = [];

    // payment
    if (body.is_payment_given && body.payment?.amount > 0) {
      if (!body.payment.acc_id)
        throw new Error("Account ID is required for payment");

      masterEntries.push({
        folio_id: masterFolio.id,
        date: today,
        posting_type: "Payment",
        debit: 0,
        credit: body.payment.amount,
        room_id: 0,
        description: "Payment Received",
        rack_rate: 0,
      });

      const [acc] = await accountModel.getSingleAccount({
        hotel_code,
        id: body.payment.acc_id,
      });

      if (!acc) throw new Error("Invalid Account");

      let voucher_type: "CCV" | "BCV" = "CCV";

      if (acc.acc_type === "BANK") {
        voucher_type = "BCV";
      }

      const voucher_no = await helper.generateVoucherNo(voucher_type, this.trx);

      // money receipt
      const money_receipt_no = await helper.generateMoneyReceiptNo(this.trx);

      const mRes = await hotelInvModel.insertMoneyReceipt({
        hotel_code,
        receipt_date: today,
        amount_paid: body.payment.amount,
        payment_method: acc.acc_type,
        receipt_no: money_receipt_no,
        received_by: req.hotel_admin.id,
        voucher_no,
        notes: "Advance Payment",
        acc_id: body.payment.acc_id,
      });

      await hotelInvModel.insertFolioMoneyReceipt({
        amount: body.payment.amount,
        money_receipt_id: mRes[0].id,
        folio_id: masterFolio.id,
        booking_ref,
      });

      // acc voucher
      await accountModel.insertAccVoucher([
        {
          acc_head_id: acc.acc_head_id,
          created_by,
          debit: body.payment.amount,
          credit: 0,
          description: `Payment collection for booking ${booking_ref}`,
          voucher_date: today,
          voucher_no,
          hotel_code,
        },
        {
          acc_head_id: receivable_head.head_id,
          created_by,
          debit: 0,
          credit: body.payment.amount,
          description: `Payment collected for booking ${booking_ref}`,
          voucher_date: today,
          voucher_no,
          hotel_code,
        },
      ]);
    }

    /*  persist entries */
    const allEntries = [...masterEntries, ...child.flatMap((c) => c.entries)];
    await hotelInvModel.insertInFolioEntries(allEntries);

    /*  update booking total (only debits) */
    const totalDebit = child.reduce((s, c) => s + c.totalDebit, 0);
    await reservationModel.updateRoomBooking(
      { total_amount: totalDebit, voucher_no: voucher_no1 },
      hotel_code,
      booking_id
    );

    return {
      masterFolio,
      childFolios: child.map((c) => ({
        id: c.folioId,
        folio_number: c.folioNumber,
        room_id: c.roomId,
      })),
      entries: allEntries,
    };
  }

  public async handlePaymentAndFolioForAddPayment({
    acc_id,
    amount,
    folio_id,
    remarks,
    req,
    booking_ref,
    booking_id,
    room_id,
  }: {
    room_id: number;
    acc_id: number;
    guest_id: number;
    req: Request;
    amount: number;
    remarks: string;
    folio_id: number;
    payment_for: string;
    payment_date: string;
    booking_ref: string;
    booking_id: number;
  }) {
    const accountModel = this.Model.accountModel(this.trx);
    const hotel_code = req.hotel_admin.hotel_code;

    const [account] = await accountModel.getSingleAccount({
      hotel_code: req.hotel_admin.hotel_code,
      id: acc_id,
    });

    if (!account) throw new Error("Invalid Account");

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
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
    }

    const [acc] = await accountModel.getSingleAccount({
      hotel_code: req.hotel_admin.hotel_code,
      id: acc_id,
    });

    if (!acc) throw new Error("Invalid Account");

    let voucher_type: "CCV" | "BCV" = "CCV";

    if (acc.acc_type === "BANK") {
      voucher_type = "BCV";
    }

    // check booking
    const booking = await this.Model.reservationModel(
      this.trx
    ).getSingleBooking(req.hotel_admin.hotel_code, booking_id);

    // const voucher_no = await helper.generateVoucherNo(voucher_type, this.trx);
    const today = new Date().toISOString().split("T")[0];

    const money_receipt_no = await helper.generateMoneyReceiptNo(this.trx);

    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);

    const mRes = await hotelInvModel.insertMoneyReceipt({
      hotel_code,
      receipt_date: today,
      amount_paid: amount,
      payment_method: acc.acc_type,
      receipt_no: money_receipt_no,
      received_by: req.hotel_admin.id,
      voucher_no: booking?.voucher_no as string,
      notes: "Payment has been taken",
      acc_id,
    });

    await hotelInvModel.insertFolioMoneyReceipt({
      amount,
      money_receipt_id: mRes[0].id,
      folio_id: folio_id,
      room_id,
      booking_ref,
    });

    if (booking?.voucher_no)
      await accountModel.insertAccVoucher([
        {
          acc_head_id: acc.acc_head_id,
          created_by: req.hotel_admin.id,
          debit: amount,
          credit: 0,
          description: `Payment collection for booking ${booking_ref}`,
          voucher_date: today,
          voucher_no: booking?.voucher_no as string,
          hotel_code,
        },
        {
          acc_head_id: receivable_head.head_id,
          created_by: req.hotel_admin.id,
          debit: 0,
          credit: amount,
          description: `Payment collected for booking ${booking_ref}`,
          voucher_date: today,
          voucher_no: booking?.voucher_no as string,
          hotel_code,
        },
      ]);

    await hotelInvModel.insertInFolioEntries({
      debit: 0,
      credit: amount,
      folio_id: folio_id,
      posting_type: "Payment",
      description: remarks,
    });
  }

  public async handlePaymentAndFolioForRefundPayment({
    acc_id,
    amount,
    folio_id,
    remarks,
    req,
    booking_id,
    booking_ref,
  }: {
    acc_id: number;
    guest_id: number;
    req: Request;
    booking_ref: string;
    amount: number;
    remarks: string;
    folio_id: number;
    booking_id: number;
    payment_for: string;
    payment_date: string;
  }) {
    const accountModel = this.Model.accountModel(this.trx);

    const [account] = await accountModel.getSingleAccount({
      hotel_code: req.hotel_admin.hotel_code,
      id: acc_id,
    });

    if (!account) throw new Error("Invalid Account");

    const hotelModel = this.Model.HotelModel(this.trx);

    const heads = await hotelModel.getHotelAccConfig(
      req.hotel_admin.hotel_code,
      ["HOTEL_EXPENSE_HEAD_ID", "HOTEL_REVENUE_HEAD_ID"]
    );

    const expense_head = heads.find(
      (h) => h.config === "HOTEL_EXPENSE_HEAD_ID"
    );

    if (!expense_head) {
      throw new Error("HOTEL_EXPENSE_HEAD_ID not configured for this hotel");
    }

    const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");

    if (!sales_head) {
      throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
    }

    const [acc] = await accountModel.getSingleAccount({
      hotel_code: req.hotel_admin.hotel_code,
      id: acc_id,
    });

    if (!acc) throw new Error("Invalid Account");

    let voucher_type: "CCV" | "BCV" = "CCV";

    if (acc.acc_type === "BANK") {
      voucher_type = "BCV";
    }

    // check booking
    const booking = await this.Model.reservationModel(
      this.trx
    ).getSingleBooking(req.hotel_admin.hotel_code, booking_id);

    // const voucher_no = await helper.generateVoucherNo(voucher_type, this.trx);
    const today = new Date().toISOString().split("T")[0];

    if (booking?.voucher_no)
      await accountModel.insertAccVoucher([
        {
          acc_head_id: sales_head.head_id,
          created_by: req.hotel_admin.id,
          debit: amount,
          credit: 0,
          description: `Refund to guest for booking ${booking_ref}`,
          voucher_date: today,
          voucher_no: booking?.voucher_no as string,
          hotel_code: req.hotel_admin.hotel_code,
        },
        {
          acc_head_id: acc.acc_head_id,
          created_by: req.hotel_admin.id,
          debit: 0,
          credit: amount,
          description: `Refund payment to guest for booking ${booking_ref}`,
          voucher_date: today,
          voucher_no: booking?.voucher_no as string,
          hotel_code: req.hotel_admin.hotel_code,
        },
      ]);

    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);

    await hotelInvModel.insertInFolioEntries({
      debit: 0,
      credit: -amount,
      folio_id: folio_id,
      posting_type: "Refund",
      description: remarks,
    });
  }

  public async changeRateForRoomInvidiualReservation({
    body,
    booking_id,
    receivable_head,
    sales_head,
    bookingScPct,
    bookingVatPct,
    booking,
    req,
  }: {
    body: IchangedRateOfARoomInReservationRequestBody;
    booking_id: number;
    receivable_head: IgetHotelAccConfig;
    sales_head: IgetHotelAccConfig;
    bookingScPct: number;
    bookingVatPct: number;
    booking: IBookingDetails;
    req: Request;
  }) {
    const reservationModel = this.Model.reservationModel(this.trx);
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    const accountModel = this.Model.accountModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const hotel_code = req.hotel_admin.hotel_code;
    const admin_id = req.hotel_admin.id;

    // get single folio
    const primaryFolio = await hotelInvModel.getFoliosbySingleBooking({
      hotel_code,
      booking_id,
      type: "Primary",
    });

    // folio entries
    const folioEntries = await hotelInvModel.getFolioEntriesbyFolioID(
      hotel_code,
      primaryFolio[0].id
    );

    for (const change of body.changed_rate_of_booking_rooms) {
      const room = await reservationModel.getSingleBookingRoom({
        booking_id,
        room_id: change.room_id,
      });

      if (!room) continue;

      let prevRoomAmount = 0;
      const folioEntryIDs = folioEntries
        .filter((fe) => {
          if (
            (fe.posting_type == "ROOM_CHARGE" ||
              fe.posting_type == "VAT" ||
              fe.posting_type == "SERVICE_CHARGE") &&
            fe.room_id == change.room_id
          ) {
            prevRoomAmount += Number(fe.debit);
            return fe;
          }
        })
        .map((fe) => fe.id);

      if (folioEntryIDs.length) {
        await hotelInvModel.updateFolioEntries(
          { is_void: true },
          folioEntryIDs
        );
      }

      const nights = this.calculateNights(room.check_in, room.check_out);

      await reservationModel.updateSingleBookingRoom(
        {
          unit_changed_rate: change.unit_changed_rate,
          unit_base_rate: change.unit_base_rate,
          changed_rate: change.unit_changed_rate * nights,
          base_rate: change.unit_base_rate * nights,
        },
        { room_id: room.room_id, booking_id }
      );

      const newEntries: IinsertFolioEntriesPayload[] = [];
      for (let i = 0; i < nights; i++) {
        const date = this.addDays(room.check_in, i);
        const tariff = change.unit_changed_rate;
        const vat = (tariff * bookingVatPct) / 100;
        const sc = (tariff * bookingScPct) / 100;

        newEntries.push({
          folio_id: primaryFolio[0].id,
          description: "Room Tariff",
          posting_type: "ROOM_CHARGE",
          debit: tariff,
          credit: 0,
          date,
          room_id: room.room_id,
          rack_rate: room.base_rate,
        });

        if (vat > 0) {
          newEntries.push({
            folio_id: primaryFolio[0].id,
            description: "VAT",
            posting_type: "VAT",
            debit: vat,
            credit: 0,
            room_id: room.room_id,
            date,
          });
        }
        if (sc > 0) {
          newEntries.push({
            folio_id: primaryFolio[0].id,
            description: "Service Charge",
            posting_type: "SERVICE_CHARGE",
            debit: sc,
            credit: 0,
            date,
            room_id: room.room_id,
          });
        }
      }

      // insert new folio entries
      let newTotalAmount = newEntries.reduce(
        (ac, cu) => ac + Number(cu?.debit ?? 0),
        0
      );

      if (newEntries.length) {
        await hotelInvModel.insertInFolioEntries(newEntries);
      }

      //------------------ Accounting ------------------//

      const difference = Math.abs(newTotalAmount - prevRoomAmount);
      const isIncrease = newTotalAmount > prevRoomAmount;
      const actionText = isIncrease ? "Increased rate" : "Decreased rate";

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
    }
  }

  public async changeRateForRoomInGroupReservation({
    body,
    booking_id,
    receivable_head,
    sales_head,
    bookingScPct,
    bookingVatPct,
    booking,
    req,
  }: {
    body: IchangedRateOfARoomInReservationRequestBody;
    booking_id: number;
    receivable_head: IgetHotelAccConfig;
    sales_head: IgetHotelAccConfig;
    bookingScPct: number;
    bookingVatPct: number;
    booking: IBookingDetails;
    req: Request;
  }) {
    const reservationModel = this.Model.reservationModel(this.trx);
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    const accountModel = this.Model.accountModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const hotel_code = req.hotel_admin.hotel_code;
    const admin_id = req.hotel_admin.id;

    for (const change of body.changed_rate_of_booking_rooms) {
      const room = await reservationModel.getSingleBookingRoom({
        booking_id,
        room_id: change.room_id,
      });

      if (!room) continue;

      const [roomFolio] =
        await hotelInvModel.getFolioWithEntriesbySingleBookingAndRoomID({
          hotel_code,
          booking_id,
          room_ids: [room.room_id],
        });

      if (!roomFolio) continue;

      let prevRoomAmount = 0;
      const folioEntryIDs = roomFolio.folio_entries
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
        .map((fe) => fe.entries_id);

      if (folioEntryIDs.length) {
        await hotelInvModel.updateFolioEntries(
          { is_void: true },
          folioEntryIDs
        );
      }

      const nights = this.calculateNights(room.check_in, room.check_out);

      await reservationModel.updateSingleBookingRoom(
        {
          unit_changed_rate: change.unit_changed_rate,
          unit_base_rate: change.unit_base_rate,
          changed_rate: change.unit_changed_rate * nights,
          base_rate: change.unit_base_rate * nights,
        },
        { room_id: room.room_id, booking_id }
      );

      const newEntries: IinsertFolioEntriesPayload[] = [];
      for (let i = 0; i < nights; i++) {
        const date = this.addDays(room.check_in, i);
        const tariff = change.unit_changed_rate;
        const vat = (tariff * bookingVatPct) / 100;
        const sc = (tariff * bookingScPct) / 100;

        newEntries.push({
          folio_id: roomFolio.id,
          description: "Room Tariff",
          posting_type: "ROOM_CHARGE",
          debit: tariff,
          credit: 0,
          date,
          room_id: room.room_id,
          rack_rate: room.base_rate,
        });

        if (vat > 0) {
          newEntries.push({
            folio_id: roomFolio.id,
            description: "VAT",
            posting_type: "VAT",
            debit: vat,
            credit: 0,
            date,
            room_id: room.room_id,
          });
        }
        if (sc > 0) {
          newEntries.push({
            folio_id: roomFolio.id,
            description: "Service Charge",
            posting_type: "SERVICE_CHARGE",
            debit: sc,
            credit: 0,
            date,
            room_id: room.room_id,
          });
        }
      }

      // insert new folio entries
      let newTotalAmount = newEntries.reduce(
        (ac, cu) => ac + Number(cu?.debit ?? 0),
        0
      );

      if (newEntries.length) {
        await hotelInvModel.insertInFolioEntries(newEntries);
      }

      //------------------ Accounting ------------------//

      const difference = Math.abs(newTotalAmount - prevRoomAmount);
      const isIncrease = newTotalAmount > prevRoomAmount;
      const actionText = isIncrease ? "Increased rate" : "Decreased rate";

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
    }
  }

  public async addRoomInIndividualReservation({
    body,
    req,
    booking_id,
    bookingScPct,
    bookingVatPct,
    receivable_head,
    sales_head,
    booking,
  }: {
    body: IaddRoomInReservationRequestBody;
    req: Request;
    booking_id: number;
    receivable_head: IgetHotelAccConfig;
    sales_head: IgetHotelAccConfig;
    bookingScPct: number;
    bookingVatPct: number;
    booking: IBookingDetails;
  }) {
    const reservationModel = this.Model.reservationModel(this.trx);
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    const accountModel = this.Model.accountModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const hotel_code = req.hotel_admin.hotel_code;
    const admin_id = req.hotel_admin.id;

    // get primary folio
    const primaryFolio = await hotelInvModel.getFoliosbySingleBooking({
      hotel_code,
      booking_id,
      type: "Primary",
    });

    if (!primaryFolio.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Primary folio not found",
      };
    }

    await this.insertBookingRoomsForGroupBooking({
      booked_room_types: body.add_room_types,
      booking_id,
      hotel_code,
      is_checked_in: false,
    });

    await this.updateAvailabilityWhenRoomBooking(
      "booked",
      body.add_room_types,
      hotel_code
    );

    const { booking_rooms: freshRooms } =
      (await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      )) as IBookingDetails;

    const addedIDs = body.add_room_types.flatMap((rt) =>
      rt.rooms.map((r) => r.room_id)
    );

    const freshMap = new Map(freshRooms.map((br) => [br.room_id, br] as const));

    const newlyAddedRooms = addedIDs
      .map((id) => freshMap.get(id))
      .filter(Boolean)
      .map((room) => ({
        room_id: room!.room_id,
        room_type_id: room!.room_type_id,
        unit_changed_rate: room!.unit_changed_rate,
        unit_base_rate: room!.unit_base_rate,
        check_in: room!.check_in,
        check_out: room!.check_out,
      }));

    for (const br of newlyAddedRooms) {
      const nights = this.calculateNights(br.check_in, br.check_out);
      const entries: IinsertFolioEntriesPayload[] = [];

      for (let i = 0; i < nights; i++) {
        const date = this.addDays(br.check_in, i);
        const tariff = br.unit_changed_rate;
        const vat = (tariff * bookingVatPct) / 100;
        const sc = (tariff * bookingScPct) / 100;

        entries.push({
          folio_id: primaryFolio[0].id,
          description: "Room Tariff",
          posting_type: "ROOM_CHARGE",
          debit: tariff,
          credit: 0,
          date,
          room_id: br.room_id,
        });

        if (vat > 0) {
          entries.push({
            folio_id: primaryFolio[0].id,
            description: "VAT",
            posting_type: "VAT",
            debit: vat,
            credit: 0,
            date,
            room_id: br.room_id,
          });
        }

        if (sc > 0) {
          entries.push({
            folio_id: primaryFolio[0].id,
            description: "Service Charge",
            posting_type: "SERVICE_CHARGE",
            debit: sc,
            credit: 0,
            date,
            room_id: br.room_id,
          });
        }
      }

      await hotelInvModel.insertInFolioEntries(entries);

      const newTotalAmount = entries.reduce(
        (acc, cu) => acc + Number(cu.debit),
        0
      );

      // acc voucher
      await accountModel.insertAccVoucher([
        {
          acc_head_id: receivable_head.head_id,
          created_by: admin_id,
          debit: newTotalAmount,
          credit: 0,
          description: `Receivable for add new room in reservation. Booking Ref ${booking.booking_reference}`,
          voucher_date: today,
          voucher_no: booking.voucher_no,
          hotel_code,
        },
        {
          acc_head_id: sales_head.head_id,
          created_by: admin_id,
          debit: 0,
          credit: newTotalAmount,
          description: `Sales for add new room in reservation. Booking Ref ${booking.booking_reference}`,
          voucher_date: today,
          voucher_no: booking.voucher_no,
          hotel_code,
        },
      ]);
    }
  }

  public async addRoomInGroupReservation({
    body,
    req,
    booking_id,
    bookingScPct,
    bookingVatPct,
    receivable_head,
    sales_head,
    booking,
    guest_id,
  }: {
    body: IaddRoomInReservationRequestBody;
    req: Request;
    booking_id: number;
    receivable_head: IgetHotelAccConfig;
    sales_head: IgetHotelAccConfig;
    bookingScPct: number;
    bookingVatPct: number;
    booking: IBookingDetails;
    guest_id: number;
  }) {
    const reservationModel = this.Model.reservationModel(this.trx);
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    const accountModel = this.Model.accountModel(this.trx);
    const roomModel = this.Model.RoomModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const hotel_code = req.hotel_admin.hotel_code;
    const admin_id = req.hotel_admin.id;

    await this.insertBookingRoomsForGroupBooking({
      booked_room_types: body.add_room_types,
      booking_id,
      hotel_code,
      is_checked_in: false,
    });

    await this.updateAvailabilityWhenRoomBooking(
      "booked",
      body.add_room_types,
      hotel_code
    );

    const { booking_rooms: freshRooms } =
      (await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      )) as IBookingDetails;

    const addedIDs = body.add_room_types.flatMap((rt) =>
      rt.rooms.map((r) => r.room_id)
    );

    const freshMap = new Map(freshRooms.map((br) => [br.room_id, br] as const));

    const newlyAddedRooms = addedIDs
      .map((id) => freshMap.get(id))
      .filter(Boolean)
      .map((room) => ({
        room_id: room!.room_id,
        room_type_id: room!.room_type_id,
        unit_changed_rate: room!.unit_changed_rate,
        unit_base_rate: room!.unit_base_rate,
        check_in: room!.check_in,
        check_out: room!.check_out,
      }));

    for (const br of newlyAddedRooms) {
      const [roomRow] = await roomModel.getSingleRoom(hotel_code, br.room_id);
      const roomName = roomRow?.room_name ?? br.room_id.toString();

      const [lastFolio] = await hotelInvModel.getLasFolioId();
      const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);

      const [roomFolio] = await hotelInvModel.insertInFolio({
        hotel_code,
        booking_id,
        room_id: br.room_id,
        type: "room_primary",
        guest_id,
        folio_number,
        status: "open",
        name: `Room ${roomName} Folio`,
      });

      const nights = this.calculateNights(br.check_in, br.check_out);
      const entries: IinsertFolioEntriesPayload[] = [];

      for (let i = 0; i < nights; i++) {
        const date = this.addDays(br.check_in, i);
        const tariff = br.unit_changed_rate;
        const vat = (tariff * bookingVatPct) / 100;
        const sc = (tariff * bookingScPct) / 100;

        entries.push({
          folio_id: roomFolio.id,
          description: "Room Tariff",
          posting_type: "ROOM_CHARGE",
          debit: tariff,
          credit: 0,
          date,
          room_id: br.room_id,
        });

        if (vat > 0) {
          entries.push({
            folio_id: roomFolio.id,
            description: "VAT",
            posting_type: "VAT",
            debit: vat,
            credit: 0,
            date,
            room_id: br.room_id,
          });
        }

        if (sc > 0) {
          entries.push({
            folio_id: roomFolio.id,
            description: "Service Charge",
            posting_type: "SERVICE_CHARGE",
            debit: sc,
            credit: 0,
            date,
            room_id: br.room_id,
          });
        }
      }
      await hotelInvModel.insertInFolioEntries(entries);

      const newTotalAmount = entries.reduce(
        (acc, cu) => acc + Number(cu.debit),
        0
      );

      // acc voucher
      await accountModel.insertAccVoucher([
        {
          acc_head_id: receivable_head.head_id,
          created_by: admin_id,
          debit: newTotalAmount,
          credit: 0,
          description: `Receivable for add new room in reservation. Booking Ref ${booking.booking_reference}`,
          voucher_date: today,
          voucher_no: booking.voucher_no,
          hotel_code,
        },
        {
          acc_head_id: sales_head.head_id,
          created_by: admin_id,
          debit: 0,
          credit: newTotalAmount,
          description: `Sales for add new room in reservation. Booking Ref ${booking.booking_reference}`,
          voucher_date: today,
          voucher_no: booking.voucher_no,
          hotel_code,
        },
      ]);
    }
  }

  public async deleteRoomInIndividualReservation({
    body,
    req,
    booking_id,
    bookingScPct,
    bookingVatPct,
    receivable_head,
    sales_head,
    booking,
  }: {
    body: { removed_rooms: number[] };
    req: Request;
    booking_id: number;
    receivable_head: IgetHotelAccConfig;
    sales_head: IgetHotelAccConfig;
    bookingScPct: number;
    bookingVatPct: number;
    booking: IBookingDetails;
  }) {
    const reservationModel = this.Model.reservationModel(this.trx);
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    const accountModel = this.Model.accountModel(this.trx);
    const roomModel = this.Model.RoomModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const hotel_code = req.hotel_admin.hotel_code;
    const admin_id = req.hotel_admin.id;

    const removedIDs = [...new Set(body.removed_rooms)];

    const roomsBeingRemoved = booking.booking_rooms.filter((br) =>
      removedIDs.includes(br.room_id)
    );

    const bookingRoomIds = roomsBeingRemoved.map((br) => br.id);
    // delete booking room guest
    const res = await reservationModel.deleteBookingRoomGuest({
      booking_room_ids: bookingRoomIds,
    });

    // delete booking rooms
    await reservationModel.deleteBookingRooms(removedIDs, booking_id);

    await this.updateRoomAvailabilityService({
      reservation_type: "booked_room_decrease",
      rooms: roomsBeingRemoved,
      hotel_code,
    });

    const primaryFolio = await hotelInvModel.getFoliosbySingleBooking({
      hotel_code,
      booking_id,
      type: "Primary",
    });

    if (!primaryFolio.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Primary folio not found",
      };
    }
    // get folio entries
    const folioEntries = await hotelInvModel.getFolioEntriesbyFolioID(
      hotel_code,
      primaryFolio[0].id
    );
    let total_debit_amount = 0;
    let total_credit_amount = 0;

    const folioEntryIDs = folioEntries
      .filter((fe) =>
        body.removed_rooms.some((roomId) => roomId === fe.room_id)
      )
      .map((fe) => {
        total_credit_amount += Number(fe.credit ?? 0);
        total_debit_amount += Number(fe.debit ?? 0);
        return fe.id;
      });

    if (folioEntryIDs.length) {
      await hotelInvModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
    }

    await accountModel.insertAccVoucher([
      {
        acc_head_id: receivable_head.head_id,
        created_by: admin_id,
        debit: 0,
        credit: total_debit_amount - total_credit_amount,
        description: `Receivable for remove room. Booking Ref ${booking.booking_reference}`,
        voucher_date: today,
        voucher_no: booking.voucher_no,
        hotel_code,
      },
      {
        acc_head_id: sales_head.head_id,
        created_by: admin_id,
        debit: total_debit_amount - total_credit_amount,
        credit: 0,
        description: `Sale for remove room. Booking Ref ${booking.booking_reference}`,
        voucher_date: today,
        voucher_no: booking.voucher_no,
        hotel_code,
      },
    ]);
  }

  public async deleteRoomInGroupReservation({
    body,
    req,
    booking_id,
    bookingScPct,
    bookingVatPct,
    receivable_head,
    sales_head,
    booking,
  }: {
    body: { removed_rooms: number[] };
    req: Request;
    booking_id: number;
    receivable_head: IgetHotelAccConfig;
    sales_head: IgetHotelAccConfig;
    bookingScPct: number;
    bookingVatPct: number;
    booking: IBookingDetails;
  }) {
    const reservationModel = this.Model.reservationModel(this.trx);
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    const accountModel = this.Model.accountModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const hotel_code = req.hotel_admin.hotel_code;
    const admin_id = req.hotel_admin.id;

    const removedIDs = [...new Set(body.removed_rooms)];

    const roomsBeingRemoved = booking.booking_rooms.filter((br) =>
      removedIDs.includes(br.room_id)
    );

    const bookingRoomIds = roomsBeingRemoved.map((br) => br.id);

    // delete booking room guest
    const res = await reservationModel.deleteBookingRoomGuest({
      booking_room_ids: bookingRoomIds,
    });

    // delete booking rooms
    await reservationModel.deleteBookingRooms(removedIDs, booking_id);

    await this.updateRoomAvailabilityService({
      reservation_type: "booked_room_decrease",
      rooms: roomsBeingRemoved,
      hotel_code,
    });

    const roomFolios =
      await hotelInvModel.getFolioWithEntriesbySingleBookingAndRoomID({
        hotel_code,
        booking_id,
        room_ids: removedIDs,
      });

    let total_debit_amount = 0;
    let total_credit_amount = 0;

    const folioEntryIDs = roomFolios.flatMap((f) =>
      f.folio_entries
        .filter((fe) => {
          total_credit_amount += Number(fe.credit ?? 0);
          total_debit_amount += Number(fe.debit ?? 0);
          return fe;
        })
        .map((fe) => fe.entries_id)
    );

    const allFolioIDs: number[] = roomFolios
      .filter((f) => !f?.is_void)
      .map((f) => f.id);

    if (folioEntryIDs.length) {
      await hotelInvModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
    }

    if (allFolioIDs.length) {
      await hotelInvModel.updateSingleFolio(
        { is_void: true },
        { folioIds: allFolioIDs, booking_id, hotel_code }
      );
    }

    await accountModel.insertAccVoucher([
      {
        acc_head_id: receivable_head.head_id,
        created_by: admin_id,
        debit: 0,
        credit: total_debit_amount - total_credit_amount,
        description: `Receivable for remove room. Booking Ref ${booking.booking_reference}`,
        voucher_date: today,
        voucher_no: booking.voucher_no,
        hotel_code,
      },
      {
        acc_head_id: sales_head.head_id,
        created_by: admin_id,
        debit: total_debit_amount - total_credit_amount,
        credit: 0,
        description: `Sale for remove room. Booking Ref ${booking.booking_reference}`,
        voucher_date: today,
        voucher_no: booking.voucher_no,
        hotel_code,
      },
    ]);
  }
}
