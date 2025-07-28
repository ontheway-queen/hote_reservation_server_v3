import { Knex } from "knex";
import {
  BookingRoom,
  IbookingReqPayment,
  IGBookedRoomTypeRequest,
  IGBookingRequestBody,
  IguestReqBody,
  RoomRequest,
} from "../utlis/interfaces/reservation.interface";

import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import Lib from "../../utils/lib/lib";
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

  public async handlePaymentAndFolioForBooking({
    booking_id,
    is_payment_given,
    guest_id,
    req,
    total_amount,
    payment,
    booking_ref,
  }: {
    is_payment_given: boolean;
    payment: IbookingReqPayment | undefined;
    guest_id: number;
    req: Request;
    total_amount: number;
    booking_id: number;
    booking_ref: string;
  }) {
    const accountModel = this.Model.accountModel(this.trx);
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    const [lastFolio] = await hotelInvModel.getLasFolioId();
    const hotel_code = req.hotel_admin.hotel_code;

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

    const helper = new HelperFunction();
    const today = new Date().toISOString().split("T")[0];
    const hotelModel = this.Model.HotelModel(this.trx);

    const heads = await hotelModel.getHotelAccConfig(hotel_code, [
      "RECEIVABLE_HEAD_ID",
    ]);

    const receivable_head = heads.find(
      (h) => h.config === "RECEIVABLE_HEAD_ID"
    );
    if (!receivable_head) {
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
    }

    // double entry
    if (is_payment_given && payment) {
      const [acc] = await accountModel.getSingleAccount({
        hotel_code,
        id: payment.acc_id,
      });

      if (!acc) throw new Error("Invalid Account");

      let voucher_type: "CCV" | "BCV" = "CCV";

      if (acc.acc_type === "BANK") {
        voucher_type = "BCV";
      }

      const voucher_no = await helper.generateVoucherNo(voucher_type, this.trx);

      await accountModel.insertAccVoucher([
        {
          acc_head_id: acc.acc_head_id,
          created_by: req.hotel_admin.id,
          debit: payment.amount,
          credit: 0,
          description: `Payment collection for booking ${booking_ref}`,
          voucher_date: today,
          voucher_no,
          hotel_code,
        },
        {
          acc_head_id: receivable_head.head_id,
          created_by: req.hotel_admin.id,
          debit: 0,
          credit: payment.amount,
          description: `Payment collected for booking ${booking_ref}`,
          voucher_date: today,
          voucher_no,
          hotel_code,
        },
      ]);
    }

    await hotelInvModel.insertInFolioEntries({
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
        debit: 0,
        credit: payment.amount,
        folio_id: folio.id,
        posting_type: "Payment",
        description: "Payment given",
      });
    }
  }

  // This service for individual booking
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
    const roomModel = this.Model.RoomModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    const [lastFolio] = await hotelInvModel.getLasFolioId();

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
        const folioNo = `R${info?.room_name}`;
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
            posting_type: "Charge",
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
              posting_type: "Charge",
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
              posting_type: "Charge",
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

    /* master‑level entries (payment + discount) */
    const masterEntries: IinsertFolioEntriesPayload[] = [];

    /*  update booking total (only debits) */
    const totalDebit = child.reduce((s, c) => s + c.totalDebit, 0);

    const helper = new HelperFunction();
    const hotelModel = this.Model.HotelModel(this.trx);

    const heads = await hotelModel.getHotelAccConfig(hotel_code, [
      "RECEIVABLE_HEAD_ID",
      "SALES_HEAD_ID",
    ]);

    const receivable_head = heads.find(
      (h) => h.config === "RECEIVABLE_HEAD_ID"
    );
    if (!receivable_head) {
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
    }

    const sales_head = heads.find((h) => h.config === "SALES_HEAD_ID");
    if (!sales_head) {
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
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

    // payment
    if (body.is_payment_given && body.payment?.amount > 0) {
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

    // payment entry
    allEntries.push({
      folio_id: child[0].folioId,
      date: today,
      posting_type: "Payment",
      credit: body.payment.amount,
      debit: 0,
      description: "Payment for room booking",
    });

    await hotelInvModel.insertInFolioEntries(allEntries);

    await reservationModel.updateRoomBooking(
      { total_amount: totalDebit },
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
            posting_type: "Charge",
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
              posting_type: "Charge",
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
              posting_type: "Charge",
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
      "SALES_HEAD_ID",
    ]);

    const receivable_head = heads.find(
      (h) => h.config === "RECEIVABLE_HEAD_ID"
    );

    if (!receivable_head) {
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
    }

    const sales_head = heads.find((h) => h.config === "SALES_HEAD_ID");

    if (!sales_head) {
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
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
      { total_amount: totalDebit },
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
  }: {
    acc_id: number;
    guest_id: number;
    req: Request;
    amount: number;
    remarks: string;
    folio_id: number;
    payment_for: string;
    payment_date: string;
    booking_ref: string;
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
      "SALES_HEAD_ID",
    ]);

    const receivable_head = heads.find(
      (h) => h.config === "RECEIVABLE_HEAD_ID"
    );

    if (!receivable_head) {
      throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
    }

    const sales_head = heads.find((h) => h.config === "SALES_HEAD_ID");

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

    const voucher_no = await helper.generateVoucherNo(voucher_type, this.trx);
    const today = new Date().toISOString().split("T")[0];

    await accountModel.insertAccVoucher([
      {
        acc_head_id: acc.acc_head_id,
        created_by: req.hotel_admin.id,
        debit: amount,
        credit: 0,
        description: `Payment collection for booking ${booking_ref}`,
        voucher_date: today,
        voucher_no,
        hotel_code,
      },
      {
        acc_head_id: receivable_head.head_id,
        created_by: req.hotel_admin.id,
        debit: 0,
        credit: amount,
        description: `Payment collected for booking ${booking_ref}`,
        voucher_date: today,
        voucher_no,
        hotel_code,
      },
    ]);

    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);

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
    guest_id,
    remarks,
    req,
    payment_for,
    payment_date,
    booking_ref,
  }: {
    acc_id: number;
    guest_id: number;
    req: Request;
    booking_ref: string;
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

    const helper = new HelperFunction();
    const hotelModel = this.Model.HotelModel(this.trx);

    const heads = await hotelModel.getHotelAccConfig(
      req.hotel_admin.hotel_code,
      ["EXPENSE_HEAD_ID", "SALES_HEAD_ID"]
    );

    const expense_head = heads.find((h) => h.config === "EXPENSE_HEAD_ID");

    if (!expense_head) {
      throw new Error("EXPENSE_HEAD_ID not configured for this hotel");
    }

    const sales_head = heads.find((h) => h.config === "SALES_HEAD_ID");

    if (!sales_head) {
      throw new Error("SALES_HEAD_ID not configured for this hotel");
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

    const voucher_no = await helper.generateVoucherNo(voucher_type, this.trx);
    const today = new Date().toISOString().split("T")[0];

    await accountModel.insertAccVoucher([
      {
        acc_head_id: sales_head.head_id,
        created_by: req.hotel_admin.id,
        debit: amount,
        credit: 0,
        description: `Refund to guest for booking ${booking_ref}`,
        voucher_date: today,
        voucher_no,
        hotel_code: req.hotel_admin.hotel_code,
      },
      {
        acc_head_id: acc.acc_head_id,
        created_by: req.hotel_admin.id,
        debit: 0,
        credit: amount,
        description: `Refund payment to guest for booking ${booking_ref}`,
        voucher_date: today,
        voucher_no,
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
}
