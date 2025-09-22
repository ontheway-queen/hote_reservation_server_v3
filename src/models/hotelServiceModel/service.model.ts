import {
	IGetServiceList,
	IGetSingleService,
} from "../../appAdmin/utlis/interfaces/service.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class ServiceModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async getLastServiceCode(hotel_code: number) {
		return await this.db("services")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.select("id", "service_code")
			.orderBy("id", "desc")
			.where("hotel_code", hotel_code)
			.limit(1)
			.first();
	}

	public async createService(payload: any) {
		return await this.db("services")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.insert(payload, "id");
	}

	public async getSingleService(where: {
		id?: number;
		name?: string;
		hotel_code: number;
		category_id?: number;
	}): Promise<IGetSingleService> {
		return await this.db("services as s")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.select(
				"s.id",
				"s.service_code",
				"s.thumbnail_url",
				"s.name",
				"s.category_id",
				"sc.name as category_name",
				"s.description",
				"s.is_always_open",
				"s.min_persons",
				"s.max_persons",
				"s.delivery_required",
				"s.status",
				this.db.raw(`
  (
    SELECT coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', si.id,
          'file', si.image_url
        )
      ), '[]'
    )
    FROM hotel_service.service_images si
    WHERE si.service_id = s.id AND si.is_deleted = false
  ) as images
`),

				this.db.raw(`
      COALESCE(
        (
          SELECT json_agg(
            jsonb_build_object(
              'id', sp.id,
              'pricing_model', sp.pricing_model,
              'price', sp.price,
              'discount', sp.discount_percent,
              'discount_price', sp.discount_price,
              'delivery_charge', sp.delivery_charge,
              'vat', sp.vat_percent,
              'total_price', sp.total_price,
              'delivery_types', sp.delivery_types,
              'delivery_time_estimate', sp.delivery_time_estimate
            )
          )
          FROM hotel_service.service_pricing sp
          WHERE sp.service_id = s.id AND sp.is_deleted = false
        ),
        '[]'
      ) as pricing_models
    `),

				this.db.raw(`COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', ss.id,
              'day', ss.day_of_week,
              'open_time', ss.open_time,
              'close_time', ss.close_time
            )
          ) FILTER (WHERE ss.id IS NOT NULL AND ss.is_deleted = false),
          '[]'
        ) as service_schedule`)
			)
			.leftJoin("service_categories as sc", "sc.id", "s.category_id")
			.leftJoin("service_schedule as ss", "ss.service_id", "s.id")
			.where("s.hotel_code", where.hotel_code)
			.andWhere("s.is_deleted", false)
			.modify((qb) => {
				if (where.id) {
					qb.andWhere("s.id", where.id);
				}
				if (where.name) {
					qb.andWhere("s.name", "ilike", `%${where.name}%`);
				}
				if (where.category_id) {
					qb.andWhere("s.category_id", where.category_id);
				}
			})
			.groupBy("s.id", "sc.name")
			.first();
	}

	public async getAllServices(where: {
		key?: string;
		hotel_code: number;
		limit?: number;
		skip?: number;
	}): Promise<{ data: IGetServiceList[]; total: number }> {
		const baseQuery = this.db("services as s")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.leftJoin("service_categories as sc", "s.category_id", "sc.id")
			.where("s.hotel_code", where.hotel_code)
			.andWhere("s.is_deleted", false)
			.modify((qb) => {
				if (where.key) {
					qb.andWhere("s.name", "ilike", `%${where.key}%`);
				}
			});

		const totalQuery = this.db
			.count("* as total")
			.from(baseQuery.clone().as("sub"));

		const [totalResult] = await totalQuery;
		const total = parseInt((totalResult as any).total, 10);

		const dataQuery = baseQuery
			.clone()
			.select(
				"s.id",
				"s.thumbnail_url",
				"s.service_code",
				"s.name",
				"sc.name as category_name",
				"s.min_persons",
				"s.max_persons",
				"s.is_always_open",
				"s.status"
			);

		if (where.limit) dataQuery.limit(where.limit);
		if (where.skip) dataQuery.offset(where.skip);

		const data = await dataQuery;

		return { total, data };
	}

	public async deleteService(where: { id: number; hotel_code: number }) {
		await this.db("services")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.where("id", where.id)
			.andWhere("hotel_code", where.hotel_code)
			.update({ is_deleted: true });
	}

	public async updateService({
		where,
		payload,
	}: {
		where: { id: number; hotel_code: number };
		payload: any;
	}) {
		console.log({ payload });
		await this.db("services")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.where("id", where.id)
			.andWhere("hotel_code", where.hotel_code)
			.update(payload);
	}
}

export default ServiceModel;
