import {
	IGetUnit,
	IUnitPayload,
	IUpdateUnitPayload,
} from "../../appRestaurantAdmin/utils/interface/unit.interface";

import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class RestaurantUnitModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async createUnit(payload: IUnitPayload) {
		return await this.db("units")
			.withSchema(this.RESTAURANT_SCHEMA)
			.insert(payload, "id");
	}

	public async getUnits(query: {
		hotel_code: number;
		restaurant_id: number;
		limit?: number;
		skip?: number;
		id?: number;
		name?: string;
	}): Promise<{ data: IGetUnit[]; total: number }> {
		const baseQuery = this.db("units as rt")
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

	public async updateUnit({
		id,
		payload,
	}: {
		id: number;
		payload: IUpdateUnitPayload;
	}) {
		return await this.db("units as rt")
			.withSchema(this.RESTAURANT_SCHEMA)
			.update(payload, "id")
			.where("rt.id", id)
			.andWhere("rt.is_deleted", false);
	}

	public async deleteUnit(where: { id: number }) {
		return await this.db("units as rt")
			.withSchema(this.RESTAURANT_SCHEMA)
			.update({ is_deleted: true })
			.where("rt.id", where.id)
			.andWhere("rt.is_deleted", false);
	}
}
export default RestaurantUnitModel;
