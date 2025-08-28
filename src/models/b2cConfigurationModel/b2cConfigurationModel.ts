import {
	ICreateAgencyB2CHeroBgContentPayload,
	ICreateAgencyB2CHotDeals,
	ICreateAgencyB2CPopularDestinationPayload,
	ICreateAgencyB2CPopularPlace,
	ICreateAgencyB2CPopUpBanner,
	ICreateAgencyB2CSiteConfig,
	ICreateAgencyB2CSocialLinkPayload,
	IGetAgencyB2CHeroBgContentData,
	IGetAgencyB2CHeroBgContentQuery,
	IGetAgencyB2CHotDealsData,
	IGetAgencyB2CHotDealsQuery,
	IGetAgencyB2CPopularDestinationData,
	IGetAgencyB2CPopularDestinationLastNoData,
	IGetAgencyB2CPopularDestinationQuery,
	IGetAgencyB2CPopularPlaceData,
	IGetAgencyB2CPopularPlaceQuery,
	IGetAgencyB2CPopUpBannerData,
	IGetAgencyB2CPopUpBannerQuery,
	IGetAgencyB2CSiteConfigData,
	IGetAgencyB2CSocialLinkData,
	IGetAgencyB2CSocialLinkQuery,
	IGetSocialMediaData,
	IInsertSocialMedia,
	IUpdateAgencyB2CHeroBgContentPayload,
	IUpdateAgencyB2CHotDealsPayload,
	IUpdateAgencyB2CPopularDestinationPayload,
	IUpdateAgencyB2CPopularPlace,
	IUpdateAgencyB2CPopUpBannerPayload,
	IUpdateAgencyB2CSiteConfigPayload,
	IUpdateAgencyB2CSocialLinkPayload,
	IUpdateSocialMediaPayload,
} from "../../appAdmin/utlis/interfaces/configuration.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

export default class AgencyB2CConfigModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async insertHeroBGContent(
		payload:
			| ICreateAgencyB2CHeroBgContentPayload
			| ICreateAgencyB2CHeroBgContentPayload[]
	) {
		return await this.db("hero_bg_content")
			.withSchema(this.BTOC_SCHEMA)
			.insert(payload, "id");
	}

	public async getHeroBGContent(
		query: IGetAgencyB2CHeroBgContentQuery
	): Promise<IGetAgencyB2CHeroBgContentData[]> {
		return await this.db("hero_bg_content")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.orderBy("order_number", "asc")
			.andWhere("agency_id", query.agency_id)
			.where((qb) => {
				if (query.status !== undefined) {
					qb.andWhere("status", query.status);
				}
				if (query.type) {
					qb.andWhere("type", query.type);
				}
			});
	}

	public async checkHeroBGContent(query: {
		agency_id: number;
		id: number;
	}): Promise<IGetAgencyB2CHeroBgContentData[]> {
		return await this.db("hero_bg_content")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.orderBy("order_number", "asc")
			.andWhere("agency_id", query.agency_id)
			.andWhere("id", query.id);
	}

	public async getHeroBGContentLastNo(query: {
		agency_id: number;
	}): Promise<IGetAgencyB2CHeroBgContentData | null> {
		return await this.db("hero_bg_content")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("agency_id", query.agency_id)
			.orderBy("order_number", "desc")
			.first();
	}

	public async updateHeroBGContent(
		payload: IUpdateAgencyB2CHeroBgContentPayload,
		where: {
			agency_id: number;
			id: number;
		}
	) {
		return await this.db("hero_bg_content")
			.withSchema(this.BTOC_SCHEMA)
			.update(payload)
			.where("agency_id", where.agency_id)
			.where("id", where.id);
	}

	public async deleteHeroBGContent(where: { agency_id: number; id: number }) {
		return await this.db("hero_bg_content")
			.withSchema(this.BTOC_SCHEMA)
			.del()
			.where("agency_id", where.agency_id)
			.where("id", where.id);
	}

	public async insertPopularDestination(
		payload:
			| ICreateAgencyB2CPopularDestinationPayload
			| ICreateAgencyB2CPopularDestinationPayload[]
	) {
		return await this.db("popular_destination")
			.withSchema(this.BTOC_SCHEMA)
			.insert(payload);
	}

	public async getPopularDestination(
		query: IGetAgencyB2CPopularDestinationQuery
	): Promise<IGetAgencyB2CPopularDestinationData[]> {
		return await this.db("popular_destination AS pd")
			.withSchema(this.BTOC_SCHEMA)
			.select(
				"pd.*",
				"dc.name AS from_airport_country",
				"dci.name AS from_airport_city",
				"da.name AS from_airport_name",
				"da.iata_code AS from_airport_code",
				"aa.name AS to_airport_name",
				"aa.iata_code AS to_airport_code",
				"ac.name AS to_airport_country",
				"aci.name AS to_airport_city"
			)
			.joinRaw(
				`LEFT JOIN public.airport AS da ON pd.from_airport = da.id`
			)
			.joinRaw(`LEFT JOIN public.airport AS aa ON pd.to_airport = aa.id`)
			.joinRaw(`LEFT JOIN public.country AS dc ON da.country_id = dc.id`)
			.joinRaw(`LEFT JOIN public.country AS ac ON aa.country_id = ac.id`)
			.joinRaw(`LEFT JOIN public.city AS dci ON da.city = dci.id`)
			.joinRaw(`LEFT JOIN public.city AS aci ON aa.city = aci.id`)
			.orderBy("pd.order_number", "asc")
			.andWhere("pd.agency_id", query.agency_id)
			.where((qb) => {
				if (query.status !== undefined) {
					qb.andWhere("pd.status", query.status);
				}
			});
	}

	public async checkPopularDestination(query: {
		agency_id: number;
		id: number;
	}): Promise<IGetAgencyB2CPopularDestinationLastNoData | null> {
		return await this.db("popular_destination")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.orderBy("order_number", "asc")
			.andWhere("agency_id", query.agency_id)
			.andWhere("id", query.id)
			.first();
	}

	public async getPopularDestinationLastNo(query: {
		agency_id: number;
	}): Promise<IGetAgencyB2CPopularDestinationLastNoData | null> {
		return await this.db("popular_destination")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("agency_id", query.agency_id)
			.orderBy("order_number", "desc")
			.first();
	}

	public async updatePopularDestination(
		payload: IUpdateAgencyB2CPopularDestinationPayload,
		where: {
			agency_id: number;
			id: number;
		}
	) {
		return await this.db("popular_destination")
			.withSchema(this.BTOC_SCHEMA)
			.update(payload)
			.where("agency_id", where.agency_id)
			.where("id", where.id);
	}

	public async deletePopularDestination(where: {
		agency_id: number;
		id: number;
	}) {
		return await this.db("popular_destination")
			.withSchema(this.BTOC_SCHEMA)
			.del()
			.where("agency_id", where.agency_id)
			.where("id", where.id);
	}

	public async insertPopularPlaces(
		payload: ICreateAgencyB2CPopularPlace | ICreateAgencyB2CPopularPlace[]
	) {
		return await this.db("popular_places")
			.withSchema(this.BTOC_SCHEMA)
			.insert(payload);
	}

	public async getPopularPlaces(
		query: IGetAgencyB2CPopularPlaceQuery
	): Promise<IGetAgencyB2CPopularPlaceData[]> {
		return await this.db("popular_places AS pp")
			.withSchema(this.BTOC_SCHEMA)
			.select("pp.*", "c.name AS country_name")
			.joinRaw(`LEFT JOIN public.country AS c ON pp.country_id = c.id`)
			.orderBy("pp.order_number", "asc")
			.andWhere("pp.agency_id", query.agency_id)
			.where((qb) => {
				if (query.status !== undefined) {
					qb.andWhere("pp.status", query.status);
				}
			});
	}

	public async checkPopularPlace(query: {
		agency_id: number;
		id: number;
	}): Promise<IGetAgencyB2CPopularPlaceData | null> {
		return await this.db("popular_places")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.andWhere("agency_id", query.agency_id)
			.andWhere("id", query.id)
			.first();
	}

	public async getPopularPlaceLastNo(query: {
		agency_id: number;
	}): Promise<IGetAgencyB2CPopularPlaceData | null> {
		return await this.db("popular_places")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("agency_id", query.agency_id)
			.orderBy("order_number", "desc")
			.first();
	}

	public async updatePopularPlace(
		payload: IUpdateAgencyB2CPopularPlace,
		where: {
			agency_id: number;
			id: number;
		}
	) {
		return await this.db("popular_places")
			.withSchema(this.BTOC_SCHEMA)
			.update(payload)
			.where("agency_id", where.agency_id)
			.andWhere("id", where.id);
	}

	public async deletePopularPlace(where: { agency_id: number; id: number }) {
		return await this.db("popular_places")
			.withSchema(this.BTOC_SCHEMA)
			.del()
			.where("agency_id", where.agency_id)
			.where("id", where.id);
	}

	public async insertSiteConfig(payload: ICreateAgencyB2CSiteConfig) {
		return await this.db("site_config")
			.withSchema(this.BTOC_SCHEMA)
			.insert(payload);
	}

	public async getSiteConfig(query: {
		hotel_code: number;
	}): Promise<IGetAgencyB2CSiteConfigData | null> {
		return await this.db("site_config")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", query.hotel_code)
			.first();
	}

	public async updateConfig(
		payload: IUpdateAgencyB2CSiteConfigPayload,
		where: {
			hotel_code: number;
		}
	) {
		return await this.db("site_config")
			.withSchema(this.BTOC_SCHEMA)
			.update(payload)
			.where("hotel_code", where.hotel_code);
	}

	public async insertSocialLink(
		payload:
			| ICreateAgencyB2CSocialLinkPayload
			| ICreateAgencyB2CSocialLinkPayload[]
	) {
		return await this.db("social_links")
			.withSchema(this.BTOC_SCHEMA)
			.insert(payload, "id");
	}

	public async getSocialLink(
		query: IGetAgencyB2CSocialLinkQuery
	): Promise<IGetAgencyB2CSocialLinkData[]> {
		return await this.db("social_links AS sl")
			.withSchema(this.BTOC_SCHEMA)
			.select(
				"sl.id",
				"sl.link",
				"sl.status",
				"sl.order_number",
				"sl.social_media_id",
				"sm.name AS media",
				"sm.logo"
			)
			.joinRaw(
				`LEFT JOIN btoc.social_media AS sm ON sl.social_media_id = sm.id`
			)
			.orderBy("sl.order_number", "asc")
			.andWhere("sl.hotel_code", query.hotel_code)
			.where((qb) => {
				if (query.status !== undefined) {
					qb.andWhere("sl.status", query.status);
				}
			});
	}

	public async checkSocialLink(query: {
		hotel_code: number;
		id: number;
	}): Promise<IGetAgencyB2CSocialLinkData | null> {
		return await this.db("social_links")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.andWhere("hotel_code", query.hotel_code)
			.andWhere("id", query.id)
			.first();
	}

	public async getSocialLinkLastNo(query: {
		hotel_code: number;
	}): Promise<IGetAgencyB2CSocialLinkData | null> {
		return await this.db("social_links")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("hotel_code", query.hotel_code)
			.orderBy("order_number", "desc")
			.first();
	}

	public async checkSocialMedia(id: number): Promise<IGetSocialMediaData> {
		return await this.db("social_media")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("id", id)
			.first();
	}
	public async updateSocialLink(
		payload: IUpdateAgencyB2CSocialLinkPayload,
		where: {
			hotel_code: number;
			id: number;
		}
	) {
		return await this.db("social_links")
			.withSchema(this.BTOC_SCHEMA)
			.update(payload)
			.where("hotel_code", where.hotel_code)
			.andWhere("id", where.id);
	}

	public async deleteSocialLink(where: { hotel_code: number; id: number }) {
		return await this.db("social_links")
			.withSchema(this.BTOC_SCHEMA)
			.del()
			.where("hotel_code", where.hotel_code)
			.where("id", where.id);
	}

	public async insertHotDeals(
		payload: ICreateAgencyB2CHotDeals | ICreateAgencyB2CHotDeals[]
	) {
		return await this.db("hot_deals")
			.withSchema(this.BTOC_SCHEMA)
			.insert(payload);
	}

	public async getHotDeals(
		query: IGetAgencyB2CHotDealsQuery
	): Promise<IGetAgencyB2CHotDealsData[]> {
		return await this.db("hot_deals")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.orderBy("order_number", "asc")
			.andWhere("agency_id", query.agency_id)
			.where((qb) => {
				if (query.status !== undefined) {
					qb.andWhere("status", query.status);
				}
			});
	}

	public async checkHotDeals(query: {
		agency_id: number;
		id: number;
	}): Promise<IGetAgencyB2CHotDealsData | null> {
		return await this.db("hot_deals")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.andWhere("agency_id", query.agency_id)
			.andWhere("id", query.id)
			.first();
	}

	public async getHotDealsLastNo(query: {
		agency_id: number;
	}): Promise<IGetAgencyB2CHotDealsData | null> {
		return await this.db("hot_deals")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.where("agency_id", query.agency_id)
			.orderBy("order_number", "desc")
			.first();
	}

	public async updateHotDeals(
		payload: IUpdateAgencyB2CHotDealsPayload,
		where: {
			agency_id: number;
			id: number;
		}
	) {
		return await this.db("hot_deals")
			.withSchema(this.BTOC_SCHEMA)
			.update(payload)
			.where("agency_id", where.agency_id)
			.andWhere("id", where.id);
	}

	public async deleteHotDeals(where: { hotel_code: number; id: number }) {
		return await this.db("hot_deals")
			.withSchema(this.BTOC_SCHEMA)
			.del()
			.where("hotel_code", where.hotel_code)
			.where("id", where.id);
	}

	public async insertSocialMedias(payload: IInsertSocialMedia) {
		return await this.db("social_media")
			.withSchema(this.PUBLIC_SCHEMA)
			.insert(payload, "id");
	}

	public async updateSocialMedia(
		payload: IUpdateSocialMediaPayload,
		id: number
	) {
		return await this.db("social_media")
			.withSchema(this.PUBLIC_SCHEMA)
			.update(payload)
			.where("id", id);
	}

	public async getSocialMedia(query: {
		name?: string;
		id?: number;
		status?: boolean | "true" | "false";
	}): Promise<IGetSocialMediaData[]> {
		console.log({ query });
		return await this.db("social_media")
			.withSchema(this.PUBLIC_SCHEMA)
			.select("*")
			.where((qb) => {
				if (query.name) {
					qb.andWhereILike("name", `%${query.name}%`);
				}

				if (query.id) {
					qb.andWhere("id", query.id);
				}

				if (query.status !== undefined) {
					qb.andWhere("status", query.status);
				}
			});
	}

	public async insertPopUpBanner(
		payload: ICreateAgencyB2CPopUpBanner | ICreateAgencyB2CPopUpBanner[]
	) {
		return await this.db("pop_up_banner")
			.withSchema(this.BTOC_SCHEMA)
			.insert(payload);
	}

	public async getPopUpBanner(
		query: IGetAgencyB2CPopUpBannerQuery
	): Promise<IGetAgencyB2CPopUpBannerData[]> {
		return await this.db("pop_up_banner")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.andWhere("hotel_code", query.hotel_code)
			.where((qb) => {
				if (query.status !== undefined) {
					qb.andWhere("status", query.status);
				}
				if (query.pop_up_for) {
					qb.andWhere("pop_up_for", query.pop_up_for);
				}
			});
	}

	public async getSinglePopUpBanner(query: {
		agency_id: number;
		status: boolean;
	}): Promise<IGetAgencyB2CPopUpBannerData | null> {
		return await this.db("pop_up_banner")
			.withSchema(this.BTOC_SCHEMA)
			.select("*")
			.andWhere("agency_id", query.agency_id)
			.andWhere("status", query.status)
			.first();
	}

	public async updatePopUpBanner(
		payload: IUpdateAgencyB2CPopUpBannerPayload,
		where: {
			hotel_code: number;
		}
	) {
		return await this.db("pop_up_banner")
			.withSchema(this.BTOC_SCHEMA)
			.update(payload)
			.where("hotel_code", where.hotel_code);
	}

	public async deletePopUpBanner(where: { agency_id: number; id: number }) {
		return await this.db("pop_up_banner")
			.withSchema(this.BTOC_SCHEMA)
			.del()
			.where("agency_id", where.agency_id)
			.where("id", where.id);
	}

	// =========================== FAQ =========================== //
	public async getAllFaqHeads(where: {
		hotel_code: number;
		id?: number;
		order?: number;
	}) {
		return await this.db("faq_heads")
			.withSchema(this.RESERVATION_SCHEMA)
			.select("id", "order_number", "title")
			.where("hotel_code", where.hotel_code)
			.andWhere((qb) => {
				if (where.id) {
					qb.andWhere("id", where.id);
				}
				if (where.order) {
					qb.andWhere("order_number", where.order);
				}
			})
			.andWhere("is_deleted", false);
	}

	public async createFaqHead(payload: {
		hotel_code: number;
		title: string;
		order_number: number;
	}) {
		return await this.db("faq_heads")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	public async updateFaqHead(
		payload: {
			title: string;
			order_number: number;
		},
		where: { id: number }
	) {
		return await this.db("faq_heads")
			.withSchema(this.RESERVATION_SCHEMA)
			.update(payload)
			.where("id", where.id);
	}

	public async deleteFaqHead(where: { id: number }) {
		return await this.db("faq_heads")
			.withSchema(this.RESERVATION_SCHEMA)
			.update("is_deleted", "true")
			.where("id", where.id);
	}

	public async createFaq(payload: {
		faq_head_id: number;
		question: string;
		answer: string;
		order_number: number;
	}) {
		return await this.db("faqs")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	public async getFaqsByHeadId(head_id: number) {
		return await this.db("faqs")
			.select("*")
			.withSchema(this.RESERVATION_SCHEMA)
			.where("faq_head_id", head_id);
	}

	// =========================== Hotel Amenities =========================== //
	public async addHotelAmenities(
		payload: {
			hotel_code: number;
			amenity_id: number;
		}[]
	) {
		return await this.db("hotel_amenities")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	public async getAllHotelAmenities(hotel_code: number) {
		return await this.db("hotel_amenities as ha")
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"a.id",
				"ha.hotel_code",
				"a.head_id",
				"a.name",
				"a.description",
				"a.icon",
				"a.status"
			)
			.join("amenities as a", "a.id", "ha.amenity_id")
			.where("hotel_code", hotel_code)
			.andWhere("is_deleted", false);
	}
}
