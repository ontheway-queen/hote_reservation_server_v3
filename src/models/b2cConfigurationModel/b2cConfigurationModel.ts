import {
	IGetHotDeals,
	IHeroBgContent,
	IHeroBgContentPayload,
	IHotDealsPayload,
	IPopularRoomType,
	IPopUpBanner,
	IPopUpBannerPayload,
	ISiteConfig,
	ISiteConfigPayload,
} from "../../appAdmin/utlis/interfaces/configuration.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

export default class B2cConfigurationModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async getSiteConfig(query: {
		hotel_code: number;
	}): Promise<ISiteConfig> {
		return await this.db("site_config")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", query.hotel_code)
			.first();
	}

	public async getPopUpBanner(query: {
		hotel_code: number;
	}): Promise<IPopUpBanner> {
		return await this.db("pop_up_banner")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", query.hotel_code)
			.first();
	}

	public async getHeroBgContent(query: {
		hotel_code: number;
		id?: number;
		order_number?: number;
	}): Promise<IHeroBgContent[]> {
		return await this.db("hero_bg_content")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", query.hotel_code)
			.modify((qb) => {
				if (query.id) {
					qb.andWhere("id", query.id);
				}
				if (query.order_number) {
					qb.andWhere("order_number", query.order_number);
				}
			});
	}

	public async getHotDeals(query: {
		hotel_code: number;
		id?: number;
		order_number?: number;
	}): Promise<IGetHotDeals[]> {
		return await this.db("hot_deals")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", query.hotel_code)
			.modify((qb) => {
				if (query.id) {
					qb.andWhere("id", query.id);
				}
				if (query.order_number) {
					qb.andWhere("order_number", query.order_number);
				}
			});
	}

	public async getSocialLinks(query: {
		hotel_code: number;
		id?: number;
		order_number?: number;
	}): Promise<IGetHotDeals[]> {
		return await this.db("social_links")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", query.hotel_code)
			.modify((qb) => {
				if (query.id) {
					qb.andWhere("id", query.id);
				}
				if (query.order_number) {
					qb.andWhere("order_number", query.order_number);
				}
			});
	}

	public async getPopularRoomTypes(query: {
		hotel_code: number;
		id?: number;
		order_number?: number;
	}): Promise<IPopularRoomType[]> {
		return await this.db("popular_room_types as prt")
			.withSchema(this.BTOC_SCHEMA)
			.select("prt.*", "rt.name", "rt.description")
			.joinRaw(`JOIN ?? as rt ON rt.id = prt.room_type_id`, [
				`${this.RESERVATION_SCHEMA}.${this.TABLES.room_types}`,
			])
			.where("prt.hotel_code", query.hotel_code)
			.modify((qb) => {
				if (query.id) {
					qb.andWhere("prt.id", query.id);
				}
				if (query.order_number) {
					qb.andWhere("prt.order_number", query.order_number);
				}
			});
	}

	public async updateSiteConfig({
		hotel_code,
		payload,
	}: {
		hotel_code: number;
		payload: ISiteConfigPayload;
	}) {
		return await this.db("site_config")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", hotel_code)
			.update(payload);
	}

	public async updatePopUpBanner({
		hotel_code,
		payload,
	}: {
		hotel_code: number;
		payload: IPopUpBannerPayload;
	}) {
		return await this.db("pop_up_banner")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", hotel_code)
			.update(payload);
	}

	public async updateHeroBgContent({
		hotel_code,
		id,
		payload,
	}: {
		hotel_code: number;
		id: number;
		payload: IHeroBgContentPayload;
	}) {
		return await this.db("hero_bg_content")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", hotel_code)
			.andWhere("id", id)
			.update(payload);
	}

	public async updateHotDeals({
		hotel_code,
		id,
		payload,
	}: {
		hotel_code: number;
		id: number;
		payload: IHotDealsPayload;
	}) {
		return await this.db("hot_deals")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", hotel_code)
			.andWhere("id", id)
			.update(payload);
	}

	public async updateSocialLinks({
		hotel_code,
		id,
		payload,
	}: {
		hotel_code: number;
		id: number;
		payload: IHeroBgContentPayload;
	}) {
		return await this.db("social_links")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", hotel_code)
			.andWhere("id", id)
			.update(payload);
	}

	public async updatePopularRoomTypes({
		hotel_code,
		id,
		payload,
	}: {
		hotel_code: number;
		id: number;
		payload: IHeroBgContentPayload;
	}) {
		return await this.db("popular_room_types")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", hotel_code)
			.andWhere("id", id)
			.update(payload);
	}
}
