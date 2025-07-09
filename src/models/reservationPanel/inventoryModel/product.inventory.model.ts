import {
	ICreateDemagedProductPayload,
	ICreateProductPayload,
	IupdateProductPayload,
} from "../../../appInventory/utils/interfaces/product.interface";
import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class ProductInventoryModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	//=================== Product  ======================//

	// create Product
	public async createProduct(payload: ICreateProductPayload) {
		return await this.db("products")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.insert(payload);
	}

	// Get All Product
	public async getAllProduct(payload: {
		limit?: string;
		skip?: string;
		key?: string;
		in_stock?: string;
		hotel_code: number;
		pd_ids?: number[];
		unit?: string;
		category?: string;
		brand?: string;
	}) {
		const {
			limit,
			skip,
			key,
			in_stock,
			hotel_code,
			unit,
			category,
			brand,
			pd_ids,
		} = payload;

		const dtbs = this.db("products as p");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.select(
				"p.id",
				"p.product_code",
				"p.name",
				"p.model",
				"c.name as category",
				"u.name as unit",
				"b.name as brand",
				// "i.available_quantity as in_stock",
				"p.status as status",
				"p.details",
				"p.image",
				"p.is_deleted"
			)
			.where("p.hotel_code", hotel_code)
			.andWhere("p.is_deleted", false)
			.leftJoin("categories as c", "p.category_id", "c.id")
			// .leftJoin("inventory as i", "p.id", "i.product_id")
			.leftJoin("units as u", "p.unit_id", "u.id")
			.leftJoin("brands as b", "p.brand_id", "b.id")
			.andWhere(function () {
				if (key) {
					this.andWhere("p.name", "like", `%${key}%`).orWhere(
						"p.model",
						"like",
						`%${key}%`
					);
				}
				if (unit) {
					this.andWhere("u.name", "like", `%${unit}%`);
				}
				if (category) {
					this.andWhere("c.name", "like", `%${category}%`);
				}
				if (brand) {
					this.andWhere("b.name", "like", `%${brand}%`);
				}
				if (in_stock) {
					this.andWhere("p.status", "like", `%${in_stock}%`);
				}
				if (pd_ids) {
					this.whereIn("p.id", pd_ids);
				}
			})
			.orderBy("p.id", "desc");

		const total = await this.db("products as p")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.count("p.id as total")
			.andWhere("p.is_deleted", false)
			.where("p.hotel_code", hotel_code)
			.leftJoin("categories as c", "p.category_id", "c.id")
			// .leftJoin("inventory as i", "p.id", "i.product_id")
			.leftJoin("units as u", "p.unit_id", "u.id")
			.leftJoin("brands as b", "p.brand_id", "b.id")
			.andWhere(function () {
				if (key) {
					this.andWhere("p.name", "like", `%${key}%`).orWhere(
						"p.model",
						"like",
						`%${key}%`
					);
				}
				if (unit) {
					this.andWhere("u.name", "like", `%${unit}%`);
				}
				if (category) {
					this.andWhere("c.name", "like", `%${category}%`);
				}
				if (brand) {
					this.andWhere("b.name", "like", `%${brand}%`);
				}
				if (in_stock) {
					this.andWhere("p.status", "like", `%${in_stock}%`);
				}
				if (pd_ids) {
					this.whereIn("p.id", pd_ids);
				}
			});

		return { total: total[0].total, data };
	}

	// get all Products for last id
	public async getAllProductsForLastId() {
		return await this.db("products")
			.select("id")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.orderBy("id", "desc")
			.limit(1);
	}

	// Update Product
	public async updateProduct(id: number, payload: IupdateProductPayload) {
		return await this.db("products")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.where({ id })
			.update(payload);
	}

	//=================== Damaged Product  ======================//

	// create Damaged Product
	public async createDamagedProduct(payload: ICreateDemagedProductPayload[]) {
		return await this.db("damaged_product")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.insert(payload);
	}

	// Get All Damaged Product
	public async getAllDamagedProduct(payload: {
		limit?: string;
		skip?: string;
		key?: string;
		hotel_code: number;
	}) {
		const { limit, skip, hotel_code, key } = payload;

		const dtbs = this.db("damaged_product_view as dv");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.select("*")
			.where("dv.hotel_code", hotel_code)
			.orderBy("dv.dmp_id", "desc");

		const total = await this.db("damaged_product_view as dv")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.count("dv.dmp_id as total")
			.where("dv.hotel_code", hotel_code);

		return { total: total[0].total, data };
	}

	// get single Damaged Product
	public async getSingleDamagedProduct(id: number, hotel_code: number) {
		return await this.db("damaged_product_view as dv")
			.withSchema(this.HOTEL_INVENTORY_SCHEMA)
			.select("dv.*")
			.where("dv.id", id)
			.andWhere("dv.hotel_code", hotel_code);
	}
}
export default ProductInventoryModel;
