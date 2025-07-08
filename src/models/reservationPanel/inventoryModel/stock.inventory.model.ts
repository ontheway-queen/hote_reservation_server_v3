import {
	ICreateStockInBody,
	ICreateStockItemBody,
	ICreateStockOutBody,
} from "../../../appInventory/utils/interfaces/stock.interface";
import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class StockInventoryModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	// create stock
	public async createStockIn(payload: ICreateStockInBody) {
		return await this.db("stock")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	public async createStockOut(payload: ICreateStockOutBody) {
		return await this.db("stock")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	// Get All stock
	public async getAllStock(payload: {
		limit?: string;
		skip?: string;
		key?: string;
		status?: string;
		hotel_code: number;
	}) {
		const { limit, skip, hotel_code, key, status } = payload;

		const dtbs = this.db("stock_view as sv");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"sv.id",
				"sv.created_at as date",
				"a.name as account_name",
				"a.acc_type as account_type",
				"sv.status",
				"sv.paid_amount",
				"sv.note"
			)
			.where("sv.hotel_code", hotel_code)
			.leftJoin("account as a", "sv.ac_tr_ac_id", "a.id")
			.andWhere(function () {
				if (key) {
					this.andWhere("a.name", "like", `%${key}%`);
				}
				if (status) {
					this.andWhere("sv.status", "like", `%${status}%`);
				}
			})
			.orderBy("sv.id", "desc");

		const total = await this.db("stock_view as sv")
			.withSchema(this.RESERVATION_SCHEMA)
			.count("sv.id as total")
			.where("sv.hotel_code", hotel_code)
			.leftJoin("account as a", "sv.ac_tr_ac_id", "a.id")
			.andWhere(function () {
				if (key) {
					this.andWhere("a.name", "like", `%${key}%`);
				}
				if (status) {
					this.andWhere("sv.status", "like", `%${status}%`);
				}
			});
		return { total: total[0].total, data };
	}

	// get single stock
	public async getSingleStock(id: number, hotel_code: number) {
		const dtbs = this.db("stock_view as sv");
		const data = await dtbs
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"sv.*",
				"a.name as account_name",
				"a.acc_type as account_type"
			)
			.leftJoin("account as a", "sv.ac_tr_ac_id", "a.id")
			.where("sv.id", id)
			.andWhere("sv.hotel_code", hotel_code);

		return data.length > 0 ? data[0] : [];
	}

	// create stock item
	public async createStockItem(payload: ICreateStockItemBody[]) {
		return await this.db("stock_item")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	// insert in inventory
	public async insertInInventory(
		payload: {
			hotel_code: number;
			product_id: number;
			available_quantity: number;
		}[]
	) {
		return await this.db("inventory")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	// update in inventory
	public async updateInInventory(
		payload: {
			available_quantity?: number;
			quantity_used?: number;
		},
		where: { id: number }
	) {
		return await this.db("inventory")
			.withSchema(this.RESERVATION_SCHEMA)
			.update(payload)
			.where("id", where.id);
	}

	// get all inventory
	public async getAllInventory(where: {
		hotel_code: number;
		product_id: number[];
	}) {
		const { product_id, hotel_code } = where;
		return await this.db("inventory")
			.withSchema(this.RESERVATION_SCHEMA)
			.select("*")
			.where("hotel_code", hotel_code)
			.andWhere(function () {
				if (product_id) {
					this.whereIn("product_id", product_id);
				}
			});
	}

	// get all purchase ingredient item
	public async getInventoryList(payload: {
		key: string;
		hotel_code: number;
		limit: string;
		skip: string;
	}) {
		const { limit, skip, hotel_code, key } = payload;

		const dtbs = this.db("inventory as inv");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"inv.id",
				"inv.product_id",
				"ing.name",
				"ing.measurement",
				"inv.available_quantity",
				"inv.quantity_used"
			)
			.leftJoin("ingredient as ing", "inv.product_id", "ing.id")
			.where({ "inv.hotel_code": hotel_code })
			.andWhere(function () {
				if (key) {
					this.andWhere((builder) => {
						builder.where("ing.name", "like", `%${key}%`);
					});
				}
			});
		return { data };
	}
}
export default StockInventoryModel;
