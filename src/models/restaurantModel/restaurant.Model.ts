import {
	IRestaurantPayload,
	IUpdateRestaurantPayload,
} from "../../appAdmin/utlis/interfaces/restaurant.hotel.interface";
import { IMeasurementPayload } from "../../appRestaurantAdmin/utils/interface/measurement.interface";
import {
	IGetRestaurantMenuCategories,
	IRestaurantMenuCategoryPayload,
} from "../../appRestaurantAdmin/utils/interface/menuCategory.interface";
import {
	IGetRestaurantTables,
	IRestaurantTablePayload,
	IUpdateRestaurantTablePayload,
} from "../../appRestaurantAdmin/utils/interface/table.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class RestaurantModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	//=================== Restaurant  ======================//

	public async createRestaurant(payload: IRestaurantPayload) {
		return await this.db("restaurant")
			.withSchema(this.RESTAURANT_SCHEMA)
			.insert(payload, "id");
	}

	public async getAllRestaurant(payload: {
		limit?: string;
		skip?: string;
		email?: string;
		res_email?: string;
		name?: string;
		key?: string;
		hotel_code: number;
	}) {
		const { key, limit, skip, hotel_code } = payload;

		const dtbs = this.db("restaurant as r");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.RESTAURANT_SCHEMA)
			.select(
				"r.id",
				"r.name",
				"r.email",
				"r.status",
				"r.phone",
				"r.photo",
				"r.status",
				"r.is_deleted"
			)
			.where("r.hotel_code", hotel_code)
			.andWhere(function () {
				if (key) {
					this.andWhere("r.name", "ilike", `%${key}%`).orWhere(
						"r.email",
						"ilike",
						`%${key}%`
					);
				}
			})
			.orderBy("r.id", "desc");

		const total = await this.db("restaurant as r")
			.withSchema(this.RESTAURANT_SCHEMA)
			.count("r.id as total")
			.where("r.hotel_code", hotel_code)
			.andWhere(function () {
				if (key) {
					this.andWhere("r.name", "ilike", `%${key}%`).orWhere(
						"r.email",
						"ilike",
						`%${key}%`
					);
				}
			});

		return { total: parseInt(total[0].total as string), data };
	}

	public async getRestaurantWithAdmin(where: {
		restaurant_id: number;
		hotel_code: number;
	}) {
		const { restaurant_id, hotel_code } = where;
		return await this.db("restaurant as r")
			.select(
				"r.id",
				"r.photo",
				"r.name",
				"r.email",
				"r.phone",
				"r.address",
				"r.city",
				"r.country",
				"r.bin_no",
				"r.status",
				"r.is_deleted",
				"ua.id as admin_id",
				"ua.name as admin_name",
				"ua.photo as admin_photo",
				"ua.phone as admin_phone",
				"ua.email as admin_email",
				"ua.status as admin_status"
			)
			.withSchema(this.RESTAURANT_SCHEMA)
			.leftJoin("user_admin as ua", "ua.restaurant_id", "r.id")
			.where("r.hotel_code", hotel_code)
			.andWhere("r.id", restaurant_id)
			.andWhere("r.is_deleted", false)
			.first();
	}

	public async updateRestaurant({
		id,
		payload,
	}: {
		id: number;
		payload: Partial<IUpdateRestaurantPayload>;
	}) {
		return await this.db("restaurant as r")
			.withSchema(this.RESTAURANT_SCHEMA)
			.where("r.id", id)
			.update(payload);
	}

	//=================== Restaurant Tables  ======================//
	public async createTable(payload: IRestaurantTablePayload) {
		return await this.db("restaurant_tables")
			.withSchema(this.RESTAURANT_SCHEMA)
			.insert(payload, "id");
	}

	public async getTables(query: {
		hotel_code: number;
		restaurant_id: number;
		limit?: number;
		skip?: number;
		id?: number;
		name?: string;
		category?: string;
		status?: string;
	}): Promise<{ data: IGetRestaurantTables[]; total: number }> {
		const baseQuery = this.db("restaurant_tables as rt")
			.withSchema(this.RESTAURANT_SCHEMA)
			.where("rt.hotel_code", query.hotel_code)
			.andWhere("rt.restaurant_id", query.restaurant_id)
			.andWhere("rt.is_deleted", false);

		if (query.id) {
			baseQuery.andWhere("rt.id", query.id);
		}
		if (query.name) {
			baseQuery.andWhereILike("rt.name", `%${query.name}%`);
		}
		if (query.category) {
			baseQuery.andWhere("rt.category", query.category);
		}
		if (query.status) {
			baseQuery.andWhere("rt.status", query.status);
		}

		const data = await baseQuery
			.clone()
			.select(
				"rt.id",
				"rt.hotel_code",
				"rt.restaurant_id",
				"rt.name",
				"rt.category",
				"rt.status",
				"rt.is_deleted"
			)
			.orderBy("rt.id", "desc")
			.limit(query.limit ?? 100)
			.offset(query.skip ?? 0);

		const countResult = await baseQuery
			.clone()
			.count<{ total: string }[]>("rt.id as total");

		const total = Number(countResult[0].total);

		return { total, data };
	}

	public async updateTable({
		id,
		payload,
	}: {
		id: number;
		payload: IUpdateRestaurantTablePayload;
	}) {
		return await this.db("restaurant_tables as rt")
			.withSchema(this.RESTAURANT_SCHEMA)
			.where("rt.id", id)
			.update(payload);
	}

	public async deleteTable(where: { id: number }) {
		return await this.db("restaurant_tables as rt")
			.withSchema(this.RESTAURANT_SCHEMA)
			.update({ is_deleted: true })
			.where("rt.id", where.id);
	}

	// =================== Restaurant Menu Categories  ======================//
	public async createMenuCategory(payload: IRestaurantMenuCategoryPayload) {
		return await this.db("menu_categories")
			.withSchema(this.RESTAURANT_SCHEMA)
			.insert(payload, "id");
	}

	public async getMenuCategories(query: {
		hotel_code: number;
		restaurant_id: number;
		limit?: number;
		skip?: number;
		name?: string;
		status?: string;
		id?: number;
	}): Promise<{ data: IGetRestaurantMenuCategories[]; total: number }> {
		const baseQuery = this.db("menu_categories as mc")
			.withSchema(this.RESTAURANT_SCHEMA)
			.leftJoin("user_admin as ua", "ua.id", "mc.created_by")
			.where("mc.hotel_code", query.hotel_code)
			.andWhere("mc.restaurant_id", query.restaurant_id)
			.andWhere("mc.is_deleted", false);

		if (query.id) {
			baseQuery.andWhere("mc.id", query.id);
		}
		if (query.name) {
			baseQuery.andWhereILike("mc.name", `%${query.name}%`);
		}
		if (query.status) {
			baseQuery.andWhere("mc.status", query.status);
		}

		const [{ count }] = await baseQuery
			.clone()
			.count<{ count: string }[]>("* as count");

		const data = await baseQuery
			.clone()
			.select(
				"mc.id",
				"mc.hotel_code",
				"mc.restaurant_id",
				"mc.name",
				"mc.status",
				"mc.is_deleted",
				"mc.created_by",
				"ua.name as created_by_name"
			)
			.orderBy("mc.id", "desc")
			.limit(query.limit ?? 100)
			.offset(query.skip ?? 0);

		return {
			total: Number(count),
			data,
		};
	}

	public async updateMenuCategory({
		id,
		payload,
	}: {
		id: number;
		payload: IUpdateRestaurantTablePayload;
	}) {
		return await this.db("menu_categories as rt")
			.withSchema(this.RESTAURANT_SCHEMA)
			.where("rt.id", id)
			.andWhere("rt.is_deleted", false)
			.update(payload, "id");
	}

	public async deleteMenuCategory(where: { id: number }) {
		return await this.db("menu_categories as mc")
			.withSchema(this.RESTAURANT_SCHEMA)
			.update({ is_deleted: true })
			.where("mc.id", where.id);
	}

	// =================== Measurement  ======================//
	public async createMeasurement(payload: IMeasurementPayload) {
		return await this.db("measurements")
			.withSchema(this.RESTAURANT_SCHEMA)
			.insert(payload, "id");
	}

	public async getMeasurements(query: {
		hotel_code: number;
		restaurant_id: number;
		limit?: number;
		skip?: number;
		id?: number;
		name?: string;
	}): Promise<{ data: IGetRestaurantTables[]; total: number }> {
		const baseQuery = this.db("measurements as rt")
			.withSchema(this.RESTAURANT_SCHEMA)
			.where("rt.hotel_code", query.hotel_code)
			.andWhere("rt.restaurant_id", query.restaurant_id)
			.andWhere("rt.is_deleted", false);

		if (query.id) {
			baseQuery.andWhere("rt.id", query.id);
		}
		if (query.name) {
			baseQuery.andWhereILike("rt.name", `%${query.name}%`);
		}

		const data = await baseQuery
			.clone()
			.select(
				"rt.id",
				"rt.hotel_code",
				"rt.restaurant_id",
				"rt.name",
				"rt.short_code",
				"rt.is_deleted"
			)
			.orderBy("rt.id", "desc")
			.limit(query.limit ?? 100)
			.offset(query.skip ?? 0);

		const countResult = await baseQuery
			.clone()
			.count<{ total: string }[]>("rt.id as total");

		const total = Number(countResult[0].total);

		return { total, data };
	}

	public async updateMeasurement({
		id,
		payload,
	}: {
		id: number;
		payload: IUpdateRestaurantTablePayload;
	}) {
		return await this.db("measurements as rt")
			.withSchema(this.RESTAURANT_SCHEMA)
			.update(payload, "id")
			.where("rt.id", id)
			.andWhere("rt.is_deleted", false);
	}

	public async deleteMeasurement(where: { id: number }) {
		return await this.db("measurements as rt")
			.withSchema(this.RESTAURANT_SCHEMA)
			.update({ is_deleted: true })
			.where("rt.id", where.id)
			.andWhere("rt.is_deleted", false);
	}
}
export default RestaurantModel;
