import { Knex } from "knex";
import AbstractServices from "../../abstarcts/abstract.service";
import { HelperFunction } from "../../appAdmin/utlis/library/helperFunction";
import Lib from "../../utils/lib/lib";
import {
  IBookedRoomTypeRequest,
  IFolioBookingBody,
  IHolder,
} from "../utills/interfaces/btoc.hotel.interface";
import { IinsertFolioEntriesPayload } from "../../appAdmin/utlis/interfaces/invoice.interface";
import {
  IBookingDetails,
  IGBookingRequestBody,
} from "../../appAdmin/utlis/interfaces/reservation.interface";
import { Request } from "express";

export class SubBtocHotelService extends AbstractServices {
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
    guest: IHolder,
    hotel_code: number
  ): Promise<number> {
    const guestModel = this.Model.guestModel(this.trx);
    // Check if guest already exists
    const existingGuest = await guestModel.getSingleGuest({
      email: guest.email,
      hotel_code,
    });
    console.log({ existingGuest });
    if (existingGuest.length) {
      return existingGuest[0].id;
    }
    const [insertedGuest] = await guestModel.createGuest({
      hotel_code,
      first_name: guest.first_name,
      last_name: guest.last_name,
      //   country_id: guest.country_id,
      email: guest.email,
      phone: guest.phone,
      address: guest.address,
      //   passport_no: guest.passport_no,
    });

    return insertedGuest.id;
  }

  async createMainBooking({
    payload,
    hotel_code,
    guest_id,
    sub_total,
    total_amount,
    total_nights,
  }: {
    payload: {
      check_in: string;
      check_out: string;
      booking_type: string;
      created_by: number;
      special_requests?: string;
      is_individual_booking: boolean;
      payment_status: "paid" | "unpaid";
    };
    hotel_code: number;
    guest_id: number;
    sub_total: number;
    total_amount: number;
    total_nights: number;
  }): Promise<{ id: number; booking_ref: string }> {
    const reservation_model = this.BtocModels.btocReservationModel(this.trx);
    const last = await reservation_model.getLastBooking();
    const lastId = last?.id ?? 1;

    const ref = Lib.generateBookingReferenceWithId(`WB`, lastId);

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
      payment_status: payload.payment_status,
      comments: payload.special_requests,
      booking_type: payload.booking_type,
      created_by: payload.created_by,
      status: "pending",
      book_from: "web",
    });

    return { id: booking.id, booking_ref: ref };
  }

  public async insertBookingRooms({
    booked_room_types,
    booking_id,
    hotel_code,
  }: {
    booked_room_types: IBookedRoomTypeRequest[];
    booking_id: number;
    hotel_code: number;
  }) {
    for (const rt of booked_room_types) {
      for (const room of rt.rooms) {
        const nights = HelperFunction.calculateNights(
          room.check_in,
          room.check_out
        );

        // Insert booking room
        const [bookingRoomRes] = await this.BtocModels.btocReservationModel(
          this.trx
        ).insertBookingRoom([
          {
            check_in: room.check_in,
            check_out: room.check_out,
            status: "pending",
            booking_id,
            room_type_id: rt.room_type_id,
            adults: room.adults,
            children: room.children,

            base_rate: room.rate.base_rate * nights,
            changed_rate: room.rate.changed_rate * nights,
            unit_base_rate: room.rate.base_rate,
            unit_changed_rate: room.rate.changed_rate,
          },
        ]);

        const booking_room_id = bookingRoomRes.id;

        // Insert guests and booking_room_guests
        if (room?.guest_info) {
          console.log(room.guest_info);

          for (const guest of room.guest_info) {
            const [guestRes] = await this.Model.guestModel(
              this.trx
            ).createGuestForGroupBooking({
              title: guest.title,
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

  public async createBtocRoomBookingFolioWithEntries({
    body,
    booking_id,
    guest_id,
    req,
    booking_ref,
    hotel_code,
  }: {
    req: Request;
    body: IFolioBookingBody;
    booking_id: number;
    guest_id: number;
    hotel_code: number;
    booking_ref: string;
  }) {
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

    console.log({ folio });

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

    /*  persist entries */
    const allEntries = [...child.flatMap((c) => c.entries)];

    allEntries.push({
      folio_id: child[0].folioId,
      date: today,
      posting_type: "Payment",
      credit: body.payment.amount,
      debit: 0,
      description: "Payment for room booking",
    });

    // insert in folio entries
    await hotelInvModel.insertInFolioEntries(allEntries);

    const helper = new HelperFunction();

    const money_receipt_no = await helper.generateMoneyReceiptNo(this.trx);

    const mRes = await hotelInvModel.insertMoneyReceipt({
      hotel_code,
      receipt_date: today,
      amount_paid: body.payment.amount,
      payment_method: "SURJO_PAY",
      receipt_no: money_receipt_no,
      received_by: req.hotel_admin.id,
      notes: "Advance Payment",
    });

    await hotelInvModel.insertFolioMoneyReceipt({
      amount: body.payment.amount,
      money_receipt_id: mRes[0]?.id,
      folio_id: folio?.id,
      booking_ref,
    });

    return {
      folio_id: folio?.id,
      childFolios: child.map((c) => ({
        id: c.folioId,
        folio_number: c.folioNumber,
        room_id: c.roomId,
      })),
      entries: allEntries,
    };
  }

  public mapSingleBookingToFolioBody(
    singleBooking: IBookingDetails
  ): IFolioBookingBody {
    return {
      vat_percentage: singleBooking.vat_percentage,
      service_charge_percentage: singleBooking.service_charge_percentage,
      is_payment_given: singleBooking.payment_status === "paid",
      payment: {
        amount: singleBooking.total_amount,
      },
      booked_room_types: [
        {
          rooms: singleBooking.booking_rooms.map((r) => ({
            check_in: r.check_in,
            check_out: r.check_out,
            room_id: r.room_id,
            rate: {
              base_rate: r.base_rate,
              changed_rate: r.changed_rate,
            },
          })),
        },
      ],
    };
  }
}
