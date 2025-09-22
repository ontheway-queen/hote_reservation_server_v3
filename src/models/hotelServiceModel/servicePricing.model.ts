import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class ServicePricingModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async createServicePricing(payload: any) {
		return await this.db("service_pricing")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.insert(payload, "id");
	}

	public async getSingleServicePricing({
		where,
	}: {
		where: { id: number; hotel_code: number };
	}) {
		return await this.db("service_pricing")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.where("id", where.id)
			.andWhere("hotel_code", where.hotel_code)
			.first();
	}

	public async updateServicePricing({
		where,
		payload,
	}: {
		where: { id: number; hotel_code: number };
		payload: any;
	}) {
		return await this.db("service_pricing")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.update(payload)
			.where("id", where.id)
			.andWhere("hotel_code", where.hotel_code);
	}
}

export default ServicePricingModel;
