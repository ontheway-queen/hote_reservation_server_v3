import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class DashBoardModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async getAllInvoice(payload: {
    hotel_code: number;
    from_date?: string;
    to_date?: string;
  }) {
    const { hotel_code, from_date, to_date } = payload;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("inv_view as iv");

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select("iv.invoice_id", "iv.due")
      .where("iv.hotel_code", hotel_code)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("iv.created_at", [from_date, endDate]);
        }
      })
      .orderBy("iv.invoice_id", "desc");

    const total = await this.db("inv_view as iv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("invoice_id as total")
      .where("iv.hotel_code", hotel_code)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("iv.created_at", [from_date, endDate]);
        }
      });

    const totalAmount = await this.db("inv_view as iv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("invoice_id as total")
      .sum("iv.due as totalAmount")
      .where({ hotel_code })
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("iv.created_at", [from_date, endDate]);
        }
      });

    return {
      data,
      totalAmount: totalAmount[0].totalAmount,
      total: total[0].total,
    };
  }

  public async getAccountReport(payload: {
    from_date?: string;
    to_date?: string;
    hotel_code: number;
    ac_type: string;
  }) {
    const { ac_type, from_date, hotel_code, to_date } = payload;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const total = await this.db("acc_ledger AS al")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("al.ledger_id as total")
      .leftJoin("account as ac", "al.ac_tr_ac_id", "ac.id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("al.created_at", [from_date, endDate]);
        }
        this.andWhere("al.hotel_code", hotel_code);
        if (ac_type) {
          this.andWhere("ac.ac_type", ac_type);
        }
      });

    // total debit amount
    const totalDebitAmount = await this.db("acc_ledger AS al")
      .withSchema(this.RESERVATION_SCHEMA)
      .sum("al.ledger_debit_amount as totalDebit")
      .leftJoin("account as ac", "al.ac_tr_ac_id", "ac.id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("al.created_at", [from_date, endDate]);
        }
        this.andWhere("al.hotel_code", hotel_code);
        if (ac_type) {
          this.andWhere("ac.ac_type", ac_type);
        }
      });

    // total credit amount
    const totalCreditAmount = await this.db("acc_ledger AS al")
      .withSchema(this.RESERVATION_SCHEMA)
      .sum("al.ledger_credit_amount as totalCredit")
      .leftJoin("account as ac", "al.ac_tr_ac_id", "ac.id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("al.created_at", [from_date, endDate]);
        }
        this.andWhere("al.hotel_code", hotel_code);
        if (ac_type) {
          this.andWhere("ac.ac_type", ac_type);
        }
      });

    // total total Remainig balance
    const totalRemaining = await this.db("acc_ledger AS al")
      .withSchema(this.RESERVATION_SCHEMA)
      .sum("al.ledger_balance as totalRemaining")
      .leftJoin("account as ac", "al.ac_tr_ac_id", "ac.id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("al.created_at", [from_date, endDate]);
        }
        this.andWhere("al.hotel_code", hotel_code);
        if (ac_type) {
          this.andWhere("ac.ac_type", ac_type);
        }
      });

    return {
      total: total[0].total,
      totalDebitAmount: totalDebitAmount[0].totalDebit | 0,
      totalCreditAmount: totalCreditAmount[0].totalCredit | 0,
      totalRemainingAmount: totalRemaining[0].totalRemaining | 0,
    };
  }

  public async getHotelStatistics(hotel_code: number) {
    const roomCount = await this.db("rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("id as total")
      .where({ hotel_code })
      .first();

    return {
      totalRooms: roomCount?.total ? parseInt(roomCount.total as string) : 0,
    };
  }

  public async getHotelStatisticsArrivalDepartureStays({
    current_date,
    hotel_code,
  }: {
    hotel_code: number;
    current_date: string;
  }) {
    const totalArrivals = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin("booking_rooms as br", "b.id", "br.booking_id")
      .count("b.id as total")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .andWhere("br.check_in", current_date)
      .andWhere("br.status", "confirmed")
      .first();

    const totalDepartures = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin("booking_rooms as br", "b.id", "br.booking_id")
      .count("b.id as total")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .andWhere("br.status", "checked_in")
      .andWhere("br.check_out", current_date)
      .first();

    const totalStays = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin("booking_rooms as br", "b.id", "br.booking_id")
      .count("b.id as total")
      .where("b.hotel_code", hotel_code)
      .andWhere(function () {
        this.where("br.check_out", ">", current_date).andWhere(
          "br.check_in",
          "<=",
          current_date
        );
      })
      .andWhere("br.status", "checked_in")
      .first();

    return {
      totalStays: totalStays ? Number(totalStays.total) : 0,
      totalDepartures: totalDepartures ? Number(totalDepartures.total) : 0,
      totalArrivals: totalArrivals ? Number(totalArrivals.total) : 0,
    };
  }

  public async getOccupiedRoomAndBookings({
    hotel_code,
    current_date,
  }: {
    hotel_code: number;
    current_date: string;
  }) {
    const totalOccupiedRoomsResult = await this.db("booking_rooms as br")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("br.id as totalrooms")
      .join("bookings as b", "br.booking_id", "b.id")
      .where("b.hotel_code", hotel_code)
      .andWhere(function () {
        this.where("b.check_out", ">", current_date).andWhere(
          "b.check_in",
          "<=",
          current_date
        );
      })
      .andWhere(function () {
        this.where(function () {
          this.where("b.booking_type", "B").andWhere("b.status", "confirmed");
        })
          .orWhere(function () {
            this.where("b.booking_type", "B").andWhere(
              "b.status",
              "checked_in"
            );
          })
          .orWhere(function () {
            this.where("b.booking_type", "H").andWhere("b.status", "confirmed");
          });
      })
      .first();

    const totalActiveBookings = await this.db("bookings")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("id as total")
      .where("hotel_code", hotel_code)
      .where(function () {
        this.where(function () {
          this.where("booking_type", "B").andWhere("status", "confirmed");
        }).orWhere(function () {
          this.where("booking_type", "B").andWhere("status", "checked_in");
        });
      })
      .first();

    const totalHoldBookings = await this.db("bookings")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("id as total")
      .where("hotel_code", hotel_code)
      .where(function () {
        this.where("booking_type", "H").andWhere("status", "confirmed");
      })
      .first();

    return {
      totalOccupiedRoomsResult: totalOccupiedRoomsResult
        ? Number(totalOccupiedRoomsResult.totalrooms)
        : 0,
      totalActiveBookings: totalActiveBookings
        ? Number(totalActiveBookings.total)
        : 0,
      totalHoldBookings: totalHoldBookings
        ? Number(totalHoldBookings.total)
        : 0,
    };
  }

  public async getGuestReport({
    current_date,
    hotel_code,
    booking_mode,
    limit,
    skip,
  }: {
    hotel_code: number;
    current_date: string;
    limit?: string;
    skip?: string;
    booking_mode: "arrival" | "departure" | "stay";
  }) {
    if (booking_mode == "arrival") {
      const data = await this.db("bookings as b")
        .withSchema(this.RESERVATION_SCHEMA)
        .select(
          "g.id as guest_id",
          "g.first_name",
          "g.last_name",
          "br.check_in",
          "br.check_out",
          "br.status"
        )
        .leftJoin("booking_rooms as br", "b.id", "br.booking_id")
        .leftJoin("guests as g", "b.guest_id", "g.id")
        .where("b.hotel_code", hotel_code)
        .andWhere("br.check_in", current_date)
        .andWhere("br.status", "confirmed")
        .limit(limit ? parseInt(limit) : 50)
        .offset(skip ? parseInt(skip) : 0);

      const total = await this.db("bookings as b")
        .withSchema(this.RESERVATION_SCHEMA)
        .select("b.id as total")
        .leftJoin("booking_rooms as br", "b.id", "br.booking_id")
        .leftJoin("guests as g", "b.guest_id", "g.id")
        .where("b.hotel_code", hotel_code)
        .andWhere("br.check_in", current_date)
        .andWhere("br.status", "confirmed")
        .first();

      return {
        data,
        total: total ? total.total : 0,
      };
    } else if (booking_mode == "departure") {
      const data = await this.db("bookings as b")
        .withSchema(this.RESERVATION_SCHEMA)
        .select(
          "g.id as guest_id",
          "g.first_name",
          "g.last_name",
          "br.check_in",
          "br.check_out",
          "br.status"
        )
        .leftJoin("booking_rooms as br", "b.id", "br.booking_id")
        .leftJoin("guests as g", "b.guest_id", "g.id")
        .where("b.hotel_code", hotel_code)
        .andWhere("br.check_out", current_date)
        .andWhere("br.status", "checked_in")
        .limit(limit ? parseInt(limit) : 50)
        .offset(skip ? parseInt(skip) : 0);

      const total = await this.db("bookings as b")
        .withSchema(this.RESERVATION_SCHEMA)
        .select("b.id as total")
        .leftJoin("guests as g", "b.guest_id", "g.id")
        .leftJoin("booking_rooms as br", "b.id", "br.booking_id")
        .where("b.hotel_code", hotel_code)
        .andWhere("br.status", "checked_in")
        .andWhere("br.check_out", current_date)
        .first();
      return {
        data,
        total: total ? total.total : 0,
      };
    } else {
      const data = await this.db("bookings as b")
        .withSchema(this.RESERVATION_SCHEMA)
        .select(
          "g.id as guest_id",
          "g.first_name",
          "g.last_name",
          "br.check_in",
          "br.check_out",
          "br.status"
        )
        .leftJoin("guests as g", "b.guest_id", "g.id")
        .leftJoin("booking_rooms as br", "b.id", "br.booking_id")
        .where("b.hotel_code", hotel_code)
        .andWhere(function () {
          this.where("br.check_out", ">", current_date).andWhere(
            "br.check_in",
            "<=",
            current_date
          );
        })
        .andWhere("br.status", "checked_in")
        .limit(limit ? parseInt(limit) : 50)
        .offset(skip ? parseInt(skip) : 0);

      const total = await this.db("bookings as b")
        .withSchema(this.RESERVATION_SCHEMA)
        .select("b.id as total")
        .leftJoin("guests as g", "b.guest_id", "g.id")
        .leftJoin("booking_rooms as br", "b.id", "br.booking_id")
        .where("b.hotel_code", hotel_code)
        .andWhere(function () {
          this.where("br.check_out", ">", current_date).andWhere(
            "br.check_in",
            "<=",
            current_date
          );
        })
        .andWhere("br.status", "checked_in")
        .first();
      return {
        data,
        total: total ? total.total : 0,
      };
    }
  }

  public async getRoomReport({
    current_date,
    hotel_code,
    limit,
    skip,
  }: {
    hotel_code: number;
    current_date: string;
    limit?: string;
    skip?: string;
  }) {
    return await this.db("room_types as rt")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "rt.id as room_type_id",
        "rt.name",
        "rt.hotel_code",
        this.db.raw(
          `
        COALESCE((
          SELECT json_build_object(
            'total_rooms', ra.total_rooms,
            'booked_rooms', ra.booked_rooms,
            'hold_rooms', ra.hold_rooms,
            'available_rooms', ra.available_rooms,
            'stop_sell', ra.stop_sell
          )
          FROM hotel_reservation.room_availability as ra
          WHERE rt.id = ra.room_type_id AND ra.date = ?
        ), json_build_object(
          'total_rooms', 0,
          'booked_rooms', 0,
          'hold_rooms', 0,
          'available_rooms', 0,
          'stop_sell', false
        )) as availability
        `,
          [current_date]
        )
      )
      .where("rt.hotel_code", hotel_code)
      .andWhere("rt.is_deleted", false);
  }

  public async getGuestDistributionCountryWise({
    hotel_code,
    limit,
    skip,
  }: {
    hotel_code: number;
    limit?: string;
    skip?: string;
  }) {
    return await this.db("guests as g")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "c.country_name as country",
        this.db.raw("count(g.id) as total_guests")
      )
      .joinRaw("LEFT JOIN public.country as c ON g.country_id = c.id")
      .where("g.hotel_code", hotel_code)
      .groupBy("c.country_name");
  }
}
export default DashBoardModel;
