import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class ServiceScheduleModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async addServiceSchedule(
		payload:
			| {
					service_id: number;
					day_of_week: string;
					open_time: string;
					close_time: string;
					hotel_code: number;
			  }[]
			| {
					service_id: number;
					day_of_week: string;
					open_time: string;
					close_time: string;
					hotel_code: number;
			  }
	) {
		return await this.db("service_schedule")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.insert(payload, "id");
	}

	public async updateServiceSchedule({
		where,
		payload,
	}: {
		where: { id?: number; service_id?: number; hotel_code: number };
		payload: { is_deleted: boolean };
	}) {
		return await this.db("service_schedule")
			.withSchema(this.HOTEL_SERVICE_SCHEMA)
			.update(payload)
			.where("hotel_code", where.hotel_code)
			.modify((qb) => {
				if (where.id) {
					qb.where("id", where.id);
				}
				if (where.service_id) {
					qb.where("service_id", where.service_id);
				}
			});
	}
}

export default ServiceScheduleModel;
