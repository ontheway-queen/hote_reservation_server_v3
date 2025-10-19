import {
	IFoodPayload,
	IGetFoods,
} from "../../appRestaurantAdmin/utils/interface/food.interface";

import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class RestaurantFoodModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async createFood(payload: IFoodPayload) {
		return await this.db("foods")
			.withSchema(this.RESTAURANT_SCHEMA)
			.insert(payload, "id");
	}

	public async getFoods(query: {
		hotel_code: number;
		restaurant_id: number;
		limit?: number;
		skip?: number;
		id?: number;
		food_ids?: number[];
		name?: string;
		menu_category_id?: number;
	}): Promise<{ data: IGetFoods[]; total: number }> {
		const baseQuery = this.db("foods as f")
			.withSchema(this.RESTAURANT_SCHEMA)
			.leftJoin("user_admin as ua", "ua.id", "f.created_by")
			.leftJoin("menu_categories as mc", "mc.id", "f.menu_category_id")
			.leftJoin("units as u", "u.id", "f.unit_id")
			.where("f.hotel_code", query.hotel_code)
			.andWhere("f.restaurant_id", query.restaurant_id)
			.andWhere("f.is_deleted", false);

		if (query.id) {
			baseQuery.andWhere("f.id", query.id);
		}
		if (query.name) {
			baseQuery.andWhereILike("f.name", `%${query.name}%`);
		}
		if (query.menu_category_id) {
			baseQuery.andWhere("f.menu_category_id", query.menu_category_id);
		}
		if (query.food_ids) {
			baseQuery.whereIn("f.id", query.food_ids);
		}

		const data = await baseQuery
			.clone()
			.select(
				"f.id",
				"f.hotel_code",
				"f.restaurant_id",
				"f.photo",
				"f.name",
				"mc.name as menu_category_name",
				"ua.id as created_by_id",
				"u.name as unit_name",
				"u.short_code as unit_short_code",
				"ua.name as created_by_name",
				"f.status",
				"f.retail_price",
				"f.is_deleted"
			)
			.orderBy("f.id", "desc")
			.limit(query.limit ?? 100)
			.offset(query.skip ?? 0);

		const countResult = await baseQuery
			.clone()
			.count<{ total: string }[]>("f.id as total");

		const total = Number(countResult[0].total);

		return { total, data };
	}

	public async updateFood({
		where: { id },
		payload,
	}: {
		where: { id: number };
		payload: Partial<IFoodPayload>;
	}) {
		return await this.db("foods as f")
			.withSchema(this.RESTAURANT_SCHEMA)
			.update(payload, "id")
			.where("f.id", id)
			.andWhere("f.is_deleted", false);
	}

	public async deleteFood(where: { id: number }) {
		return await this.db("foods")
			.withSchema(this.RESTAURANT_SCHEMA)
			.update({ is_deleted: true })
			.where("id", where.id);
	}
}
export default RestaurantFoodModel;
