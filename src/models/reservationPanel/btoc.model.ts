import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class DashBoardModel extends Schema {
	private db: TDB;
	constructor(db: TDB) {
		super();
		this.db = db;
	}

	// update hotel b2c site config
	public async updateSiteConfig({
		payload,
		id,
	}: {
		payload: any;
		id: number;
	}) {
		return await this.db("site_config")
			.withSchema(this.BTOC_SCHEMA)
			.update(payload)
			.where("id", id);
	}
}
export default DashBoardModel;
