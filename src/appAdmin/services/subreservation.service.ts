import { Knex } from "knex";
import {
  BookingRequestBody,
  BookingRoom,
  IbookingReqPayment,
  IbookingRooms,
  IGBookedRoomTypeRequest,
  IGBookingRequestBody,
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
    const [insertedGuest] = await guestModel.createGuest({
      hotel_code,
      first_name: guest.first_name,
      last_name: guest.last_name,
      country_id: guest.country_id,
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

    return booking;
  }

  async insertBookingRooms({
    rooms,
    booking_id,
    nights,
    check_in,
    check_out,
    checked_in_at,
    is_checked_in,
  }: {
    rooms: RoomRequest[];
    booking_id: number;
    nights: number;
    check_in: string;
    check_out: string;
    is_checked_in?: boolean;
    checked_in_at?: string;
  }) {
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
          check_in,
          check_out,
          checked_in_at: is_checked_in ? new Date().toISOString() : "",
          status: is_checked_in ? "checked_in" : "confirmed",
        });
      });
    });

    await this.Model.reservationModel(this.trx).insertBookingRoom(payload);
  }

  async insertBookingRoomsV2({
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
            hotel_code,
          });

          await this.Model.reservationModel(this.trx).insertBookingRoomGuest({
            is_lead_guest: guest.is_lead_guest,
            guest_id: guestRes.id,
            hotel_code,
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
        console.log({ nights });
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
              hotel_code,
            });

            await this.Model.reservationModel(this.trx).insertBookingRoomGuest({
              is_lead_guest: guest.is_lead_guest,
              guest_id: guestRes.id,
              hotel_code,
              booking_room_id,
            });
          }
        }
      }
    }
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
          check_in: room.check_in,
          check_out: room.check_out,
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

  async updateAvailabilityWhenRoomBookingV2(
    reservation_type: "booked" | "hold",
    booked_room_types: IGBookedRoomTypeRequest[],
    checkIn: string,
    checkOut: string,
    hotel_code: number
  ) {
    const reservation_model = this.Model.reservationModel(this.trx);
    const dates = HelperFunction.getDatesBetween(checkIn, checkOut);

    const reservedRoom = booked_room_types.map((rt) => ({
      room_type_id: rt.room_type_id,
      total_room: rt.rooms.length,
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

  async updateAvailabilityWhenGroupRoomBooking(
    reservation_type: "booked" | "hold",
    booked_room_types: IGBookedRoomTypeRequest[],
    checkIn: string,
    checkOut: string,
    hotel_code: number
  ) {
    const reservation_model = this.Model.reservationModel(this.trx);
    const dates = HelperFunction.getDatesBetween(checkIn, checkOut);

    const reservedRoom = booked_room_types.map((rt) => ({
      room_type_id: rt.room_type_id,
      total_room: rt.rooms.length,
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

  async updateAvailabilityWhenGroupRoomBookingV2(
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

  async updateRoomAvailabilityServiceByRoomIds(
    type: "booked_room_increase" | "booked_room_decrease",
    rooms: number[],
    checkIn: string,
    checkOut: string,
    hotel_code: number
  ) {
    const reservation_model = this.Model.reservationModel(this.trx);
    const roomModel = this.Model.RoomModel(this.trx);
    const dates = HelperFunction.getDatesBetween(checkIn, checkOut);

    // get all rooms
    const { data: getAllRooms } = await roomModel.getAllRoom({
      room_ids: rooms,
      hotel_code,
    });

    // Initialize count map: room_type_id => count
    const totalhaveToUpdate: Record<number, number> = {};

    for (const room of getAllRooms) {
      if (totalhaveToUpdate[room.room_type_id]) {
        totalhaveToUpdate[room.room_type_id]++;
      } else {
        totalhaveToUpdate[room.room_type_id] = 1;
      }
    }

    for (const [room_type_id, total_room] of Object.entries(
      totalhaveToUpdate
    )) {
      const roomTypeIdNum = Number(room_type_id);

      for (const date of dates) {
        const res = await reservation_model.updateRoomAvailability({
          type,
          hotel_code,
          room_type_id: roomTypeIdNum,
          date,
          rooms_to_book: total_room,
        });
        console.log({ res });
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

  // public async createRoomBookingFolioWithEntriesV2({
  //   body,
  //   booking_id,
  //   guest_id,
  //   req,
  // }: {
  //   req: Request;
  //   body: IGBookingRequestBody;
  //   booking_id: number;
  //   guest_id: number;
  // }) {
  //   const hotel_code = req.hotel_admin.hotel_code;
  //   const created_by = req.hotel_admin.id;
  //   const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);

  //   // 1. Generate Folio Number
  //   const [lastFolio] = await hotelInvModel.getLasFolioId();
  //   const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);

  //   // 2. Insert Folio
  //   const [folio] = await hotelInvModel.insertInFolio({
  //     booking_id,
  //     folio_number,
  //     guest_id,
  //     hotel_code,
  //     name: "Reservation",
  //     status: "open",
  //     type: "Primary",
  //   });

  //   // 3. Build Folio Entries
  //   const folioEntries: IinsertFolioEntriesPayload[] = [];
  //   const dailyMap: Record<string, number> = {};

  //   for (const rt of body.booked_room_types) {
  //     for (const room of rt.rooms) {
  //       const from = new Date(room.check_in);
  //       const to = new Date(room.check_out);
  //       const ratePerNight = room.rate.changed_rate;
  //       const rackRate = room.rate.base_rate;

  //       for (let d = new Date(from); d < to; d.setDate(d.getDate() + 1)) {
  //         const date = d.toISOString().split("T")[0];

  //         // Push Room Tariff first
  //         folioEntries.push({
  //           folio_id: folio.id,
  //           date,
  //           posting_type: "Charge",
  //           debit: ratePerNight,
  //           room_id: room.room_id,
  //           description: "Room Tariff",
  //           rack_rate: rackRate,
  //         });

  //         // Track for VAT/Service Charge
  //         dailyMap[date] = (dailyMap[date] || 0) + ratePerNight;
  //       }
  //     }
  //   }

  //   // 4. Add VAT and Service Charge after Room Tariff for each date
  //   for (const date in dailyMap) {
  //     const totalRate = dailyMap[date];
  //     const vatAmount = (totalRate * body.vat_percentage) / 100;
  //     const scAmount = (totalRate * body.service_charge_percentage) / 100;

  //     if (vatAmount > 0) {
  //       folioEntries.push({
  //         folio_id: folio.id,
  //         date,
  //         posting_type: "Charge",
  //         debit: vatAmount,
  //         room_id: 0,
  //         description: "VAT",
  //         rack_rate: 0,
  //       });
  //     }

  //     if (scAmount > 0) {
  //       folioEntries.push({
  //         folio_id: folio.id,
  //         date,
  //         posting_type: "Charge",
  //         debit: scAmount,
  //         room_id: 0,
  //         description: "Service Charge",
  //         rack_rate: 0,
  //       });
  //     }
  //   }

  //   // 5. Handle optional payment
  //   const today = new Date().toISOString().split("T")[0];

  //   if (body.is_payment_given && body.payment && body.payment.amount > 0) {
  //     const accountModel = this.Model.accountModel(this.trx);
  //     const [account] = await accountModel.getSingleAccount({
  //       hotel_code,
  //       id: body.payment.acc_id,
  //     });

  //     if (!account) {
  //       throw new Error("Invalid Account");
  //     }

  //     const voucher_no = await new HelperFunction().generateVoucherNo();

  //     const [voucher] = await accountModel.insertAccVoucher({
  //       acc_head_id: account.acc_head_id,
  //       created_by,
  //       debit: body.payment.amount,
  //       credit: 0,
  //       description: `Payment for booking ${booking_id}`,
  //       voucher_type: "PAYMENT",
  //       voucher_date: today,
  //       voucher_no,
  //     });

  //     folioEntries.push({
  //       folio_id: folio.id,
  //       acc_voucher_id: voucher.id,
  //       date: today,
  //       posting_type: "Payment",
  //       credit: body.payment.amount,
  //       room_id: 0,
  //       description: "Payment Received",
  //       rack_rate: 0,
  //     });
  //   }

  //   // 6. Insert entries
  //   await hotelInvModel.insertInFolioEntries(folioEntries);

  //   // 7. Calculate total debit and update booking
  //   const totalDebit = folioEntries.reduce((sum, entry) => {
  //     return sum + (entry.debit ?? 0);
  //   }, 0);

  //   await this.Model.reservationModel(this.trx).updateRoomBooking(
  //     {
  //       total_amount: totalDebit,
  //     },
  //     hotel_code,
  //     booking_id
  //   );

  //   return {
  //     folio,
  //     entries: folioEntries,
  //   };
  // }

  public async createRoomBookingFolioWithEntriesV2({
    body,
    booking_id,
    guest_id,
    req,
  }: {
    req: Request;
    body: IGBookingRequestBody;
    booking_id: number;
    guest_id: number;
  }) {
    const hotel_code = req.hotel_admin.hotel_code;
    const created_by = req.hotel_admin.id;
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);

    // 1. Generate Folio Number
    const [lastFolio] = await hotelInvModel.getLasFolioId();
    const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);

    // 2. Insert Folio
    const [folio] = await hotelInvModel.insertInFolio({
      booking_id,
      folio_number,
      guest_id,
      hotel_code,
      name: "Reservation",
      status: "open",
      type: "Primary",
    });

    // 3. Aggregate room tariffs per date
    const chargesPerDate = new Map<
      string,
      { tariffs: IinsertFolioEntriesPayload[]; totalRate: number }
    >();

    for (const rt of body.booked_room_types) {
      for (const room of rt.rooms) {
        const rate = room.rate.changed_rate;
        const rack = room.rate.base_rate;
        for (
          let d = new Date(room.check_in);
          d < new Date(room.check_out);
          d.setDate(d.getDate() + 1)
        ) {
          const date = d.toISOString().split("T")[0];
          const entry: IinsertFolioEntriesPayload = {
            folio_id: folio.id,
            date,
            posting_type: "Charge",
            debit: rate,
            credit: 0,
            room_id: room.room_id,
            description: "Room Tariff",
            rack_rate: rack,
          };

          if (!chargesPerDate.has(date)) {
            chargesPerDate.set(date, { tariffs: [entry], totalRate: rate });
          } else {
            const rec = chargesPerDate.get(date)!;
            rec.tariffs.push(entry);
            rec.totalRate += rate;
          }
        }
      }
    }

    // 4. Build folio entries in ascending date order
    const folioEntries: IinsertFolioEntriesPayload[] = [];
    const sortedDates = [...chargesPerDate.keys()].sort();

    for (const date of sortedDates) {
      const { tariffs, totalRate } = chargesPerDate.get(date)!;
      // Push all room tariffs first
      folioEntries.push(...tariffs);

      // Then VAT
      const vatAmt = (totalRate * body.vat_percentage) / 100;
      if (vatAmt > 0) {
        folioEntries.push({
          folio_id: folio.id,
          date,
          posting_type: "Charge",
          debit: vatAmt,
          credit: 0,
          room_id: 0,
          description: "VAT",
          rack_rate: 0,
        });
      }

      // Then Service Charge
      const scAmt = (totalRate * body.service_charge_percentage) / 100;
      if (scAmt > 0) {
        folioEntries.push({
          folio_id: folio.id,
          date,
          posting_type: "Charge",
          debit: scAmt,
          credit: 0,
          room_id: 0,
          description: "Service Charge",
          rack_rate: 0,
        });
      }
    }

    // 5. Handle payment if given
    const today = new Date().toISOString().split("T")[0];
    if (body.is_payment_given && body.payment?.amount > 0) {
      const accountModel = this.Model.accountModel(this.trx);
      const [account] = await accountModel.getSingleAccount({
        hotel_code,
        id: body.payment.acc_id,
      });
      if (!account) throw new Error("Invalid Account");
      const voucher_no = await new HelperFunction().generateVoucherNo();
      const [voucher] = await accountModel.insertAccVoucher({
        acc_head_id: account.acc_head_id,
        created_by,
        debit: body.payment.amount,
        credit: 0,
        description: `Payment for booking ${booking_id}`,
        voucher_type: "PAYMENT",
        voucher_date: today,
        voucher_no,
      });
      folioEntries.push({
        folio_id: folio.id,
        acc_voucher_id: voucher.id,
        date: today,
        posting_type: "Payment",
        debit: 0,
        credit: body.payment.amount,
        room_id: 0,
        description: "Payment Received",
        rack_rate: 0,
      });
    }

    // 6. Insert entries and update booking
    await hotelInvModel.insertInFolioEntries(folioEntries);
    const totalDebit = folioEntries.reduce((sum, e) => sum + (e.debit ?? 0), 0);
    await this.Model.reservationModel(this.trx).updateRoomBooking(
      { total_amount: totalDebit },
      hotel_code,
      booking_id
    );

    return { folio, entries: folioEntries };
  }

  public async createGroupRoomBookingFolioWithEntries({
    body,
    booking_id,
    guest_id,
    req,
  }: {
    req: Request;
    body: IGBookingRequestBody;
    booking_id: number;
    guest_id: number;
  }) {
    const hotel_code = req.hotel_admin.hotel_code;
    const created_by = req.hotel_admin.id;
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);

    // 1. Generate Folio Number
    const [lastFolio] = await hotelInvModel.getLasFolioId();
    const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);

    // 2. Insert Folio
    const [folio] = await hotelInvModel.insertInFolio({
      booking_id,
      folio_number,
      guest_id,
      hotel_code,
      name: "Reservation",
      status: "open",
      type: "Primary",
    });

    // 3. Generate Folio Entries
    const folioEntries: IinsertFolioEntriesPayload[] = [];
    const checkInDate = new Date(body.check_in);
    const checkOutDate = new Date(body.check_out);
    const today = new Date().toISOString().split("T")[0];

    for (
      let current = new Date(checkInDate);
      current < checkOutDate;
      current.setDate(current.getDate() + 1)
    ) {
      const formattedDate = current.toISOString().split("T")[0];

      for (const rt of body.booked_room_types) {
        for (const room of rt.rooms) {
          folioEntries.push({
            folio_id: folio.id,
            date: formattedDate,
            posting_type: "Charge",
            debit: room.rate.changed_rate,
            room_id: room.room_id,
            description: "Room Tariff",
            rack_rate: room.rate.base_rate,
          });
        }
      }

      // VAT (posted once per night)
      if (body.vat && body.vat > 0) {
        folioEntries.push({
          folio_id: folio.id,
          date: formattedDate,
          posting_type: "Charge",
          debit: body.vat,
          room_id: 0,
          description: "VAT",
          rack_rate: 0,
        });
      }

      // Service Charge
      if (body.service_charge && body.service_charge > 0) {
        folioEntries.push({
          folio_id: folio.id,
          date: formattedDate,
          posting_type: "Charge",
          debit: body.service_charge,
          room_id: 0,
          description: "Service Charge",
          rack_rate: 0,
        });
      }
    }

    // 4. Handle Payment (if given)
    if (body.is_payment_given && body.payment && body.payment.amount > 0) {
      const accountModel = this.Model.accountModel(this.trx);

      const [account] = await accountModel.getSingleAccount({
        hotel_code,
        id: body.payment.acc_id,
      });

      if (!account) {
        throw new Error("Invalid Account");
      }

      const voucher_no = await new HelperFunction().generateVoucherNo();

      const [voucher] = await accountModel.insertAccVoucher({
        acc_head_id: account.acc_head_id,
        created_by,
        debit: body.payment.amount,
        credit: 0,
        description: `Payment for booking ${booking_id}`,
        voucher_type: "PAYMENT",
        voucher_date: today,
        voucher_no,
      });

      folioEntries.push({
        folio_id: folio.id,
        acc_voucher_id: voucher.id,
        date: today,
        posting_type: "Payment",
        credit: body.payment.amount,
        room_id: 0,
        description: "Payment Received",
        rack_rate: 0,
      });
    }

    // 5. Insert all folio entries
    await hotelInvModel.insertInFolioEntries(folioEntries);

    // 7. Calculate total debit and update booking
    const totalDebit = folioEntries.reduce((sum, entry) => {
      return sum + (entry.debit ?? 0);
    }, 0);

    await this.Model.reservationModel(this.trx).updateRoomBooking(
      {
        total_amount: totalDebit,
      },
      hotel_code,
      booking_id
    );

    return {
      folio,
      entries: folioEntries,
    };
  }
  public async createGroupRoomBookingFolioWithEntriesV2({
    body,
    booking_id,
    guest_id,
    req,
  }: {
    req: Request;
    body: IGBookingRequestBody;
    booking_id: number;
    guest_id: number;
  }) {
    const hotel_code = req.hotel_admin.hotel_code;
    const created_by = req.hotel_admin.id;
    const hotelInvModel = this.Model.hotelInvoiceModel(this.trx);
    const today = new Date().toISOString().split("T")[0];

    // 1. Generate Folio Number
    const [lastFolio] = await hotelInvModel.getLasFolioId();
    const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);

    // 2. Insert Folio
    const [folio] = await hotelInvModel.insertInFolio({
      booking_id,
      folio_number,
      guest_id,
      hotel_code,
      name: "Reservation",
      status: "open",
      type: "Primary",
    });

    // 3. Generate Folio Entries (in correct order per date)
    const folioEntries: IinsertFolioEntriesPayload[] = [];

    const dailyChargesMap = new Map<
      string,
      { roomCharges: IinsertFolioEntriesPayload[]; totalRate: number }
    >();

    for (const { rooms } of body.booked_room_types) {
      for (const room of rooms) {
        const checkInDate = new Date(room.check_in);
        const checkOutDate = new Date(room.check_out);

        for (
          let d = new Date(checkInDate);
          d < checkOutDate;
          d = new Date(d.getTime() + 86400000)
        ) {
          const date = d.toISOString().split("T")[0];
          const entry: IinsertFolioEntriesPayload = {
            folio_id: folio.id,
            date,
            posting_type: "Charge",
            debit: room.rate.changed_rate,
            credit: 0,
            room_id: room.room_id,
            description: "Room Tariff",
            rack_rate: room.rate.base_rate,
          };

          if (!dailyChargesMap.has(date)) {
            dailyChargesMap.set(date, {
              roomCharges: [entry],
              totalRate: room.rate.changed_rate,
            });
          } else {
            const existing = dailyChargesMap.get(date)!;
            existing.roomCharges.push(entry);
            existing.totalRate += room.rate.changed_rate;
          }
        }
      }
    }

    // Push entries in ASC date order
    const sortedDates = [...dailyChargesMap.keys()].sort();

    for (const date of sortedDates) {
      const { roomCharges, totalRate } = dailyChargesMap.get(date)!;

      // 1. Push all room charges for this date
      folioEntries.push(...roomCharges);

      // 2. Push VAT (if applicable)
      if (body.vat && body.vat > 0) {
        folioEntries.push({
          folio_id: folio.id,
          date,
          posting_type: "Charge",
          debit: (body.vat_percentage * totalRate) / 100,
          credit: 0,
          room_id: 0,
          description: "VAT",
          rack_rate: 0,
        });
      }

      // 3. Push Service Charge (if applicable)
      if (body.service_charge && body.service_charge > 0) {
        folioEntries.push({
          folio_id: folio.id,
          date,
          posting_type: "Charge",
          debit: (body.service_charge_percentage * totalRate) / 100,
          credit: 0,
          room_id: 0,
          description: "Service Charge",
          rack_rate: 0,
        });
      }
    }

    // 4. Handle Payment (optional)
    if (body.is_payment_given && body.payment && body.payment.amount > 0) {
      const accountModel = this.Model.accountModel(this.trx);

      const [account] = await accountModel.getSingleAccount({
        hotel_code,
        id: body.payment.acc_id,
      });

      if (!account) {
        throw new Error("Invalid Account");
      }

      const voucher_no = await new HelperFunction().generateVoucherNo();

      const [voucher] = await accountModel.insertAccVoucher({
        acc_head_id: account.acc_head_id,
        created_by,
        debit: body.payment.amount,
        credit: 0,
        description: `Payment for booking ${booking_id}`,
        voucher_type: "PAYMENT",
        voucher_date: today,
        voucher_no,
      });

      folioEntries.push({
        folio_id: folio.id,
        acc_voucher_id: voucher.id,
        date: today,
        posting_type: "Payment",
        debit: 0,
        credit: body.payment.amount,
        room_id: 0,
        description: "Payment Received",
        rack_rate: 0,
      });
    }

    // 5. Insert all folio entries
    await hotelInvModel.insertInFolioEntries(folioEntries);

    // 6. Update total amount on booking
    const totalDebit = folioEntries.reduce(
      (sum, entry) => sum + (entry.debit ?? 0),
      0
    );

    await this.Model.reservationModel(this.trx).updateRoomBooking(
      {
        total_amount: totalDebit,
      },
      hotel_code,
      booking_id
    );

    return {
      folio,
      entries: folioEntries,
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
