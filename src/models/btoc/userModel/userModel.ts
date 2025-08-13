import {
	IBtocUser,
	IBtocUserProfile,
} from "../../../btoc/utils/types/user.types";
import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class UserModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	// Check user
	public async checkUser(query: { email: string }): Promise<IBtocUser> {
		const { email } = query;
		return await this.db("users")
			.withSchema(this.BTOC)
			.select("*")
			.where("email", email)
			.andWhere("is_deleted", false)
			.first();
	}

	// create user
	public async createUser(payload: any) {
		return await this.db("users")
			.withSchema(this.BTOC)
			.insert(payload)
			.returning(["id", "email"]);
	}

	// get profile
	public async getProfile(query: {
		id?: number;
		email?: string;
	}): Promise<IBtocUserProfile> {
		return await this.db("users as u")
			.withSchema(this.BTOC)
			.select(
				"u.id",
				"u.first_name",
				"u.last_name",
				"u.email",
				"u.phone",
				"u.photo",
				"u.status",
				"u.gender",
				"u.address",
				"u.date_of_birth",
				"city.city_name as city",
				"country.country_name as country",
				"u.is_deleted"
			)
			.joinRaw("LEFT JOIN ?? city ON city.city_code = u.city_id", [
				`${this.PUBLIC_SCHEMA}.${this.TABLES.city}`,
			])
			.joinRaw("LEFT JOIN ?? country ON country.id = u.country_id", [
				`${this.PUBLIC_SCHEMA}.${this.TABLES.country}`,
			])
			.modify((qb) => {
				if (query.id) qb.where("u.id", query.id);
				if (query.email) qb.where("u.email", query.email);
			})
			.andWhere("u.is_deleted", false)
			.first();
	}

	// update profile
	public async updateProfile({
		payload,
		id,
		email,
	}: {
		payload: any;
		id?: number;
		email?: string;
	}) {
		return await this.db("users")
			.withSchema(this.BTOC)
			.modify((qb) => {
				if (id) qb.where("id", id);
				if (email) qb.where("email", email);
			})
			.update(payload)
			.returning("id");
	}

	// // create hotel
	// public async createHotel(payload: ICreateHotelPayload) {
	// 	console.log(payload);
	// 	return await this.db("hotels")
	// 		.withSchema(this.RESERVATION_SCHEMA)
	// 		.insert(payload, "id");
	// }

	// public async insertHotelContactDetails(payload: IinsertHotelsCDPayload) {
	// 	return await this.db("hotel_contact_details")
	// 		.withSchema(this.RESERVATION_SCHEMA)
	// 		.insert(payload);
	// }

	// public async updateHotelContactDetails(
	// 	payload: {
	// 		phone?: string;
	// 		fax?: string;
	// 		website_url?: string;
	// 		email?: string;
	// 		logo?: string;
	// 	},
	// 	hotel_code: number
	// ) {
	// 	return await this.db("hotel_contact_details")
	// 		.withSchema(this.RESERVATION_SCHEMA)
	// 		.update(payload)
	// 		.where({ hotel_code });
	// }

	// public async insertHotelImages(
	// 	body: {
	// 		hotel_code: number;
	// 		image_url: string;
	// 		image_caption?: string;
	// 		main_image: string;
	// 	}[]
	// ) {
	// 	return await this.db("hotel_image")
	// 		.withSchema(this.RESERVATION_SCHEMA)
	// 		.insert(body);
	// }

	// // get all hotel
	// public async getAllHotel(payload: IgetAllHotelUserPayload) {
	// 	const { from_date, to_date, name, status, limit, skip } = payload;

	// 	const endDate = new Date(to_date as string);
	// 	endDate.setDate(endDate.getDate() + 1);

	// 	const dtbs = this.db("hotels as h");

	// 	if (limit && skip) {
	// 		dtbs.limit(parseInt(limit as string));
	// 		dtbs.offset(parseInt(skip as string));
	// 	}

	// 	const data = await dtbs
	// 		.withSchema(this.RESERVATION_SCHEMA)
	// 		.select(
	// 			"h.id",
	// 			"h.hotel_code",
	// 			"h.name",
	// 			"h.address",
	// 			"h.star_category",
	// 			"h.city_code",
	// 			"h.country_code",
	// 			"h.accommodation_type_id",
	// 			"h.accommodation_type_name",
	// 			"h.created_at",
	// 			"hcd.email",
	// 			"h.status",
	// 			"hcd.logo",
	// 			"h.expiry_date",
	// 			"h.created_at"
	// 		)
	// 		.leftJoin(
	// 			"hotel_contact_details as hcd",
	// 			"h.hotel_code",
	// 			"hcd.hotel_code"
	// 		)
	// 		.where(function () {
	// 			if (from_date && to_date) {
	// 				this.andWhereBetween("h.created_at", [from_date, endDate]);
	// 			}
	// 			if (name) {
	// 				this.andWhere("h.name", "like", `%${name}%`).orWhere(
	// 					"h.chain_name",
	// 					"like",
	// 					`%${name}%`
	// 				);
	// 			}
	// 			if (status) {
	// 				this.andWhere("hoi.status", status);
	// 			}
	// 		})
	// 		.orderBy("id", "desc");

	// 	const total = await this.db("hotels as h")
	// 		.withSchema(this.RESERVATION_SCHEMA)
	// 		.count("h.id AS total")
	// 		.where(function () {
	// 			if (from_date && to_date) {
	// 				this.andWhereBetween("h.created_at", [from_date, endDate]);
	// 			}
	// 			if (name) {
	// 				this.andWhere("h.name", "like", `%${name}%`).orWhere(
	// 					"h.chain_name",
	// 					"like",
	// 					`%${name}%`
	// 				);
	// 			}
	// 			if (status) {
	// 				this.andWhere("hoi.status", status);
	// 			}
	// 		});

	// 	return {
	// 		data,
	// 		total: total[0].total,
	// 	};
	// }

	// public async getHotelLastId() {
	// 	const hotels = await this.db("hotels")
	// 		.withSchema(this.RESERVATION_SCHEMA)
	// 		.select("id")
	// 		.limit(1)
	// 		.orderBy("id", "desc");

	// 	return hotels.length ? hotels[0].id : 1;
	// }

	// // get single hotel
	// public async getSingleHotel(payload: IsingleHotelUserPayload) {
	// 	const { id, email } = payload;
	// 	return await this.db("hotels as h")
	// 		.withSchema(this.RESERVATION_SCHEMA)
	// 		.select(
	// 			"h.id",
	// 			"h.hotel_code",
	// 			"h.name as hotel_name",
	// 			"h.address",
	// 			"h.star_category",
	// 			"h.city_code",
	// 			"h.country_code",
	// 			"h.accommodation_type_id",
	// 			"h.accommodation_type_name",
	// 			"h.created_at",
	// 			"h.latitude",
	// 			"h.longitude",
	// 			"h.chain_name",
	// 			"h.postal_code",
	// 			"h.description",
	// 			"h.star_category",
	// 			"h.created_at",
	// 			"h.status",
	// 			"h.expiry_date",
	// 			"h.created_at",
	// 			"hcd.logo",
	// 			"hcd.fax",
	// 			"hcd.website_url",
	// 			"hcd.email as hotel_email",
	// 			"hcd.phone"
	// 			// this.db.raw(
	// 			//   `(select json_agg(json_build_object('id')) from hotel_images as hi where h.hotel_code = )`
	// 			// )
	// 		)
	// 		.leftJoin(
	// 			"hotel_contact_details as hcd",
	// 			"h.hotel_code",
	// 			"hcd.hotel_code"
	// 		)
	// 		.where(function () {
	// 			if (id) {
	// 				this.andWhere("h.id", id);
	// 			}
	// 			if (email) {
	// 				this.andWhere("hcd.email", email);
	// 			}
	// 		});
	// }

	// // update hotel
	// public async updateHotel(
	// 	payload: any,
	// 	where: { id?: number; email?: string }
	// ) {
	// 	const { email, id } = where;
	// 	return await this.db("hotels")
	// 		.withSchema(this.RESERVATION_SCHEMA)
	// 		.update(payload)
	// 		.where(function () {
	// 			if (id) {
	// 				this.where({ id });
	// 			} else if (email) {
	// 				this.where({ email });
	// 			}
	// 		});
	// }

	// // delete hotel images
	// public async deleteHotelImage(payload: number[], hotel_code: number) {
	// 	return await this.db("hotel_images")
	// 		.withSchema(this.RESERVATION_SCHEMA)
	// 		.delete()
	// 		.whereIn("id", payload)
	// 		.andWhere("hotel_code", hotel_code);
	// }

	// // insert hotel amnities
	// public async insertHotelAmnities(
	// 	payload: { name: string; hotel_code: number }[]
	// ) {
	// 	return await this.db("hotel_aminities")
	// 		.withSchema(this.RESERVATION_SCHEMA)
	// 		.insert(payload);
	// }

	// // delete hotel amnities
	// public async deleteHotelAmnities(payload: [], hotel_code: number) {
	// 	return await this.db("hotel_aminities")
	// 		.withSchema(this.RESERVATION_SCHEMA)
	// 		.delete()
	// 		.whereIn("id", payload)
	// 		.andWhere("hotel_code", hotel_code);
	// }

	// // Get Hotel Account config
	// public async getHotelAccConfig(
	// 	hotel_code: number,
	// 	configs: string[]
	// ): Promise<
	// 	{ id: number; hotel_code: number; config: string; head_id: number }[]
	// > {
	// 	return await this.db("acc_head_config")
	// 		.withSchema(this.ACC_SCHEMA)
	// 		.select("*")
	// 		.andWhere("hotel_code", hotel_code)
	// 		.whereIn("config", configs);
	// }
}

export default UserModel;
