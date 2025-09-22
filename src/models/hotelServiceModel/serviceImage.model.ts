import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class ServicImageModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async uploadServiceImage(
		payload:
			| {
					service_id: number;
					image_url: string;
					hotel_code: number;
			  }[]
			| { service_id: number; image_url: string; hotel_code: number }
	) {
		return await this.db("service_images")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.insert(payload, "id");
	}

	public async updateServiceImage({
		where,
		payload,
	}: {
		where: { id?: number; service_id?: number; hotel_code: number };
		payload: { is_deleted?: boolean };
	}) {
		return await this.db("service_images")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.update(payload)
			.where("id", where.id)
			.andWhere("is_deleted", false)
			.andWhere("hotel_code", where.hotel_code);
	}
}

export default ServicImageModel;
