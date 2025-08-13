import { Knex } from "knex";
import UserModel from "./userModel/userModel";

export class BtocModel {
	private db: Knex;

	constructor(db: Knex) {
		this.db = db;
	}

	public UserModel(trx?: Knex.Transaction) {
		return new UserModel(trx || this.db);
	}
}
