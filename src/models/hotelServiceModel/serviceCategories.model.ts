import {
	IGetServiceCategories,
	IGetServiceCategory,
} from "../../appAdmin/utlis/interfaces/serviceCategories.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class ServiceCategoriesModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async createServiceCategory(payload: {
		hotel_code: number;
		name: string;
		category_code: string;
		created_by: number;
	}) {
		return await this.db("service_categories")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.insert(payload);
	}

	public async getServiceCategory(where: {
		hotel_code: number;
		id?: number;
		name?: string;
	}): Promise<IGetServiceCategory> {
		return await this.db("service_categories")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.select("*")
			.where("hotel_code", where.hotel_code)
			.andWhere("is_deleted", false)
			.andWhere((qb) => {
				if (where.id) {
					qb.andWhere("id", where.id);
				}
				if (where.name) {
					qb.andWhere("name", "ilike", `%${where.name}%`).orWhere(
						"category_code",
						"ilike",
						`%${where.name}%`
					);
				}
			})
			.first();
	}

	public async getServiceCategories(query: {
		hotel_code: number;
		limit?: number;
		skip?: number;
		key?: string;
		status?: string;
	}): Promise<{ data: IGetServiceCategories[]; total: number }> {
		const { hotel_code, status, limit, skip, key } = query;

		const baseQuery = this.db("service_categories as sc")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.joinRaw(`LEFT JOIN ?? as ua ON sc.created_by = ua.id`, [
				`${this.RESERVATION_SCHEMA}.${this.TABLES.user_admin}`,
			])
			.where("sc.hotel_code", hotel_code)
			.andWhere("sc.is_deleted", false)
			.modify((qb) => {
				if (key) {
					qb.andWhere("sc.name", "ilike", `%${key}%`).orWhere(
						"sc.category_code",
						"ilike",
						`%${key}%`
					);
				}
				if (status === "0" || status === "1") {
					qb.andWhere("sc.status", status === "0" ? false : true);
				}
			})
			.orderBy("sc.id", "desc");

		const totalQuery = this.db
			.count("* as total")
			.from(baseQuery.clone().as("sub"));
		const [totalResult] = await totalQuery;
		const total = parseInt((totalResult as any).total, 10);

		const dataQuery = baseQuery.clone();

		if (limit) dataQuery.limit(limit);
		if (skip) dataQuery.offset(skip);

		const data = await dataQuery.select(
			"sc.id",
			"sc.hotel_code",
			"sc.name",
			"sc.category_code",
			"sc.status",
			"ua.name as created_by",
			"sc.is_deleted",
			"sc.created_at",
			this.db.raw(
				`
    (
      SELECT COUNT(*) 
      FROM ?? as s
      WHERE s.category_id = sc.id
        AND s.hotel_code = sc.hotel_code
        AND s.is_deleted = false
    ) as service_count
  `,
				[`${this.HOTEL_SERVICE_SCHEMA}.services`]
			)
		);

		return { total, data };
	}

	public async updateServiceCategory(
		where: { hotel_code: number; id: number },
		payload: {
			name?: string;
			category_code?: string;
			status?: string;
			is_deleted?: boolean;
		}
	) {
		return await this.db("service_categories")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.update(payload)
			.where("id", where.id)
			.andWhere("hotel_code", where.hotel_code);
	}
}

export default ServiceCategoriesModel;
