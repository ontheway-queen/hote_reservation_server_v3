import {
	IRestaurantUserAdminPayload,
	IUpdateRestaurantUserAdminPayload,
} from "../../appAdmin/utlis/interfaces/restaurant.hotel.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class HotelRestaurantAdminModel extends Schema {
	private db: TDB;
	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async createRestaurantAdmin(payload: IRestaurantUserAdminPayload) {
		return await this.db("user_admin")
			.withSchema(this.RESTAURANT_SCHEMA)
			.insert(payload);
	}

	public async getAllRestaurantAdminEmail(payload: {
		email: string;
		hotel_code: number;
	}) {
		const { email, hotel_code } = payload;

		const dtbs = this.db("user_admin as ua");

		const data = await dtbs
			.withSchema(this.RESTAURANT_SCHEMA)
			.where({ "ua.hotel_code": hotel_code })
			.andWhere({ "ua.email": email })
			.orderBy("id", "desc");

		return data.length > 0 ? data[0] : null;
	}

	public async getAllRestaurantAdmin(payload: { hotel_code: number }) {
		const { hotel_code } = payload;
		const dtbs = this.db("user_admin as ua");
		return await dtbs
			.withSchema(this.RESTAURANT_SCHEMA)
			.where({ "ua.hotel_code": hotel_code, "ua.is_deleted": false })
			.orderBy("id", "desc");
	}

	public async getRestaurantAdmin(payload: { id?: number; email?: string }) {
		const { id, email } = payload;
		const dtbs = this.db("user_admin as ua");
		return await dtbs
			.withSchema(this.RESTAURANT_SCHEMA)
			.where(function () {
				if (id) {
					this.where({ "ua.id": id });
				}
				if (email) {
					this.where({ "ua.email": email });
				}
			})
			.first();
	}

	public async updateRestaurantAdmin({
		id,
		email,
		payload,
	}: {
		id?: number;
		email?: string;
		payload: IUpdateRestaurantUserAdminPayload;
	}) {
		return await this.db("user_admin")
			.withSchema(this.RESTAURANT_SCHEMA)
			.update(payload)
			.where(function () {
				if (id) {
					this.andWhere({ id });
				}
				if (email) {
					this.andWhere({ email });
				}
			});
	}

	public async getRestaurantAdminProfile(payload: {
		id: number;
		hotel_code: number;
		restaurant_id: number;
	}) {
		const { id, hotel_code } = payload;
		const dtbs = this.db("user_admin as ua");
		return await dtbs
			.withSchema(this.RESTAURANT_SCHEMA)
			.select(
				"ua.id",
				"ua.name",
				"ua.email",
				"ua.phone",
				"ua.photo",
				"ua.status",
				"r.id as restaurant_id",
				"r.name as restaurant_name",
				"r.photo as restaurant_photo",
				"r.email as restaurant_email",
				"r.phone as restaurant_phone",
				"r.address as restaurant_address",
				"r.city as restaurant_city",
				"r.country as restaurant_country",
				"r.bin_no as restaurant_bin_no",
				"r.status as restaurant_status"
			)
			.leftJoin("restaurant as r", "r.id", "ua.restaurant_id")
			.where({ "ua.id": id, "ua.hotel_code": hotel_code })
			.first();
	}
}

export default HotelRestaurantAdminModel;
