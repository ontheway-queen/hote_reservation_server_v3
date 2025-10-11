import {
	IRestaurantPayload,
	IUpdateRestaurantPayload,
} from "../../appAdmin/utlis/interfaces/restaurant.hotel.interface";

import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class RestaurantModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

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
}
export default RestaurantModel;
