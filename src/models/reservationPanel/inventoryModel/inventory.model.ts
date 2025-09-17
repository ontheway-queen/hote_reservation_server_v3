import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class InventoryModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async getInventoryDetails(payload: {
		limit?: number;
		skip?: number;
		key?: string;
		hotel_code: number;
	}): Promise<{
		data: {
			id: number;
			product_code: string;
			product_name: string;
			category: string;
			available_quantity: number;
			quantity_used: number;
			total_damaged: number;
		}[];
		total: number;
	}> {
		const { limit, skip, key, hotel_code } = payload;

		const baseQuery = this.db("inventory as i")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.leftJoin("products as p", "p.id", "i.product_id")
			.leftJoin("categories as c", "c.id", "p.category_id")
			.where("i.hotel_code", hotel_code)
			.modify((qb) => {
				if (key) {
					qb.andWhere("p.name", "ilike", `%${key}%`);
				}
			});

		// get total count
		const totalResult = await baseQuery
			.clone()
			.count<{ count: string }>("i.id as count")
			.first();
		const total = totalResult ? parseInt(totalResult.count, 10) : 0;

		// get paginated data
		if (limit) baseQuery.limit(limit);
		if (skip) baseQuery.offset(skip);

		const data = await baseQuery
			.select(
				"i.id",
				"p.product_code",
				"p.name as product_name",
				"c.name as category",
				"i.available_quantity",
				"i.quantity_used",
				"i.total_damaged"
			)
			.orderBy("i.id", "desc");

		return { total, data };
	}

	public async getSingleInventoryDetails(payload: {
		hotel_code: number;
		id?: number;
		product_id?: number;
	}) {
		const { hotel_code, id } = payload;
		return await this.db("inventory as i")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.select(
				"i.id",
				"i.hotel_code",
				"i.product_id",
				"p.product_code",
				"p.model as product_model",
				"p.name as product_name",
				"p.details as product_details",
				"p.image as product_image",
				"p.status as product_status",
				"p.category_id",
				"c.name as category",
				"p.unit_id",
				"u.name as unit",
				"p.brand_id",
				"b.name as brand",
				"i.available_quantity",
				"i.quantity_used",
				"i.total_damaged"
			)
			.leftJoin("products as p", "p.id", "i.product_id")
			.leftJoin("categories as c", "c.id", "p.category_id")
			.leftJoin("units as u", "u.id", "p.unit_id")
			.leftJoin("brands as b", "b.id", "p.brand_id")
			.where("i.hotel_code", hotel_code)
			.modify((qb) => {
				if (id) {
					qb.andWhere("i.id", id);
				}
				if (payload.product_id) {
					qb.andWhere("i.product_id", payload.product_id);
				}
			})
			.first();
	}
}
export default InventoryModel;
