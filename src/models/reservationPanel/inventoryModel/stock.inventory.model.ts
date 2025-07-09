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
		return await this.db("stocks")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.insert(payload, "id");
	}

	public async createStockOut(payload: ICreateStockOutBody) {
		return await this.db("stocks")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
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

		const dtbs = this.db("stocks as s");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.select(
				"s.id",
				"s.created_at as date",
				"a.name as account_name",
				"a.acc_type as account_type",
				"s.status",
				"s.paid_amount",
				"s.note"
			)
			.where("s.hotel_code", hotel_code)
			.joinRaw(`LEFT JOIN ?? a ON a.id = s.ac_tr_ac_id`, [
				`${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
			])
			.andWhere(function () {
				if (key) {
					this.andWhere("a.name", "like", `%${key}%`);
				}
				if (status) {
					this.andWhere("s.status", "like", `%${status}%`);
				}
			})
			.orderBy("s.id", "desc");

		const total = await this.db("stocks as s")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.count("s.id as total")
			.where("s.hotel_code", hotel_code)
			.joinRaw(`LEFT JOIN ?? a ON a.id = s.ac_tr_ac_id`, [
				`${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
			])
			.andWhere(function () {
				if (key) {
					this.andWhere("a.name", "like", `%${key}%`);
				}
				if (status) {
					this.andWhere("s.status", "like", `%${status}%`);
				}
			});
		return { total: total[0].total, data };
	}

	// get single stock
	public async getSingleStock(id: number, hotel_code: number) {
		const stock = await this.db("stocks as s")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.select(
				"s.*",
				"a.name as account_name",
				"a.acc_type as account_type",
				"ua.id as created_by_id",
				"ua.name as created_by_name"
			)
			.joinRaw(`LEFT JOIN ?? ua ON ua.id = s.created_by`, [
				`${this.RESERVATION_SCHEMA}.user_admin`,
			])
			.joinRaw(`LEFT JOIN ?? a ON a.id = s.ac_tr_ac_id`, [
				`${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
			])
			.where("s.id", id)
			.andWhere("s.hotel_code", hotel_code)
			.first();

		const stockItems = await this.db("stock_items")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.select("product_id")
			.sum("quantity as quantity")
			.where("stock_id", id)
			.groupBy("product_id");

		const { created_by, ...cleanStock } = stock;

		return {
			...cleanStock,
			items: stockItems,
		};
	}

	// create stock item
	public async createStockItem(payload: ICreateStockItemBody[]) {
		return await this.db("stock_items")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
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
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
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
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
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
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
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
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
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
