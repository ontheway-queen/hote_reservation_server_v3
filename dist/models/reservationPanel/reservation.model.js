"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class ReservationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // public async searchAvailableRooms({
    //   hotel_code,
    //   check_in,
    //   check_out,
    //   rooms,
    // }: {
    //   hotel_code: number;
    //   check_in: string;
    //   check_out: string;
    //   rooms: { adults: number; children: number; children_ages?: number[] }[];
    // }) {
    //   if (!check_in || !check_out) {
    //     throw new Error(
    //       "check_in and check_out dates must be provided and valid"
    //     );
    //   }
    //   const nights = Math.ceil(
    //     (new Date(check_out).getTime() - new Date(check_in).getTime()) /
    //       (1000 * 60 * 60 * 24)
    //   );
    //   const totalRoomsRequested = rooms.length;
    //   const isAllSameConfig = rooms.every(
    //     (r) => r.adults === rooms[0].adults && r.children === rooms[0].children
    //   );
    //   const db = this.db;
    //   const accomodationSetting = await db("accommodation_settings")
    //     .withSchema(this.RESERVATION_SCHEMA)
    //     .select("id", "has_child_rates", "check_in_time", "check_out_time")
    //     .where("hotel_code", hotel_code)
    //     .first();
    //   const childRateGroups: IgetChildRateGroups[] =
    //     accomodationSetting?.has_child_rates
    //       ? await db("child_rate_groups as crg")
    //           .withSchema(this.RESERVATION_SCHEMA)
    //           .select(
    //             "hotel_code",
    //             "id",
    //             "rate_plan_id",
    //             "age_from",
    //             "age_to",
    //             "rate_type",
    //             "rate_value",
    //             "room_type_id"
    //           )
    //           .where("crg.hotel_code", hotel_code)
    //       : [];
    //   // daily rates
    //   const fetchDailyRates = async (roomTypeId: number, ratePlanId: number) => {
    //     const rates = await db("daily_rates as dr")
    //       .withSchema(this.RESERVATION_SCHEMA)
    //       .select(
    //         "dr.date",
    //         "dr.rate",
    //         "dr.extra_adult_rate",
    //         "dr.base_includes_children"
    //       )
    //       .where("dr.room_type_id", roomTypeId)
    //       .andWhere("dr.hotel_code", hotel_code)
    //       .andWhere("dr.rate_plan_id", ratePlanId)
    //       .andWhere("dr.date", ">=", check_in)
    //       .andWhere("dr.date", "<", check_out);
    //     return rates;
    //   };
    //   const fetchMatchingRoomTypes = async (
    //     adults: number,
    //     children: number
    //   ): Promise<ISearchAvailableRoom[]> => {
    //     return db("room_types as rt")
    //       .withSchema(this.RESERVATION_SCHEMA)
    //       .select(
    //         "rt.id as room_type_id",
    //         "rt.name as room_type_name",
    //         "rt.base_occupancy",
    //         "rt.max_occupancy",
    //         "rt.max_adults",
    //         "rt.max_children",
    //         "rpd.base_includes_children",
    //         "rp.cancellation_policy_id",
    //         "cp.policy_name as cancellation_policy_name",
    //         "cp.description as cancellation_policy_description",
    //         db.raw("MIN(ra.available_rooms) as available_rooms"),
    //         db.raw("MIN(rpd.base_rate) as min_base_rate"),
    //         db.raw("COALESCE(rpd.extra_adult_rate, 0) as extra_adult_rate"),
    //         db.raw(`
    //             JSON_AGG(
    //               DISTINCT JSONB_BUILD_OBJECT(
    //                 'id', bt.id,
    //                 'name', bt.name,
    //                 'width', bt.width,
    //                 'height', bt.height,
    //                 'quantity', rtb.quantity,
    //                 'unit', bt.unit
    //               )
    //             ) FILTER (WHERE bt.id IS NOT NULL) AS beds
    //           `),
    //         "rpd.rate_plan_id",
    //         db.raw(`
    //             JSON_AGG(
    //               DISTINCT JSONB_BUILD_OBJECT(
    //                 'meal_plan_item_id', mpi.id,
    //                 'meal_plan_name', mp.name,
    //                 'price', mpi.price,
    //                 'vat', mpi.vat,
    //                 'included', rpm.included
    //               )
    //             ) FILTER (WHERE mpi.id IS NOT NULL) AS meal_plan_items
    //           `)
    //       )
    //       .leftJoin("room_availability as ra", function () {
    //         this.on("rt.id", "=", "ra.room_type_id").andOn(
    //           "ra.hotel_code",
    //           "=",
    //           "rt.hotel_code"
    //         );
    //       })
    //       .leftJoin("rate_plan_details as rpd", function () {
    //         this.on("rt.id", "=", "rpd.room_type_id").andOn(
    //           "rpd.hotel_code",
    //           "=",
    //           "rt.hotel_code"
    //         );
    //       })
    //       .leftJoin("rate_plans as rp", function () {
    //         this.on("rpd.rate_plan_id", "=", "rp.id").andOn(
    //           "rp.hotel_code",
    //           "=",
    //           "rt.hotel_code"
    //         );
    //       })
    //       .leftJoin("rate_plan_meal_mappings as rpm", "rp.id", "rpm.rate_plan_id")
    //       .leftJoin("meal_plan_items as mpi", function () {
    //         this.on("rpm.meal_plan_item_id", "=", "mpi.id");
    //       })
    //       .leftJoin("meal_plans as mp", function () {
    //         this.on("mpi.meal_plan_id", "=", "mp.id");
    //       })
    //       .leftJoin(
    //         "cancellation_policies as cp",
    //         "rp.cancellation_policy_id",
    //         "cp.id"
    //       )
    //       .leftJoin("room_type_beds as rtb", "rt.id", "rtb.room_type_id")
    //       .leftJoin("bed_types as bt", "rtb.bed_type_id", "bt.id")
    //       .where("rt.hotel_code", hotel_code)
    //       .andWhere("rt.max_adults", ">=", adults)
    //       .andWhere("rt.max_children", ">=", children)
    //       .andWhere("ra.stop_sell", false)
    //       .andWhere("ra.date", ">=", check_in)
    //       .andWhere("ra.date", "<", check_out)
    //       .groupBy(
    //         "rt.id",
    //         "rt.name",
    //         "rt.base_occupancy",
    //         "rt.max_occupancy",
    //         "rt.max_adults",
    //         "rt.max_children",
    //         "rpd.extra_adult_rate",
    //         "rpd.rate_plan_id",
    //         "rpd.base_includes_children",
    //         "rp.cancellation_policy_id",
    //         "cp.policy_name",
    //         "cp.description"
    //       )
    //       .havingRaw("COUNT(DISTINCT ra.date) = ?", [nights])
    //       .havingRaw("MIN(ra.available_rooms) >= 1")
    //       .havingRaw("MIN(rpd.base_rate) IS NOT NULL");
    //   };
    //   const buildRoomTypeResult = (
    //     { single_room_type }: { single_room_type: ISearchAvailableRoom },
    //     {
    //       searchedRooms,
    //     }: {
    //       searchedRooms: {
    //         adults: number;
    //         children: number;
    //         children_ages?: number[];
    //       };
    //     }
    //   ) => {
    //     const baseRate = single_room_type.min_base_rate;
    //     const totalBaseRate = baseRate * nights;
    //     const extraAdultRate = single_room_type.extra_adult_rate;
    //     const baseIncludesChildren = single_room_type.base_includes_children;
    //     const baseOccupancy = Number(single_room_type.base_occupancy);
    //     const adults = searchedRooms.adults;
    //     const children = searchedRooms.children;
    //     const extraAdults = Math.max(0, adults - baseOccupancy);
    //     const extraAdultCharge = extraAdults * extraAdultRate;
    //     let childCharge = 0;
    //     const fallbackExtraChildRate = 100; // fallback if no match found
    //     if (baseIncludesChildren) {
    //       console.log({ baseOccupancy, adults, children });
    //       const baseChildCount = baseOccupancy - adults;
    //       const extraChildren = Math.max(0, children - baseChildCount);
    //       console.log({ extraChildren });
    //       console.log({ accomodationSetting });
    //       if (
    //         accomodationSetting?.has_child_rates &&
    //         extraChildren > 0 &&
    //         Array.isArray(searchedRooms.children_ages)
    //       ) {
    //         const extraChildAges =
    //           searchedRooms.children_ages.slice(baseChildCount);
    //         console.log({ extraChildAges });
    //         for (const age of extraChildAges) {
    //           const rateGroup = childRateGroups.find(
    //             (r) =>
    //               r.room_type_id === single_room_type.room_type_id &&
    //               r.rate_plan_id === single_room_type.rate_plan_id &&
    //               age >= r.age_from &&
    //               age <= r.age_to
    //           );
    //           if (rateGroup) {
    //             childCharge +=
    //               rateGroup.rate_type === "fixed"
    //                 ? Number(rateGroup.rate_value)
    //                 : (totalBaseRate * Number(rateGroup.rate_value)) / 100;
    //           } else {
    //             childCharge += fallbackExtraChildRate;
    //           }
    //         }
    //       } else {
    //         childCharge = extraChildren * fallbackExtraChildRate;
    //       }
    //     } else {
    //       if (
    //         accomodationSetting?.has_child_rates &&
    //         children > 0 &&
    //         Array.isArray(searchedRooms.children_ages)
    //       ) {
    //         for (const age of searchedRooms.children_ages) {
    //           const rateGroup = childRateGroups.find(
    //             (r) =>
    //               r.room_type_id === single_room_type.room_type_id &&
    //               r.rate_plan_id === single_room_type.rate_plan_id &&
    //               age >= r.age_from &&
    //               age <= r.age_to
    //           );
    //           if (rateGroup) {
    //             console.log({ rateGroup });
    //             childCharge +=
    //               rateGroup.rate_type === "fixed"
    //                 ? Number(rateGroup.rate_value)
    //                 : (totalBaseRate * Number(rateGroup.rate_value)) / 100;
    //           } else {
    //             childCharge += fallbackExtraChildRate;
    //           }
    //         }
    //       } else {
    //         childCharge = children * fallbackExtraChildRate;
    //       }
    //     }
    //     const totalPrice =
    //       totalBaseRate + extraAdultCharge * nights + childCharge * nights;
    //     return {
    //       ...single_room_type,
    //       matched_occupancy: searchedRooms,
    //       total_price: totalPrice.toFixed(2),
    //     };
    //   };
    //   let matchedRoomTypes: any[] = [];
    //   if (isAllSameConfig) {
    //     const { adults, children } = rooms[0];
    //     const roomTypes = await fetchMatchingRoomTypes(adults, children);
    //     matchedRoomTypes = roomTypes
    //       .filter(
    //         (rt: any) => parseInt(rt.available_rooms) >= totalRoomsRequested
    //       )
    //       .map((rt) =>
    //         buildRoomTypeResult(
    //           { single_room_type: rt },
    //           { searchedRooms: rooms[0] }
    //         )
    //       );
    //   } else {
    //     matchedRoomTypes = [];
    //     for (const searchedRoom of rooms) {
    //       const roomTypes = await fetchMatchingRoomTypes(
    //         searchedRoom.adults,
    //         searchedRoom.children
    //       );
    //       roomTypes.forEach((rt: any) => {
    //         if (parseInt(rt.available_rooms) >= 1) {
    //           matchedRoomTypes.push(
    //             buildRoomTypeResult(
    //               { single_room_type: rt },
    //               { searchedRooms: searchedRoom }
    //             )
    //           );
    //         }
    //       });
    //     }
    //   }
    //   return matchedRoomTypes;
    // }
    /*public async searchAvailableRooms({
      hotel_code,
      check_in,
      check_out,
      rooms,
    }: {
      hotel_code: number;
      check_in: string;
      check_out: string;
      rooms: { adults: number; children: number; children_ages?: number[] }[];
    }) {
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
        .withSchema(this.RESERVATION_SCHEMA)
        .select("id", "has_child_rates", "check_in_time", "check_out_time")
        .where("hotel_code", hotel_code)
        .first();
  
      const childRateGroups: IgetChildRateGroups[] =
        accomodationSetting?.has_child_rates
          ? await db("child_rate_groups as crg")
              .withSchema(this.RESERVATION_SCHEMA)
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
          .withSchema(this.RESERVATION_SCHEMA)
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
          .withSchema(this.RESERVATION_SCHEMA)
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
            "rpd.rate_plan_id",
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
  
        // Fetch daily rates
        const dailyRates = await fetchDailyRates(
          single_room_type.room_type_id,
          single_room_type.rate_plan_id,
          check_in,
          check_out,
          hotel_code
        );
  
        // Calculate daily rate list
        const baseRatePerDayList: number[] = [];
        for (let i = 0; i < nights; i++) {
          baseRatePerDayList.push(Number(dailyRates[i]?.rate || baseRate));
        }
  
        const totalBaseRate = baseRatePerDayList.reduce(
          (sum, rate) => sum + rate,
          0
        );
  
        // Extra adult charges
        const extraAdults = Math.max(0, adults - baseOccupancy);
        const extraAdultCharge = extraAdults * extraAdultRate;
  
        // Child charges
        let childCharge = 0;
  
        const shouldApplyChildRate =
          accomodationSetting?.has_child_rates &&
          Array.isArray(searchedRooms.children_ages);
  
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
            ? (totalBaseRate * Number(rateGroup.rate_value)) / 100
            : 0;
        };
  
        if (baseIncludesChildren) {
          const baseChildCount = baseOccupancy - adults;
          const extraChildren = Math.max(0, children - baseChildCount);
  
          if (shouldApplyChildRate && extraChildren > 0) {
            const extraChildAges =
              searchedRooms.children_ages!.slice(baseChildCount);
            for (const age of extraChildAges) {
              childCharge += getRateForAge(age);
            }
          } else {
            childCharge = extraChildren * fallbackExtraChildRate;
          }
        } else {
          if (shouldApplyChildRate && children > 0) {
            for (const age of searchedRooms.children_ages!) {
              childCharge += getRateForAge(age);
            }
          } else {
            childCharge = children * fallbackExtraChildRate;
          }
        }
  
        console.log({ childCharge, totalBaseRate, extraAdultCharge, nights });
  
        const totalPrice =
          totalBaseRate + extraAdultCharge * nights + childCharge * nights;
  
        return {
          ...single_room_type,
          matched_occupancy: searchedRooms,
          daily_rates_used: baseRatePerDayList.some((_, i) => dailyRates[i]), // at least one used
          total_price: totalPrice.toFixed(2),
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
  
      return matchedRoomTypes;
    }
   
    */
    insertRoomBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_booking")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // insert booking rooms
    insertBookingRoom(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // get all room booking
    getAllRoomBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name, from_date, to_date, status, user_id, is_adv_booking, } = payload;
            const dtbs = this.db("room_booking_view as rbv");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate());
            const last24Hours = new Date();
            last24Hours.setDate(last24Hours.getDate() - 1);
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rbv.id", "rbv.booking_no", "bcio.id as check_in_id", "rbv.user_id", "rbv.name", "rbv.photo", "rbv.email", "rbv.phone", "rbv.group_name", "rbv.check_in_time", "rbv.check_out_time", "rbv.number_of_nights", "rbv.total_occupancy", "rbv.extra_charge", "rbv.grand_total", "rbv.no_payment", "rbv.partial_payment", "rbv.full_payment", "rbv.pay_status", "rbv.due", "rbv.room_booking_inv_id", "rbv.reserved_room", "rbv.created_by_id", "rbv.created_by_name", "rbv.status", "rbv.check_in_out_status")
                .where("rbv.hotel_code", hotel_code)
                .leftJoin("booking_check_in_out as bcio", "rbv.id", "bcio.booking_id")
                .andWhere(function () {
                if (name) {
                    this.andWhere("rbv.name", "like", `%${name}%`)
                        .orWhere("rbv.email", "like", `%${name}%`)
                        .orWhere("rbv.phone", "like", `%${name}%`)
                        .orWhereRaw("JSON_EXTRACT(booking_rooms, '$[*].room_number') LIKE ?", [`%${name}%`]);
                }
                if (user_id) {
                    this.andWhere("rbv.user_id", user_id);
                }
                if (is_adv_booking) {
                    this.andWhere("rbv.is_adv_booking", is_adv_booking);
                }
                if (status) {
                    this.andWhere("rbv.status", status);
                }
                if (from_date && to_date) {
                    this.andWhereBetween("rbv.check_in_time", [from_date, endDate]);
                }
                // this.where(function() {
                //   this.where("rbv.check_in_out_status", "checked-in")
                //     .orWhere("rbv.check_in_out_status", "checked-out")
                //     .orWhereNull("rbv.check_in_out_status");
                // })
                // .andWhere(function() {
                //   this.where("rbv.check_out_time", ">=", last24Hours.toISOString())
                //     .orWhere("rbv.check_in_out_status", "checked-in")
                //     .orWhereNull("rbv.check_in_out_status")
                // });
            })
                .orderBy("rbv.id", "desc");
            const total = yield this.db("room_booking_view as rbv")
                .withSchema(this.RESERVATION_SCHEMA)
                .leftJoin("booking_check_in_out as bcio", "rbv.id", "bcio.booking_id")
                .count("rbv.id as total")
                .where("rbv.hotel_code", hotel_code)
                .andWhere(function () {
                if (name) {
                    this.andWhere("rbv.name", "like", `%${name}%`)
                        .orWhere("rbv.email", "like", `%${name}%`)
                        .orWhere("rbv.phone", "like", `%${name}%`)
                        .orWhereRaw("JSON_EXTRACT(booking_rooms, '$[*].room_number') LIKE ?", [`%${name}%`]);
                }
                if (user_id) {
                    this.andWhere("rbv.user_id", user_id);
                }
                if (is_adv_booking) {
                    this.andWhere("rbv.is_adv_booking", is_adv_booking);
                }
                if (status) {
                    this.andWhere("rbv.status", status);
                }
                if (from_date && to_date) {
                    this.andWhereBetween("rbv.check_in_time", [from_date, endDate]);
                }
                // this.where(function() {
                //   this.where("rbv.check_in_out_status", "checked-in")
                //     .orWhere("rbv.check_in_out_status", "checked-out")
                //     .orWhereNull("rbv.check_in_out_status");
                // })
                // .andWhere(function() {
                //   this.where("rbv.check_out_time", ">=", last24Hours.toISOString())
                //     .orWhere("rbv.check_in_out_status", "checked-in")
                //     .orWhereNull("rbv.check_in_out_status")
                // });
            });
            return { data, total: total[0].total };
        });
    }
}
exports.ReservationModel = ReservationModel;
//# sourceMappingURL=reservation.model.js.map