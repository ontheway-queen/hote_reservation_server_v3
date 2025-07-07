import {
	ICreateBankNamePayload,
	ICreatedepartment,
	ICreatedesignation,
	ICreateHallAmenitiesPayload,
	ICreatePayrollMonths,
	ICreateRoomTypePayload,
	IUpdateBankName,
	IUpdateBedTypePayload,
	IUpdatedepartment,
	IUpdatedesignation,
	IUpdateHallAmenitiesPayload,
	IUpdatePayrollMonths,
	IUpdateRoomTypePayload,
} from "../../appAdmin/utlis/interfaces/setting.interface";

import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class SettingModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	//=================== Room Type  ======================//

	public async createRoomType(payload: ICreateRoomTypePayload) {
		return await this.db("room_types")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	public async getAllRoomType(payload: {
		limit?: string;
		skip?: string;
		is_active?: string;
		ids?: number[];
		search?: string;
		hotel_code: number;
	}) {
		const { limit, skip, search, is_active, hotel_code, ids } = payload;

		const dtbs = this.db("room_types as rt");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"rt.id",
				"rt.name",
				"rt.area",
				"rtc.name as rt_category_name",
				"rt.is_active"
			)
			.join(
				"room_type_categories as rtc",
				"rt.categories_type_id",
				"rtc.id"
			)
			.where("rt.hotel_code", hotel_code)
			.andWhere("rt.is_deleted", false)
			.andWhere(function () {
				if (search) {
					this.andWhere("rt.name", "ilike", `%${search}%`);
				}
				if (is_active) {
					this.andWhere("rt.is_active", is_active);
				}
				if (ids?.length) {
					this.whereIn("rt.id", ids);
				}
			})

			.orderBy("rt.id", "desc");

		const total = await this.db("room_types as rt")
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
				if (ids?.length) {
					this.whereIn("rt.id", ids);
				}
			});

		return { total: total[0].total, data };
	}

	public async getSingleRoomType(
		id: number,
		hotel_code: number
	): Promise<
		{
			id: number;
			name: string;
			area: string;
			rt_amenities: any;
			rt_category_name: string;
			is_active: boolean;
			description: string;
			room_info: any;
			categories_type_id: number;
			beds: {
				bed_type_id: number;
				bed_type_name: string;
				quantity: number;
			}[];
			photos: {
				photo_id: number;
				photo_url: string;
			}[];
		}[]
	> {
		console.log({ id, hotel_code });
		return await this.db("room_types as rt")
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"rt.id",
				"rt.name",
				"rt.area",
				"rta.rt_amenities",
				"rtc.name as rt_category_name",
				"rt.is_active",
				"rt.description",
				"rt.area",
				"rt.is_active",
				"rt.room_info",
				"rt.categories_type_id",
				this.db.raw(`
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'bed_type_id', bt.id,
          'bed_type_name', bt.name,
          'quantity',rtb.quantity
        )) as beds
      `),
				this.db.raw(`
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'photo_id', rtp.id,
          'photo_url', rtp.photo_url
        )) as photos
      `)
			)
			.join(
				"room_type_categories as rtc",
				"rt.categories_type_id",
				"rtc.id"
			)
			.leftJoin("room_type_beds as rtb", "rt.id", "rtb.room_type_id")
			.leftJoin("bed_types as bt", "rtb.bed_type_id", "bt.id")
			.leftJoin("room_type_photos as rtp", "rt.id", "rtp.room_type_id")
			.leftJoin("room_type_amenities as rta", "rt.id", "rta.room_type_id")
			.where("rt.id", id)
			.andWhere("rt.is_deleted", false)
			.andWhere("rt.hotel_code", hotel_code)
			.groupBy("rt.id", "rtc.name", "rta.rt_amenities");
	}

	public async updateRoomType(
		id: number,
		hotel_code: number,
		payload: IUpdateRoomTypePayload
	) {
		return await this.db("room_types")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.update(payload);
	}

	public async deleteRoomType(id: number, hotel_code: number) {
		return await this.db("room_types")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.update({ is_deleted: true });
	}

	public async insertRoomTypePhotos(
		payload: {
			hotel_code: number;
			room_type_id: number;
			photo_url: string;
		}[]
	) {
		return await this.db("room_type_photos")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	public async deletePhotosOfRoomType(
		room_type_id: number,
		photoIds: number[]
	) {
		return await this.db("room_type_photos")
			.withSchema(this.RESERVATION_SCHEMA)
			.del()
			.whereIn("id", photoIds)
			.andWhere({ room_type_id });
	}

	public async insertRoomTypeBeds(
		payload: {
			quantity: number;
			room_type_id: number;
			bed_type_id: number;
		}[]
	) {
		return await this.db("room_type_beds")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	public async deleteBedsOfRoomType(room_type_id: number, bedIds: number[]) {
		return await this.db("room_type_beds")
			.withSchema(this.RESERVATION_SCHEMA)
			.del()
			.whereIn("bed_type_id", bedIds)
			.andWhere({ room_type_id });
	}

	public async insertRoomTypeAmenities(payload: {
		hotel_code: number;
		room_type_id: number;
		rt_amenities: string;
	}) {
		return await this.db("room_type_amenities")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	//=================== Room Type Categories ======================//

	public async createRoomTypeCategories(payload: {
		name: string;
		hotel_code: number;
	}) {
		return await this.db("room_type_categories")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	public async getAllRoomTypeCategories(payload: {
		limit?: string;
		skip?: string;
		status?: string;
		search?: string;
		exact_match?: string;
		hotel_code: number;
		is_deleted?: boolean;
	}) {
		const { limit, skip, search, status, hotel_code, exact_match } =
			payload;

		return await this.db("room_type_categories as rtc")
			.withSchema(this.RESERVATION_SCHEMA)
			.select("*")
			.where(function () {
				if (search) {
					this.andWhere("rtc.name", "like", `%${search}%`);
				}
				if (exact_match) {
					this.andWhereRaw("LOWER(rtc.name) = ?", [
						exact_match.toLowerCase(),
					]);
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
	}

	public async getSingleRoomTypeCategories(id: number, hotel_code: number) {
		return await this.db("room_type_categories")
			.withSchema(this.RESERVATION_SCHEMA)
			.select("*")
			.where({ id, hotel_code })
			.first();
	}

	public async updateRoomTypeCategories(
		id: number,
		hotel_code: number,
		payload: { name?: string; status?: boolean; is_deleted?: boolean }
	) {
		return await this.db("room_type_categories")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.update(payload);
	}

	public async deleteRoomTypeCategories(id: number, hotel_code: number) {
		return await this.db("room_type_categories")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.del();
	}

	//=================== Bed Type  ======================//

	// create bed type
	public async createBedType(payload: {
		hotel_code: number;
		name: string;
		width: number;
		height: number;
	}) {
		console.log(payload);
		return await this.db("bed_types")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	// Get All bed type
	public async getAllBedType(payload: {
		limit?: string;
		skip?: string;
		status?: string;
		search?: string;
		hotel_code: number;
		bedIds?: number[];
	}) {
		const { limit, skip, hotel_code, search, status, bedIds } = payload;

		const dtbs = this.db("bed_types");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
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
	}

	// Update Bed Type
	public async updateBedType(
		id: number,
		hotel_code: number,
		payload: Partial<IUpdateBedTypePayload>
	) {
		return this.db("bed_types")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.update(payload);
	}

	//=================== Room Type Amenities  ======================//

	public async getAllRoomTypeAmenities(payload: {
		limit?: string;
		skip?: string;
		status?: string;
		search?: string;
		hotel_code?: number;
		rt_ids?: number[];
	}) {
		const { limit, skip, search, status, rt_ids } = payload;

		const dtbs = this.db("amenities_head as rtah");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"rtah.id",
				"rtah.name",
				this.db.raw(`
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', rta.id,
          'name', rta.name,
          'icon',rta.icon

        )
        ORDER BY rta.id DESC
      ) AS amenities
    `)
			)
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
	}

	// ------------------------- Accomodation setting ---------------------//

	public async insertAccomodationSetting(payload: {
		check_in_time: string;
		check_out_time: string;
		hotel_code: number;
	}) {
		return await this.db("accommodation_settings")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	public async updateAccomodationSetting(
		hotel_code: number,
		payload: {
			check_in_time: string;
			check_out_time: string;
		}
	) {
		return await this.db("accommodation_settings")
			.withSchema(this.RESERVATION_SCHEMA)
			.update(payload)
			.where({ hotel_code });
	}

	public async insertChildAgePolicies(
		payload: {
			hotel_code: number;
			age_from: number;
			age_to: number;
			charge_type: "fixed" | "free" | "percentage" | "same_as_adult";
			charge_value: number;
			acs_id: number;
		}[]
	) {
		return await this.db("child_age_policies")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	public async getAccomodation(hotel_code: number) {
		return await this.db("accommodation_settings as acs")
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"acs.id",
				"acs.check_in_time",
				"acs.check_out_time",
				this.db.raw(`
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
        `)
			)
			.leftJoin("child_age_policies as cap", "acs.id", "cap.acs_id")
			.groupBy("acs.id")
			.where("acs.hotel_code", hotel_code);
	}

	// delete child age policies
	public async deleteChildAgePolicies(hotel_code: number, ids: number[]) {
		return await this.db("child_age_policies")
			.withSchema(this.RESERVATION_SCHEMA)
			.del()
			.whereIn("id", ids)
			.andWhere("hotel_code", hotel_code);
	}

	//----------------------- Cancellation Policy ------------------//

	public async insertCancellationPolicy(payload: {
		policy_name: string;
		description: string;
		hotel_code: number;
	}) {
		return await this.db("cancellation_policies")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	public async updateCancellationPolicy(
		hotel_code: number,
		id: number,
		payload: {
			policy_name?: string;
			description?: string;
			is_deleted?: boolean;
		}
	) {
		return await this.db("cancellation_policies")
			.withSchema(this.RESERVATION_SCHEMA)
			.update(payload)
			.where({ hotel_code })
			.andWhere({ id });
	}

	public async getAllCancellationPolicy({
		hotel_code,
		search,
	}: {
		hotel_code: number;
		search?: string;
	}) {
		return await this.db("cancellation_policies as cp")
			.withSchema(this.RESERVATION_SCHEMA)
			.select("cp.id", "cp.policy_name", "cp.description")
			.where("cp.hotel_code", hotel_code)
			.modify(function (queryBuilder) {
				if (search) {
					queryBuilder.andWhere(
						"cp.policy_name",
						"ilike",
						`%${search}%`
					);
				}
			})
			.andWhere("is_deleted", false)
			.groupBy("cp.id", "cp.policy_name", "cp.description");
	}

	public async insertCancellationPolicyRules(
		payload: {
			cancellation_policy_id: number;
			days_before: number;
			rule_type: "free" | "charge" | "no_show";
			fee_type: "fixed" | "percentage";
			fee_value: number;
		}[]
	) {
		return await this.db("cancellation_policy_rules")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	public async deleteCancellationPolicyRules(
		cancellation_policy_id: number,
		rules_id: number[]
	) {
		return await this.db("cancellation_policy_rules")
			.withSchema(this.RESERVATION_SCHEMA)
			.del()
			.where({ cancellation_policy_id })
			.whereIn("id", rules_id);
	}

	public async getSingleCancellationPolicy(hotel_code: number, id: number) {
		return await this.db("cancellation_policies as cp")
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"cp.id",
				"cp.policy_name",
				"cp.description",
				this.db.raw(`
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
      `)
			)
			.leftJoin(
				"cancellation_policy_rules as cpr",
				"cp.id",
				"cpr.cancellation_policy_id"
			)
			.where("cp.hotel_code", hotel_code)
			.andWhere("is_deleted", false)
			.andWhere("cp.id", id)
			.groupBy("cp.id", "cp.policy_name", "cp.description");
	}

	// -------------- meals ----------------------//

	public async insertMealsOptions(payload: {
		hotel_code: number;
		is_possible_book_meal_opt_with_room: boolean;
	}) {
		return await this.db("meals")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	public async getMealOptions(hotel_code: number) {
		return await this.db("meals")
			.withSchema(this.RESERVATION_SCHEMA)
			.select("id", "is_possible_book_meal_opt_with_room")
			.first()
			.where({ hotel_code });
	}

	public async updateMealOption(
		hotel_code: number,
		payload: {
			is_possible_book_meal_opt_with_room: boolean;
		}
	) {
		return await this.db("meals")
			.withSchema(this.RESERVATION_SCHEMA)
			.update(payload)
			.where({ hotel_code });
	}

	public async insertMealItems(
		payload: {
			hotel_code: number;
			meal_plan_id: number;
			price: number;
			vat: number;
		}[]
	) {
		return await this.db("meal_plan_items")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	public async updateMealItems(
		payload: { is_deleted?: boolean; price?: number; vat?: number },
		hotel_code: number,
		meal_plan_ids?: number[]
	) {
		return await this.db("meal_plan_items")
			.withSchema(this.RESERVATION_SCHEMA)
			.update(payload)
			.andWhere({ hotel_code })
			.where(function () {
				if (meal_plan_ids) {
					this.whereIn("meal_plan_id", meal_plan_ids);
				}
			});
	}

	public async getAllMealPlan({ ids }: { ids?: number[] }) {
		return await this.db("meal_plans")
			.withSchema(this.RESERVATION_SCHEMA)
			.select("id", "name")
			.orderBy("name", "asc")
			.where(function () {
				if (ids?.length) {
					this.whereIn("id", ids);
				}
			});
	}

	public async getAllSources({ ids }: { ids?: number[] }) {
		return await this.db("sources")
			.withSchema(this.RESERVATION_SCHEMA)
			.select("*")
			.groupBy("id")
			.where(function () {
				if (ids?.length) {
					this.whereIn("id", ids);
				}
			});
	}

	public async getChildAgePolicies(hotel_code: number) {
		return await this.db("child_age_policies as cap")
			.withSchema(this.RESERVATION_SCHEMA)
			.select("cap.age_from", "cap.age_to", "cap.charge_type")
			.leftJoin("accommodation_settings as acs", "acs.id", "cap.acs_id")
			.where("cap.hotel_code", hotel_code);
	}

	// ------------------ room rate ---------------------//
	public async insertInRatePlans(payload: {
		hotel_code: number;
		cancellation_policy_id: number;
		name: string;
	}) {
		return await this.db("rate_plans")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	public async updateInRatePlans(
		payload: {
			cancellation_policy_id: number;
			name: string;
		},
		rate_plan_id: number,
		hotel_code: number
	) {
		return await this.db("rate_plans")
			.withSchema(this.RESERVATION_SCHEMA)
			.update(payload)
			.where({ id: rate_plan_id })
			.andWhere({ hotel_code });
	}

	public async getAllRoomRate({
		hotel_code,
		search,
		exact_name,
	}: {
		hotel_code: number;
		search?: string;
		exact_name?: string;
	}) {
		const data = await this.db("rate_plans as rp")
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"rp.id",
				"rp.name",
				"rp.status",
				this.db.raw(
					`COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'meal_mapping_id', rpm.id,
              'plan_name', mp.name
            )) FILTER (WHERE rpm.id IS NOT NULL),
            '[]'
          ) AS meals`
				),
				this.db.raw(
					`COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'src_mapping_id', rps.id,
              'source_name', src.name
            )) FILTER (WHERE rps.id IS NOT NULL),
            '[]'
          ) AS sources`
				)
			)
			.leftJoin(
				"rate_plan_meal_mappings as rpm",
				"rp.id",
				"rpm.rate_plan_id"
			)
			.leftJoin("meal_plans as mp", "rpm.meal_plan_id", "mp.id")
			.leftJoin(
				"rate_plan_source_mappings as rps",
				"rp.id",
				"rps.rate_plan_id"
			)
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

		const total = await this.db("rate_plans")
			.withSchema(this.RESERVATION_SCHEMA)
			.count("id as total")
			.where("hotel_code", hotel_code);

		return { data, total: total[0].total };
	}

	public async getSingleRoomRate(hotel_code: number, id: number) {
		return await this.db("rate_plans as rp")
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"rp.id",
				"rp.name",
				"rp.status",
				"cp.id as cancellation_policy_id",
				"cp.policy_name as cancellation_policy_name",

				this.db.raw(`
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'meal_mapping_id', rpm.id,
              'meal_plan_id', mp.id,
              'plan_name', mp.name
            )) FILTER (WHERE rpm.id IS NOT NULL),
            '[]'
          ) AS meals
        `),
				this.db.raw(`
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'src_mapping_id', rps.id,
              'src_id', src.id,
              'source_name', src.name
            )) FILTER (WHERE rps.id IS NOT NULL),
            '[]'
          ) AS sources
        `),

				this.db.raw(`
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'id', rpd.id,
              'room_type_id', rpd.room_type_id,
              'room_type_name', rt.name,
              'base_rate', rpd.base_rate

            )) FILTER (WHERE rpd.id IS NOT NULL),
            '[]'
          ) AS rate_plan_details
        `)
			)
			.leftJoin(
				"cancellation_policies as cp",
				"rp.cancellation_policy_id",
				"cp.id"
			)
			.leftJoin(
				"rate_plan_meal_mappings as rpm",
				"rp.id",
				"rpm.rate_plan_id"
			)
			.leftJoin("meal_plans as mp", "rpm.meal_plan_id", "mp.id")
			.leftJoin(
				"rate_plan_source_mappings as rps",
				"rp.id",
				"rps.rate_plan_id"
			)
			.leftJoin("sources as src", "rps.source_id", "src.id")
			.leftJoin("rate_plan_details as rpd", "rp.id", "rpd.rate_plan_id")
			.leftJoin("room_types as rt", "rpd.room_type_id", "rt.id")
			.where("rp.hotel_code", hotel_code)
			.andWhere("rp.id", id)
			.groupBy("rp.id", "cp.id")
			.first();
	}

	public async insertInRatePlanDetails(
		payload: {
			hotel_code: number;
			rate_plan_id: number;
			room_type_id: number;
			base_rate: number;
		}[]
	) {
		return await this.db("rate_plan_details")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	public async insertInChildRateGroups(
		payload: {
			hotel_code: number;
			rate_plan_id: number;
			room_type_id: number;
			age_from: number;
			age_to: number;
			rate_type: "free" | "fixed" | "percentage" | "same_as_adult";
			rate_value: number;
		}[]
	) {
		return await this.db("child_rate_groups")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	public async deleteInChildRateGroups(rate_plan_id: number) {
		return await this.db("child_rate_groups")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ rate_plan_id })
			.del();
	}

	public async deleteInRatePlanDetails(rate_plan_id: number) {
		return await this.db("rate_plan_details")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ rate_plan_id })
			.del();
	}

	public async deleteInRatePlanDailyRates(rate_plan_id: number) {
		return await this.db("daily_rates")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ rate_plan_id })
			.del();
	}

	public async insertInRatePlanMealMapping(
		payload: {
			rate_plan_id: number;
			meal_plan_id: number;
			included: boolean;
		}[]
	) {
		return await this.db("rate_plan_meal_mappings")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	public async deleteInRatePlanMealMapping(rate_plan_id: number) {
		return await this.db("rate_plan_meal_mappings")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ rate_plan_id })
			.del();
	}

	public async insertInRatePlanSourceMapping(
		payload: {
			rate_plan_id: number;
			source_id: number;
		}[]
	) {
		return await this.db("rate_plan_source_mappings")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}
	public async deleteInRatePlanSourceMapping(rate_plan_id: number) {
		return await this.db("rate_plan_source_mappings")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ rate_plan_id })
			.del();
	}

	public async insertInDailyRates(
		payload: {
			hotel_code: number;
			rate_plan_id: number;
			room_type_id: number;
			date: string;
			rate: number;
			extra_adult_rate?: number;
			extra_child_rate?: number;
		}[]
	) {
		return await this.db("daily_rates")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	//=================== Bank Name  ======================//

	// create Bank Name
	public async createBankName(payload: ICreateBankNamePayload) {
		return await this.db("bank_name")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	// Get All Bank Name
	public async getAllBankName(payload: {
		limit?: string;
		skip?: string;
		name: string;
		hotel_code: number;
	}) {
		const { limit, skip, hotel_code, name } = payload;

		const dtbs = this.db("bank_name as bn");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
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

		const total = await this.db("bank_name as bn")
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
	}

	// Update Bank Name
	public async updateBankName(id: number, payload: IUpdateBankName) {
		return await this.db("bank_name")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id })
			.update(payload);
	}

	// Delete Bank Name
	public async deleteBankName(id: number) {
		return await this.db("bank_name")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id })
			.del();
	}

	//=================== Designation Model  ======================//

	// create  Designation Model
	public async createDesignation(payload: ICreatedesignation) {
		return await this.db("designation")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	// Get All designation
	public async getAllDesignation(payload: {
		limit?: string;
		skip?: string;
		name: string;
		status?: string;
		hotel_code: number;
		excludeId?: number;
	}) {
		const { limit, skip, hotel_code, name, status, excludeId } = payload;

		const dtbs = this.db("designation as de");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"de.id",
				"de.hotel_code",
				"de.name as designation_name",
				"de.status",
				"de.is_deleted",
				"de.created_by as created_by_id",
				"ua.name as created_by_name"
			)
			.leftJoin("user_admin as ua", "de.created_by", "ua.id")
			.where(function () {
				this.whereNull("de.hotel_code").orWhere(
					"de.hotel_code",
					hotel_code
				);
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

		const total = await this.db("designation as de")
			.withSchema(this.RESERVATION_SCHEMA)
			.count("de.id as total")
			.where(function () {
				this.whereNull("de.hotel_code").orWhere(
					"de.hotel_code",
					hotel_code
				);
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
	}

	// Update Designation
	public async updateDesignation(
		id: number,
		hotel_code: number,
		payload: IUpdatedesignation
	) {
		return await this.db("designation")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.update(payload);
	}

	// Delete designation
	public async deleteDesignation(id: number, hotel_code: number) {
		return await this.db("designation")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.update({ is_deleted: true });
	}

	//=================== Department Model  ======================//

	// create Department
	public async createDepartment(payload: ICreatedepartment) {
		return await this.db("department")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	// Get All Department
	public async getAllDepartment(payload: {
		limit?: string;
		skip?: string;
		name: string;
		status?: string;
		hotel_code: number;
		excludeId?: number;
	}) {
		const { limit, skip, hotel_code, name, status, excludeId } = payload;

		const dtbs = this.db("department as d");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"d.id",
				"d.hotel_code",
				"d.name as department_name",
				"d.status",
				"d.is_deleted",
				"d.created_by as created_by_id",
				"ua.name as created_by_name"
			)
			.leftJoin("user_admin as ua", "d.created_by", "ua.id")
			.where(function () {
				this.whereNull("d.hotel_code").orWhere(
					"d.hotel_code",
					hotel_code
				);
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

		const total = await this.db("department as d")
			.withSchema(this.RESERVATION_SCHEMA)
			.count("d.id as total")
			.where(function () {
				this.whereNull("d.hotel_code").orWhere(
					"d.hotel_code",
					hotel_code
				);
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
	}

	// Get Single Department
	public async getSingleDepartment(id: number, hotel_code: number) {
		return await this.db("department as d")
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"d.id",
				"d.hotel_code",
				"d.name",
				"d.status",
				"d.is_deleted",
				"ua.id as created_by_id",
				"ua.name as created_by_name"
			)
			.leftJoin("user_admin as ua", "d.created_by", "ua.id")
			.where("d.id", id)
			.andWhere("d.hotel_code", hotel_code)
			.andWhere("d.is_deleted", false)
			.first();
	}

	// Update Department
	public async updateDepartment(
		id: number,
		hotel_code: number,
		payload: IUpdatedepartment
	) {
		return await this.db("department")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.update(payload);
	}

	// Delete Department
	public async deleteDepartment(id: number, hotel_code: number) {
		return await this.db("department")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.update({ is_deleted: true });
	}

	//=================== Hall Amenities  ======================//

	// create Hall Amenities
	public async createHallAmenities(payload: ICreateHallAmenitiesPayload) {
		return await this.db("hall_amenities")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	// Get All Hall Amenities
	public async getAllHallAmenities(payload: {
		limit?: string;
		skip?: string;
		name: string;
		status?: string;
		description?: string;
		hotel_code: number;
		excludeId?: number;
	}) {
		const { limit, skip, hotel_code, name, status, excludeId } = payload;

		const dtbs = this.db("hall_amenities as ha");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"ha.id",
				"ha.hotel_code",
				"ha.name",
				"ha.description",
				"ha.status"
			)
			.where(function () {
				this.whereNull("ha.hotel_code").orWhere(
					"ha.hotel_code",
					hotel_code
				);
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

		const total = await this.db("hall_amenities as ha")
			.withSchema(this.RESERVATION_SCHEMA)
			.count("ha.id as total")
			.where(function () {
				this.whereNull("ha.hotel_code").orWhere(
					"ha.hotel_code",
					hotel_code
				);
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
	}

	// Update Hall Amenities
	public async updateHallAmenities(
		id: number,
		hotel_code: number,
		payload: IUpdateHallAmenitiesPayload
	) {
		return await this.db("hall_amenities")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.update(payload);
	}

	// Delete Hall Amenities
	public async deleteHallAmenities(id: number, hotel_code: number) {
		return await this.db("hall_amenities")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.del();
	}

	//=================== Payroll Months ======================//

	// create  Payroll Months
	public async createPayrollMonths(payload: ICreatePayrollMonths) {
		return await this.db("payroll_months")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	// Get All PayrollMonths
	public async getPayrollMonths(payload: {
		limit?: string;
		skip?: string;
		name?: string;
		month_id?: number;
		hotel_code: number;
	}) {
		const { limit, skip, hotel_code, name, month_id } = payload;
		let dtbs = this.db("payroll_months as pm").withSchema(
			this.RESERVATION_SCHEMA
		);

		if (limit && skip) {
			dtbs = dtbs.limit(parseInt(limit));
			dtbs = dtbs.offset(parseInt(skip));
		}

		const data = await dtbs
			.select(
				"pm.id",
				"months.name as month_name",
				"pm.days as working_days",
				"pm.hours",
				"pm.is_deleted"
			)
			.joinRaw(`JOIN ?? as months ON months.id = pm.month_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.months}`,
			])
			.where("pm.hotel_code", hotel_code)
			.andWhere("pm.is_deleted", false)
			.andWhere(function () {
				if (name) {
					this.andWhereRaw("months.name::text ILIKE ?", [
						`%${name}%`,
					]);
				}
				if (month_id) {
					this.andWhere("months.id", month_id);
				}
			})
			.orderBy("pm.id", "asc");

		// New query builder for count
		let countQuery = this.db("payroll_months as pm").withSchema(
			this.RESERVATION_SCHEMA
		);

		const totalResult = await countQuery
			.count("pm.id as total")
			.joinRaw(`JOIN ?? as months ON months.id = pm.month_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.months}`,
			])
			.where("pm.hotel_code", hotel_code)
			.andWhere("pm.is_deleted", false)
			.andWhere(function () {
				if (name) {
					this.andWhereRaw("months.name::text ILIKE ?", [
						`%${name}%`,
					]);
				}
				if (month_id) {
					this.andWhere("months.id", month_id);
				}
			});

		const total = totalResult[0].total;

		return { total, data };
	}

	// Update Payroll Months
	public async updatePayrollMonths(
		id: number,
		payload: IUpdatePayrollMonths
	) {
		return await this.db("payroll_months")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id })
			.andWhere("is_deleted", false)
			.update(payload);
	}

	// Delete Payroll Months
	public async deletePayrollMonths(id: number) {
		return await this.db("payroll_months")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id })
			.andWhere("is_deleted", false)
			.update({ is_deleted: true });
	}

	// =================== floor Model ======================//
	public async createFloor(payload: {
		hotel_code: number;
		floor_no: string;
	}) {
		return await this.db("floors")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	public async getAllFloors(payload: {
		limit?: string;
		skip?: string;
		status?: string;
		hotel_code: number;
		search?: string;
	}) {
		const { limit, skip, hotel_code, search, status } = payload;

		const dtbs = this.db("floors");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
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
	}

	public async getSingleFloor(id: number, hotel_code: number) {
		return await this.db("floors")
			.withSchema(this.RESERVATION_SCHEMA)
			.select("id", "hotel_code", "floor_no")
			.where({ id, hotel_code })
			.andWhere("is_deleted", false)
			.first();
	}

	public async updateFloor(
		id: number,
		hotel_code: number,
		payload: { floor_no: string }
	) {
		return await this.db("floors")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.update(payload);
	}

	public async deleteFloor(id: number, hotel_code: number) {
		return await this.db("floors")
			.withSchema(this.RESERVATION_SCHEMA)
			.update({ is_deleted: true })
			.where({ id, hotel_code });
	}

	// ===================== building Model ======================//
	public async createBuilding(payload: {
		hotel_code: number;
		building_no: string;
		description?: string;
	}) {
		return await this.db("buildings")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	public async getAllBuildings(payload: {
		limit?: string;
		skip?: string;
		status?: string;
		hotel_code: number;
		search?: string;
	}) {
		const { limit, skip, hotel_code, search, status } = payload;

		const dtbs = this.db("buildings");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
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
	}
	public async getSingleBuilding(id: number, hotel_code: number) {
		return await this.db("buildings")
			.withSchema(this.RESERVATION_SCHEMA)
			.select("id", "hotel_code", "building_no", "description")
			.where({ id, hotel_code })
			.andWhere("is_deleted", false)
			.first();
	}
	public async updateBuilding(
		id: number,
		hotel_code: number,
		payload: { name: string }
	) {
		return await this.db("buildings")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id, hotel_code })
			.update(payload);
	}
	public async deleteBuilding(id: number, hotel_code: number) {
		return await this.db("buildings")
			.withSchema(this.RESERVATION_SCHEMA)
			.update({ is_deleted: true })
			.where({ id, hotel_code });
	}
}
export default SettingModel;
