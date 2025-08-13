import { Knex } from "knex";
import UserProfileModel from "./userProfileModel/userProfileModel";

export class BtocModel {
	private db: Knex;

	constructor(db: Knex) {
		this.db = db;
	}

	public UserProfileModel(trx?: Knex.Transaction) {
		return new UserProfileModel(trx || this.db);
	}
}
