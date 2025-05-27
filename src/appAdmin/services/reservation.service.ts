import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IBookingRequest,
  IgetChildRateGroups,
  ISearchAvailableRoom,
} from "../utlis/interfaces/reservation.interface";

export class ReservationService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAllAvailableRooms(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { check_in, check_out, rooms } = req.body as {
      check_in: string;
      check_out: string;
      rooms: { adults: number; children: number; children_ages?: number[] }[];
    };

    if (!check_in || !check_out) {
      throw new Error(
        "check_in and check_out dates must be provided and valid"
      );
    }

    const nights = Math.ceil(
      (new Date(check_out).getTime() - new Date(check_in).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const totalRoomsRequested = rooms.length;
    const isAllSameConfig = rooms.every(
      (r) => r.adults === rooms[0].adults && r.children === rooms[0].children
    );

    const db = this.db;

    const accomodationSetting = await db("accommodation_settings")
      .withSchema(this.schema.RESERVATION_SCHEMA)
      .select("id", "has_child_rates", "check_in_time", "check_out_time")
      .where("hotel_code", hotel_code)
      .first();

    const childRateGroups: IgetChildRateGroups[] =
      accomodationSetting?.has_child_rates
        ? await db("child_rate_groups as crg")
            .withSchema(this.schema.RESERVATION_SCHEMA)
            .select(
              "hotel_code",
              "id",
              "rate_plan_id",
              "age_from",
              "age_to",
              "rate_type",
              "rate_value",
              "room_type_id"
            )
            .where("crg.hotel_code", hotel_code)
        : [];

    // daily rates
    const fetchDailyRates = async (
      roomTypeId: number,
      ratePlanId: number,
      checkIn: string,
      checkOut: string,
      hotelCode: number
    ) => {
      console.log({ roomTypeId, ratePlanId, checkIn, checkOut, hotelCode });
      return await db("daily_rates as dr")
        .withSchema(this.schema.RESERVATION_SCHEMA)
        .select("dr.date", "dr.rate", "dr.extra_adult_rate")
        .where("dr.room_type_id", roomTypeId)
        .andWhere("dr.hotel_code", hotelCode)
        .andWhere("dr.rate_plan_id", ratePlanId)
        .andWhere("dr.date", ">=", checkIn)
        .andWhere("dr.date", "<", checkOut);
    };

    const fetchMatchingRoomTypes = async (
      adults: number,
      children: number
    ): Promise<ISearchAvailableRoom[]> => {
      return await db("room_types as rt")
        .withSchema(this.schema.RESERVATION_SCHEMA)
        .select(
          "rt.id as room_type_id",
          "rt.name as room_type_name",
          "rt.base_occupancy",
          "rt.max_occupancy",
          "rt.max_adults",
          "rt.max_children",
          "rpd.base_includes_children",
          "rp.cancellation_policy_id",
          "cp.policy_name as cancellation_policy_name",
          "cp.description as cancellation_policy_description",
          db.raw("MIN(ra.available_rooms) as available_rooms"),
          db.raw("MIN(rpd.base_rate) as min_base_rate"),
          db.raw("COALESCE(rpd.extra_adult_rate, 0) as extra_adult_rate"),
          db.raw("COALESCE(rpd.extra_child_rate, 0) as extra_child_rate"),
          "rpd.rate_plan_id",
          db.raw(`
                  JSON_AGG(
                    DISTINCT JSONB_BUILD_OBJECT(
                      'id', bt.id,
                      'name', bt.name,
                      'width', bt.width,
                      'height', bt.height,
                      'quantity', rtb.quantity,
                      'unit', bt.unit
                    )
                  ) FILTER (WHERE bt.id IS NOT NULL) AS beds
                `),

          db.raw(`
                  JSON_AGG(
                    DISTINCT JSONB_BUILD_OBJECT(
                      'meal_plan_item_id', mpi.id,
                      'meal_plan_name', mp.name,
                      'price', mpi.price,
                      'vat', mpi.vat,
                      'included', rpm.included
                    )
                  ) FILTER (WHERE mpi.id IS NOT NULL) AS meal_plan_items
                `),

          db.raw(`
                  JSON_AGG(
                    DISTINCT JSONB_BUILD_OBJECT(
                      'cancellation_policy_id', cp.id,
                      'days_before', cpr.days_before,
                      'rule_type', cpr.rule_type,
                      'fee_type', cpr.fee_type,
                      'fee_value', cpr.fee_value
                    )
                  ) FILTER (WHERE cp.id IS NOT NULL) AS cancellation_policy_rules
                `)
        )
        .leftJoin("room_availability as ra", function () {
          this.on("rt.id", "=", "ra.room_type_id").andOn(
            "ra.hotel_code",
            "=",
            "rt.hotel_code"
          );
        })
        .leftJoin("rate_plan_details as rpd", function () {
          this.on("rt.id", "=", "rpd.room_type_id").andOn(
            "rpd.hotel_code",
            "=",
            "rt.hotel_code"
          );
        })
        .leftJoin("rate_plans as rp", function () {
          this.on("rpd.rate_plan_id", "=", "rp.id").andOn(
            "rp.hotel_code",
            "=",
            "rt.hotel_code"
          );
        })
        .leftJoin("rate_plan_meal_mappings as rpm", "rp.id", "rpm.rate_plan_id")
        .leftJoin("meal_plan_items as mpi", function () {
          this.on("rpm.meal_plan_item_id", "=", "mpi.id");
        })
        .leftJoin("meal_plans as mp", function () {
          this.on("mpi.meal_plan_id", "=", "mp.id");
        })
        .leftJoin(
          "cancellation_policies as cp",
          "rp.cancellation_policy_id",
          "cp.id"
        )
        .leftJoin(
          "cancellation_policy_rules as cpr",
          "cp.id",
          "cpr.cancellation_policy_id"
        )
        .leftJoin("room_type_beds as rtb", "rt.id", "rtb.room_type_id")
        .leftJoin("bed_types as bt", "rtb.bed_type_id", "bt.id")
        .where("rt.hotel_code", hotel_code)
        .andWhere("rt.max_adults", ">=", adults)
        .andWhere("rt.max_children", ">=", children)
        .andWhere("ra.stop_sell", false)
        .andWhere("ra.date", ">=", check_in)
        .andWhere("ra.date", "<", check_out)
        .groupBy(
          "rt.id",
          "rt.name",
          "rt.base_occupancy",
          "rt.max_occupancy",
          "rt.max_adults",
          "rt.max_children",
          "rpd.extra_adult_rate",
          "rpd.rate_plan_id",
          "rpd.base_includes_children",
          "rp.cancellation_policy_id",
          "cp.policy_name",
          "cp.description",
          "rpd.extra_child_rate"
        )
        .havingRaw("COUNT(DISTINCT ra.date) = ?", [nights])
        .havingRaw("MIN(ra.available_rooms) >= 1")
        .havingRaw("MIN(rpd.base_rate) IS NOT NULL");
    };

    const buildRoomTypeResult = async (
      { single_room_type }: { single_room_type: ISearchAvailableRoom },
      {
        searchedRooms,
      }: {
        searchedRooms: {
          adults: number;
          children: number;
          children_ages?: number[];
        };
      }
    ) => {
      const baseIncludesChildren = single_room_type.base_includes_children;
      const baseOccupancy = Number(single_room_type.base_occupancy);
      const adults = searchedRooms.adults;
      const children = searchedRooms.children;
      const extraAdultRate = Number(single_room_type.extra_adult_rate);
      const baseRate = Number(single_room_type.min_base_rate);
      const fallbackExtraChildRate = single_room_type.extra_child_rate || 0;

      const dailyRates = await fetchDailyRates(
        single_room_type.room_type_id,
        single_room_type.rate_plan_id,
        check_in,
        check_out,
        hotel_code
      );

      const baseRatePerDayList: number[] = [];
      for (let i = 0; i < nights; i++) {
        baseRatePerDayList.push(Number(dailyRates[i]?.rate || baseRate));
      }

      let totalBaseRate = 0;
      let totalExtraAdult = 0;
      let totalExtraChild = 0;

      const rateBreakdown = [];

      for (let i = 0; i < nights; i++) {
        const date = dailyRates[i]?.date;
        const rate = baseRatePerDayList[i];
        let extraAdultCharge = 0;
        let extraChildCharge = 0;

        const extraAdults = Math.max(0, adults - baseOccupancy);
        extraAdultCharge = extraAdults * extraAdultRate;

        if (
          accomodationSetting?.has_child_rates &&
          Array.isArray(searchedRooms.children_ages)
        ) {
          const getRateForAge = (age: number): number => {
            const rateGroup = childRateGroups.find(
              (r) =>
                r.room_type_id === single_room_type.room_type_id &&
                r.rate_plan_id === single_room_type.rate_plan_id &&
                age >= r.age_from &&
                age <= r.age_to
            );
            if (!rateGroup) return fallbackExtraChildRate;

            return rateGroup.rate_type === "fixed"
              ? Number(rateGroup.rate_value)
              : rateGroup.rate_type === "percentage"
              ? (rate * Number(rateGroup.rate_value)) / 100
              : 0;
          };

          if (baseIncludesChildren) {
            const baseChildCount = baseOccupancy - adults;
            const extraChildren = Math.max(0, children - baseChildCount);
            const extraChildAges =
              searchedRooms.children_ages.slice(baseChildCount);
            for (const age of extraChildAges) {
              extraChildCharge += getRateForAge(age);
            }
          } else {
            for (const age of searchedRooms.children_ages) {
              extraChildCharge += getRateForAge(age);
            }
          }
        } else {
          extraChildCharge =
            baseIncludesChildren && children <= baseOccupancy - adults
              ? 0
              : children * fallbackExtraChildRate;
        }

        const totalForDay = rate + extraAdultCharge + extraChildCharge;

        rateBreakdown.push({
          date,
          base_rate: rate,
          extra_adult_charge: extraAdultCharge,
          extra_child_charge: extraChildCharge,
          total_rate: totalForDay,
        });

        totalBaseRate += rate;
        totalExtraAdult += extraAdultCharge;
        totalExtraChild += extraChildCharge;
      }

      const totalPrice = totalBaseRate + totalExtraAdult + totalExtraChild;

      return {
        ...single_room_type,
        matched_occupancy: searchedRooms,
        daily_rates_used: baseRatePerDayList.some((_, i) => dailyRates[i]),
        total_price: totalPrice.toFixed(2),
        rate_breakdown: rateBreakdown,
      };
    };

    let matchedRoomTypes: any[] = [];

    if (isAllSameConfig) {
      const { adults, children } = rooms[0];
      const roomTypes = await fetchMatchingRoomTypes(adults, children);
      matchedRoomTypes = await Promise.all(
        roomTypes
          .filter(
            (rt: any) => parseInt(rt.available_rooms) >= totalRoomsRequested
          )
          .map((rt) =>
            buildRoomTypeResult(
              { single_room_type: rt },
              { searchedRooms: rooms[0] }
            )
          )
      );
    } else {
      matchedRoomTypes = [];

      const tempResults: any[] = [];

      for (const searchedRoom of rooms) {
        const roomTypes = await fetchMatchingRoomTypes(
          searchedRoom.adults,
          searchedRoom.children
        );

        const matching = roomTypes
          .filter((rt: any) => parseInt(rt.available_rooms) >= 1)
          .map((rt) =>
            buildRoomTypeResult(
              { single_room_type: rt },
              { searchedRooms: searchedRoom }
            )
          );

        tempResults.push(...matching);
      }

      matchedRoomTypes = await Promise.all(tempResults);
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: matchedRoomTypes,
    };
  }

  public async createBooking(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { check_in, check_out, rooms, special_requests } =
      req.body as IBookingRequest;

    if (!check_in || !check_out) {
      throw new Error(
        "check_in and check_out dates must be provided and valid"
      );
    }

    // Implement booking creation logic here
    // This is a placeholder response
    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      data: { message: "Booking created successfully" },
    };
  }
}
export default ReservationService;
