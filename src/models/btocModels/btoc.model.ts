import {
	IBtocUser,
	IBtocUserProfile,
	IBtocUserRegistration,
} from "../../btoc/utills/interfaces/user.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

export class BtocUserModel extends Schema {
	private db: TDB;
	constructor(db: TDB) {
		super();
		this.db = db;
	}

	// Check user
	public async checkUser(query: { email: string }): Promise<IBtocUser> {
		const { email } = query;
		return await this.db("users")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("email", email)
			.andWhere("is_deleted", false)
			.first();
	}

	// create user
	public async createUser(payload: IBtocUserRegistration) {
		return await this.db("users")
			.withSchema(this.BTOC_SCHEMA)
			.insert(payload)
			.returning(["id", "email"]);
	}

	// get profile
	public async getProfile(query: {
		id?: number;
		email?: string;
	}): Promise<IBtocUserProfile> {
		return await this.db("users as u")
			.withSchema(this.BTOC_SCHEMA)
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
			//   .joinRaw("LEFT JOIN ?? city ON city.city_code = u.city_id", [
			//     `${this.PUBLIC_SCHEMA}.${this.TABLES.city}`,
			//   ])
			//   .joinRaw("LEFT JOIN ?? country ON country.id = u.country_id", [
			//     `${this.PUBLIC_SCHEMA}.${this.TABLES.country}`,
			//   ])
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
			.withSchema(this.BTOC_SCHEMA)
			.modify((qb) => {
				if (id) qb.where("id", id);
				if (email) qb.where("email", email);
			})
			.update(payload)
			.returning("id");
	}
}
