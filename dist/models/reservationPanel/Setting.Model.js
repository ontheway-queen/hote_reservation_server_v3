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
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class SettingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //=================== Room Type  ======================//
    createRoomType(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_types")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllRoomType(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, search, is_active, hotel_code, ids } = payload;
            const dtbs = this.db("room_types as rt");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rt.id", "rt.name", "rt.area", "rtc.name as rt_category_name", "rt.is_active")
                .join("room_type_categories as rtc", "rt.categories_type_id", "rtc.id")
                .where("rt.hotel_code", hotel_code)
                .andWhere("rt.is_deleted", false)
                .andWhere(function () {
                if (search) {
                    this.andWhere("rt.name", "ilike", `%${search}%`);
                }
                if (is_active) {
                    this.andWhere("rt.is_active", is_active);
                }
                if (ids === null || ids === void 0 ? void 0 : ids.length) {
                    this.whereIn("rt.id", ids);
                }
            })
                .orderBy("rt.id", "desc");
            const total = yield this.db("room_types as rt")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("rt.id as total")
                .where("rt.hotel_code", hotel_code)
                .andWhere("rt.is_deleted", false)
                .andWhere(function () {
                if (search) {
                    this.andWhere("rt.name", "ilike", `%${search}%`);
                }
                if (is_active) {
                    this.andWhere("rt.is_active", is_active);
                }
                if (ids === null || ids === void 0 ? void 0 : ids.length) {
                    this.whereIn("rt.id", ids);
                }
            });
            return { total: total[0].total, data };
        });
    }
    getSingleRoomType(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ id, hotel_code });
            return yield this.db("room_types as rt")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rt.id", "rt.name", "rt.area", "rta.rt_amenities", "rtc.name as rt_category_name", "rt.is_active", "rt.description", "rt.area", "rt.is_active", "rt.room_info", "rt.categories_type_id", this.db.raw(`
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'bed_type_id', bt.id,
          'bed_type_name', bt.name,
          'quantity',rtb.quantity
        )) as beds
      `), this.db.raw(`
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'photo_id', rtp.id,
          'photo_url', rtp.photo_url
        )) as photos
      `))
                .join("room_type_categories as rtc", "rt.categories_type_id", "rtc.id")
                .leftJoin("room_type_beds as rtb", "rt.id", "rtb.room_type_id")
                .leftJoin("bed_types as bt", "rtb.bed_type_id", "bt.id")
                .leftJoin("room_type_photos as rtp", "rt.id", "rtp.room_type_id")
                .leftJoin("room_type_amenities as rta", "rt.id", "rta.room_type_id")
                .where("rt.id", id)
                .andWhere("rt.is_deleted", false)
                .andWhere("rt.hotel_code", hotel_code)
                .groupBy("rt.id", "rtc.name", "rta.rt_amenities");
        });
    }
    updateRoomType(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_types")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    deleteRoomType(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_types")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update({ is_deleted: true });
        });
    }
    insertRoomTypePhotos(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_type_photos")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    deletePhotosOfRoomType(room_type_id, photoIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_type_photos")
                .withSchema(this.RESERVATION_SCHEMA)
                .del()
                .whereIn("id", photoIds)
                .andWhere({ room_type_id });
        });
    }
    insertRoomTypeBeds(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_type_beds")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    deleteBedsOfRoomType(room_type_id, bedIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_type_beds")
                .withSchema(this.RESERVATION_SCHEMA)
                .del()
                .whereIn("bed_type_id", bedIds)
                .andWhere({ room_type_id });
        });
    }
    insertRoomTypeAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_type_amenities")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    //=================== Room Type Categories ======================//
    createRoomTypeCategories(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_type_categories")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getAllRoomTypeCategories(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, search, status, hotel_code, exact_match } = payload;
            return yield this.db("room_type_categories as rtc")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where(function () {
                if (search) {
                    this.andWhere("rtc.name", "like", `%${search}%`);
                }
                if (exact_match) {
                    this.andWhereRaw("LOWER(rtc.name) = ?", [exact_match.toLowerCase()]);
                }
                if (status) {
                    this.andWhere("rtc.status", status);
                }
                if (hotel_code) {
                    this.andWhere("rtc.hotel_code", hotel_code);
                }
                this.andWhere("rtc.is_deleted", false);
            })
                .orderBy("id", "desc")
                .limit(limit ? parseInt(limit) : 50)
                .offset(skip ? parseInt(skip) : 0);
        });
    }
    getSingleRoomTypeCategories(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_type_categories")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ id, hotel_code })
                .first();
        });
    }
    updateRoomTypeCategories(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_type_categories")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    deleteRoomTypeCategories(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_type_categories")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .del();
        });
    }
    //=================== Bed Type  ======================//
    // create bed type
    createBedType(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(payload);
            return yield this.db("bed_types")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All bed type
    getAllBedType(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, search, status, bedIds } = payload;
            const dtbs = this.db("bed_types");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "name", "width", "height", "status")
                .where(function () {
                this.andWhere("hotel_code", hotel_code);
                this.andWhere("is_deleted", false);
                if (search) {
                    this.andWhere("name", "ilike", `%${search}%`);
                }
                if (status) {
                    this.andWhere("status", status);
                }
                if (bedIds) {
                    this.whereIn("id", bedIds);
                }
            })
                .orderBy("id", "desc");
            return { data };
        });
    }
    // Update Bed Type
    updateBedType(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db("bed_types")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    //=================== Room Type Amenities  ======================//
    getAllRoomTypeAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, search, status, rt_ids } = payload;
            const dtbs = this.db("amenities_head as rtah");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rtah.id", "rtah.name", this.db.raw(`
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', rta.id,
          'name', rta.name,
          'icon',rta.icon

        )
        ORDER BY rta.id DESC
      ) AS amenities
    `))
                .leftJoin("amenities as rta", "rtah.id", "rta.rtahead_id")
                .where(function () {
                this.andWhere("rtah.is_deleted", false);
                this.andWhere("rta.is_deleted", false);
                if (search) {
                    this.andWhere("rta.name", "like", `%${search}%`);
                }
                if (status) {
                    this.andWhere("rta.status", status);
                }
                if (rt_ids) {
                    this.whereIn("rtah.id", rt_ids);
                }
            })
                .groupBy("rtah.id", "rtah.name", "rtah.icon", "rtah.status")
                .orderBy("rtah.id", "asc");
            return { data };
        });
    }
    // ------------------------- Accomodation setting ---------------------//
    insertAccomodationSetting(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("accommodation_settings")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateAccomodationSetting(hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("accommodation_settings")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ hotel_code });
        });
    }
    insertChildAgePolicies(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("child_age_policies")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAccomodation(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("accommodation_settings as acs")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("acs.id", "acs.check_in_time", "acs.check_out_time", this.db.raw(`
          COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', cap.id,
              'age_from', cap.age_from,
              'age_to', cap.age_to,
              'charge_type', cap.charge_type,
              'charge_value',cap.charge_value
            )
               ) FILTER (WHERE cap.id IS NOT NULL),
          '[]'
          ) AS child_age_policies
        `))
                .leftJoin("child_age_policies as cap", "acs.id", "cap.acs_id")
                .groupBy("acs.id")
                .where("acs.hotel_code", hotel_code);
        });
    }
    // delete child age policies
    deleteChildAgePolicies(hotel_code, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("child_age_policies")
                .withSchema(this.RESERVATION_SCHEMA)
                .del()
                .whereIn("id", ids)
                .andWhere("hotel_code", hotel_code);
        });
    }
    //----------------------- Cancellation Policy ------------------//
    insertCancellationPolicy(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_policies")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateCancellationPolicy(hotel_code, id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_policies")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ hotel_code })
                .andWhere({ id });
        });
    }
    getAllCancellationPolicy({ hotel_code, search, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_policies as cp")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("cp.id", "cp.policy_name", "cp.description")
                .where("cp.hotel_code", hotel_code)
                .modify(function (queryBuilder) {
                if (search) {
                    queryBuilder.andWhere("cp.policy_name", "ilike", `%${search}%`);
                }
            })
                .andWhere("is_deleted", false)
                .groupBy("cp.id", "cp.policy_name", "cp.description");
        });
    }
    insertCancellationPolicyRules(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_policy_rules")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    deleteCancellationPolicyRules(cancellation_policy_id, rules_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_policy_rules")
                .withSchema(this.RESERVATION_SCHEMA)
                .del()
                .where({ cancellation_policy_id })
                .whereIn("id", rules_id);
        });
    }
    getSingleCancellationPolicy(hotel_code, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("cancellation_policies as cp")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("cp.id", "cp.policy_name", "cp.description", this.db.raw(`
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', cpr.id,
              'days_before', cpr.days_before,
              'rule_type', cpr.rule_type,
              'fee_type', cpr.fee_type,
              'fee_value', cpr.fee_value
            )
          ) FILTER (WHERE cpr.id IS NOT NULL),
          '[]'
        ) AS policy_rules
      `))
                .leftJoin("cancellation_policy_rules as cpr", "cp.id", "cpr.cancellation_policy_id")
                .where("cp.hotel_code", hotel_code)
                .andWhere("is_deleted", false)
                .andWhere("cp.id", id)
                .groupBy("cp.id", "cp.policy_name", "cp.description");
        });
    }
    // -------------- meals ----------------------//
    insertMealsOptions(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("meals")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getMealOptions(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("meals")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "is_possible_book_meal_opt_with_room")
                .first()
                .where({ hotel_code });
        });
    }
    updateMealOption(hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("meals")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ hotel_code });
        });
    }
    insertMealItems(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("meal_plan_items")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    updateMealItems(payload, hotel_code, meal_plan_ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("meal_plan_items")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .andWhere({ hotel_code })
                .where(function () {
                if (meal_plan_ids) {
                    this.whereIn("meal_plan_id", meal_plan_ids);
                }
            });
        });
    }
    getAllMealPlan({ ids }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("meal_plans")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "name")
                .orderBy("name", "asc")
                .where(function () {
                if (ids === null || ids === void 0 ? void 0 : ids.length) {
                    this.whereIn("id", ids);
                }
            });
        });
    }
    getAllSources({ ids }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("sources")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .groupBy("id")
                .where(function () {
                if (ids === null || ids === void 0 ? void 0 : ids.length) {
                    this.whereIn("id", ids);
                }
            });
        });
    }
    getChildAgePolicies(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("child_age_policies as cap")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("cap.age_from", "cap.age_to", "cap.charge_type")
                .leftJoin("accommodation_settings as acs", "acs.id", "cap.acs_id")
                .where("cap.hotel_code", hotel_code);
        });
    }
    // ------------------ room rate ---------------------//
    insertInRatePlans(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rate_plans")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateInRatePlans(payload, rate_plan_id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rate_plans")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id: rate_plan_id })
                .andWhere({ hotel_code });
        });
    }
    getAllRoomRate({ hotel_code, search, exact_name, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("rate_plans as rp")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rp.id", "rp.name", "rp.status", this.db.raw(`COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'meal_mapping_id', rpm.id,
              'plan_name', mp.name
            )) FILTER (WHERE rpm.id IS NOT NULL),
            '[]'
          ) AS meals`), this.db.raw(`COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'src_mapping_id', rps.id,
              'source_name', src.name
            )) FILTER (WHERE rps.id IS NOT NULL),
            '[]'
          ) AS sources`))
                .leftJoin("rate_plan_meal_mappings as rpm", "rp.id", "rpm.rate_plan_id")
                .leftJoin("meal_plans as mp", "rpm.meal_plan_id", "mp.id")
                .leftJoin("rate_plan_source_mappings as rps", "rp.id", "rps.rate_plan_id")
                .leftJoin("sources as src", "rps.source_id", "src.id")
                .where("rp.hotel_code", hotel_code)
                .andWhere(function () {
                if (search) {
                    this.andWhere("rp.name", "ilike", `%${search}%`);
                }
                if (exact_name) {
                    this.andWhere("LOWER(rp.name) = ?", [exact_name]);
                }
            })
                .groupBy("rp.id", "rp.name", "rp.status");
            const total = yield this.db("rate_plans")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .where("hotel_code", hotel_code);
            return { data, total: total[0].total };
        });
    }
    getSingleRoomRate(hotel_code, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rate_plans as rp")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rp.id", "rp.name", "rp.status", "cp.id as cancellation_policy_id", "cp.policy_name as cancellation_policy_name", this.db.raw(`
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'meal_mapping_id', rpm.id,
              'meal_plan_id', mp.id,
              'plan_name', mp.name
            )) FILTER (WHERE rpm.id IS NOT NULL),
            '[]'
          ) AS meals
        `), this.db.raw(`
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'src_mapping_id', rps.id,
              'src_id', src.id,
              'source_name', src.name
            )) FILTER (WHERE rps.id IS NOT NULL),
            '[]'
          ) AS sources
        `), this.db.raw(`
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'id', rpd.id,
              'room_type_id', rpd.room_type_id,
              'room_type_name', rt.name,
              'base_rate', rpd.base_rate

            )) FILTER (WHERE rpd.id IS NOT NULL),
            '[]'
          ) AS rate_plan_details
        `))
                .leftJoin("cancellation_policies as cp", "rp.cancellation_policy_id", "cp.id")
                .leftJoin("rate_plan_meal_mappings as rpm", "rp.id", "rpm.rate_plan_id")
                .leftJoin("meal_plans as mp", "rpm.meal_plan_id", "mp.id")
                .leftJoin("rate_plan_source_mappings as rps", "rp.id", "rps.rate_plan_id")
                .leftJoin("sources as src", "rps.source_id", "src.id")
                .leftJoin("rate_plan_details as rpd", "rp.id", "rpd.rate_plan_id")
                .leftJoin("room_types as rt", "rpd.room_type_id", "rt.id")
                .where("rp.hotel_code", hotel_code)
                .andWhere("rp.id", id)
                .groupBy("rp.id", "cp.id")
                .first();
        });
    }
    insertInRatePlanDetails(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rate_plan_details")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    insertInChildRateGroups(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("child_rate_groups")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    deleteInChildRateGroups(rate_plan_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("child_rate_groups")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ rate_plan_id })
                .del();
        });
    }
    deleteInRatePlanDetails(rate_plan_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rate_plan_details")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ rate_plan_id })
                .del();
        });
    }
    deleteInRatePlanDailyRates(rate_plan_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("daily_rates")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ rate_plan_id })
                .del();
        });
    }
    insertInRatePlanMealMapping(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rate_plan_meal_mappings")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    deleteInRatePlanMealMapping(rate_plan_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rate_plan_meal_mappings")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ rate_plan_id })
                .del();
        });
    }
    insertInRatePlanSourceMapping(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rate_plan_source_mappings")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    deleteInRatePlanSourceMapping(rate_plan_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rate_plan_source_mappings")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ rate_plan_id })
                .del();
        });
    }
    insertInDailyRates(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("daily_rates")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    //=================== Bank Name  ======================//
    // create Bank Name
    createBankName(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bank_name")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Bank Name
    getAllBankName(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name } = payload;
            const dtbs = this.db("bank_name as bn");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("bn.id", "bn.name as bank_name")
                .where("bn.hotel_code", hotel_code)
                .whereNull("bn.hotel_code")
                .andWhere(function () {
                if (name) {
                    this.andWhere("bn.name", "like", `%${name}%`);
                }
            })
                .orderBy("bn.id", "desc");
            const total = yield this.db("bank_name as bn")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("bn.id as total")
                .where("bn.hotel_code", hotel_code)
                .whereNull("bn.hotel_code")
                .andWhere(function () {
                if (name) {
                    this.andWhere("bn.name", "like", `%${name}%`);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Bank Name
    updateBankName(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bank_name")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    // Delete Bank Name
    deleteBankName(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bank_name")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .del();
        });
    }
    //=================== Designation Model  ======================//
    // create  Designation Model
    createDesignation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("designation")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All designation
    getAllDesignation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name, status, excludeId } = payload;
            const dtbs = this.db("designation as de");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("de.id", "de.hotel_code", "de.name as designation_name", "de.status", "de.is_deleted", "de.created_by as created_by_id", "ua.name as created_by_name")
                .leftJoin("user_admin as ua", "de.created_by", "ua.id")
                .where(function () {
                this.whereNull("de.hotel_code").orWhere("de.hotel_code", hotel_code);
            })
                .andWhere("de.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhere("de.name", "ilike", `%${name}%`);
                }
                if (status) {
                    this.andWhere("de.status", status);
                }
                if (excludeId) {
                    this.andWhere("de.id", "!=", excludeId);
                }
            })
                .orderBy("de.id", "desc");
            const total = yield this.db("designation as de")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("de.id as total")
                .where(function () {
                this.whereNull("de.hotel_code").orWhere("de.hotel_code", hotel_code);
            })
                .andWhere("de.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhere("de.name", "ilike", `%${name}%`);
                }
                if (status) {
                    this.andWhere("de.status", status);
                }
                if (excludeId) {
                    this.andWhere("de.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Designation
    updateDesignation(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("designation")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    // Delete designation
    deleteDesignation(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("designation")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update({ is_deleted: true });
        });
    }
    //=================== Department Model  ======================//
    // create Department
    createDepartment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("department")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Department
    getAllDepartment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name, status, excludeId } = payload;
            const dtbs = this.db("department as d");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("d.id", "d.hotel_code", "d.name as department_name", "d.status", "d.is_deleted", "d.created_by as created_by_id", "ua.name as created_by_name")
                .leftJoin("user_admin as ua", "d.created_by", "ua.id")
                .where(function () {
                this.whereNull("d.hotel_code").orWhere("d.hotel_code", hotel_code);
            })
                .andWhere("d.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhere("d.name", "ilike", `%${name}%`);
                }
                if (status) {
                    this.andWhere("d.status", status);
                }
                if (excludeId) {
                    this.andWhere("d.id", "!=", excludeId);
                }
            })
                .orderBy("d.id", "desc");
            const total = yield this.db("department as d")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("d.id as total")
                .where(function () {
                this.whereNull("d.hotel_code").orWhere("d.hotel_code", hotel_code);
            })
                .andWhere("d.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhere("d.name", "ilike", `%${name}%`);
                }
                if (status) {
                    this.andWhere("d.status", status);
                }
                if (excludeId) {
                    this.andWhere("d.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Get Single Department
    getSingleDepartment(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("department as d")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("d.id", "d.hotel_code", "d.name", "d.status", "d.is_deleted", "ua.id as created_by_id", "ua.name as created_by_name")
                .leftJoin("user_admin as ua", "d.created_by", "ua.id")
                .where("d.id", id)
                .andWhere("d.hotel_code", hotel_code)
                .andWhere("d.is_deleted", false)
                .first();
        });
    }
    // Update Department
    updateDepartment(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("department")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    // Delete Department
    deleteDepartment(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("department")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update({ is_deleted: true });
        });
    }
    //=================== Hall Amenities  ======================//
    // create Hall Amenities
    createHallAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_amenities")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Hall Amenities
    getAllHallAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name, status, excludeId } = payload;
            const dtbs = this.db("hall_amenities as ha");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("ha.id", "ha.hotel_code", "ha.name", "ha.description", "ha.status")
                .where(function () {
                this.whereNull("ha.hotel_code").orWhere("ha.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("ha.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("ha.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("ha.id", "!=", excludeId);
                }
            })
                .orderBy("ha.id", "desc");
            const total = yield this.db("hall_amenities as ha")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("ha.id as total")
                .where(function () {
                this.whereNull("ha.hotel_code").orWhere("ha.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("ha.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("ha.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("ha.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Hall Amenities
    updateHallAmenities(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_amenities")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    // Delete Hall Amenities
    deleteHallAmenities(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_amenities")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .del();
        });
    }
    //=================== Payroll Months ======================//
    // create  Payroll Months
    createPayrollMonths(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll_months")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All PayrollMonths
    getPayrollMonths(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name, month_id } = payload;
            let dtbs = this.db("payroll_months as pm").withSchema(this.RESERVATION_SCHEMA);
            if (limit && skip) {
                dtbs = dtbs.limit(parseInt(limit));
                dtbs = dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("pm.id", "months.name as month_name", "pm.days as working_days", "pm.hours", "pm.is_deleted")
                .joinRaw(`JOIN ?? as months ON months.id = pm.month_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.months}`,
            ])
                .where("pm.hotel_code", hotel_code)
                .andWhere("pm.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhereRaw("months.name::text ILIKE ?", [`%${name}%`]);
                }
                if (month_id) {
                    this.andWhere("months.id", month_id);
                }
            })
                .orderBy("pm.id", "asc");
            // New query builder for count
            let countQuery = this.db("payroll_months as pm").withSchema(this.RESERVATION_SCHEMA);
            const totalResult = yield countQuery
                .count("pm.id as total")
                .joinRaw(`JOIN ?? as months ON months.id = pm.month_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.months}`,
            ])
                .where("pm.hotel_code", hotel_code)
                .andWhere("pm.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhereRaw("months.name::text ILIKE ?", [`%${name}%`]);
                }
                if (month_id) {
                    this.andWhere("months.id", month_id);
                }
            });
            const total = totalResult[0].total;
            return { total, data };
        });
    }
    // Update Payroll Months
    updatePayrollMonths(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll_months")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .andWhere("is_deleted", false)
                .update(payload);
        });
    }
    // Delete Payroll Months
    deletePayrollMonths(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll_months")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .andWhere("is_deleted", false)
                .update({ is_deleted: true });
        });
    }
    // =================== floor Model ======================//
    createFloor(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("floors")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllFloors(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, search, status } = payload;
            const dtbs = this.db("floors");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "hotel_code", "floor_no")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (search) {
                    this.andWhere("floor_no", search);
                }
                this.andWhere("is_deleted", false);
                if (status) {
                    this.andWhere("status", status);
                }
            })
                .orderBy("id", "asc");
            return { data };
        });
    }
    getSingleFloor(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("floors")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "hotel_code", "floor_no")
                .where({ id, hotel_code })
                .andWhere("is_deleted", false)
                .first();
        });
    }
    updateFloor(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("floors")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    deleteFloor(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("floors")
                .withSchema(this.RESERVATION_SCHEMA)
                .update({ is_deleted: true })
                .where({ id, hotel_code });
        });
    }
    // ===================== building Model ======================//
    createBuilding(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("buildings")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllBuildings(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, search, status } = payload;
            const dtbs = this.db("buildings");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "hotel_code", "building_no", "description")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (search) {
                    this.andWhere("building_no", search);
                }
                this.andWhere("is_deleted", false);
                if (status) {
                    this.andWhere("status", status);
                }
            })
                .orderBy("id", "asc");
            return { data };
        });
    }
    getSingleBuilding(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("buildings")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "hotel_code", "building_no", "description")
                .where({ id, hotel_code })
                .andWhere("is_deleted", false)
                .first();
        });
    }
    updateBuilding(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("buildings")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    deleteBuilding(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("buildings")
                .withSchema(this.RESERVATION_SCHEMA)
                .update({ is_deleted: true })
                .where({ id, hotel_code });
        });
    }
}
exports.default = SettingModel;
//# sourceMappingURL=Setting.Model.js.map