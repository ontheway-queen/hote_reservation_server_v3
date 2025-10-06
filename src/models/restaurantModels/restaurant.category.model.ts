import {
	IGetRestaurantMenuCategories,
	IRestaurantMenuCategoryPayload,
} from "../../appRestaurantAdmin/utils/interface/menuCategory.interface";
import { IUpdateRestaurantTablePayload } from "../../appRestaurantAdmin/utils/interface/table.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class RestaurantCategoryModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

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
}
export default RestaurantCategoryModel;
