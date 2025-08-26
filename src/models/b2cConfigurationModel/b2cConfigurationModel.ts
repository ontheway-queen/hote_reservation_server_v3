import {
  ICreateHotelB2CHeroBgContentPayload,
  ICreateHotelB2CHotDeals,
  ICreateHotelB2CPopularDestinationPayload,
  ICreateHotelB2CPopularPlace,
  ICreateHotelB2CPopUpBanner,
  ICreateHotelB2CSiteConfig,
  ICreateHotelB2CSocialLinkPayload,
  IGetHotelB2CHeroBgContentData,
  IGetHotelB2CHeroBgContentQuery,
  IGetHotelB2CHotDealsData,
  IGetHotelB2CHotDealsQuery,
  IGetHotelB2CPopularDestinationData,
  IGetHotelB2CPopularDestinationLastNoData,
  IGetHotelB2CPopularDestinationQuery,
  IGetHotelB2CPopularPlaceData,
  IGetHotelB2CPopularPlaceQuery,
  IGetHotelB2CPopUpBannerData,
  IGetHotelB2CPopUpBannerQuery,
  IGetHotelB2CSocialLinkData,
  IGetHotelB2CSocialLinkQuery,
  IGetHotelB2CSiteConfigData,
  IGetSocialMediaData,
  IInsertSocialMedia,
  IUpdateHotelB2CHeroBgContentPayload,
  IUpdateHotelB2CHotDealsPayload,
  IUpdateHotelB2CPopularDestinationPayload,
  IUpdateHotelB2CPopularPlace,
  IUpdateHotelB2CPopUpBannerPayload,
  IUpdateHotelB2CSocialLinkPayload,
  IUpdateHotelB2CSiteConfigPayload,
  IUpdateSocialMediaPayload,
} from "../../appAdmin/utlis/interfaces/configuration.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

export default class HotelB2CConfigModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertHeroBGContent(
    payload:
      | ICreateHotelB2CHeroBgContentPayload
      | ICreateHotelB2CHeroBgContentPayload[]
  ) {
    return await this.db("hero_bg_content")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, "id");
  }

  public async getHeroBGContent(
    query: IGetHotelB2CHeroBgContentQuery
  ): Promise<IGetHotelB2CHeroBgContentData[]> {
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
  }): Promise<IGetHotelB2CHeroBgContentData[]> {
    return await this.db("hero_bg_content")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .orderBy("order_number", "asc")
      .andWhere("agency_id", query.agency_id)
      .andWhere("id", query.id);
  }

  public async getHeroBGContentLastNo(query: {
    agency_id: number;
  }): Promise<IGetHotelB2CHeroBgContentData | null> {
    return await this.db("hero_bg_content")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .where("agency_id", query.agency_id)
      .orderBy("order_number", "desc")
      .first();
  }

  public async updateHeroBGContent(
    payload: IUpdateHotelB2CHeroBgContentPayload,
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

  public async checkPopularPlace(query: {
    agency_id: number;
    id: number;
  }): Promise<IGetHotelB2CPopularPlaceData | null> {
    return await this.db("popular_places")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .andWhere("agency_id", query.agency_id)
      .andWhere("id", query.id)
      .first();
  }

  public async getPopularPlaceLastNo(query: {
    agency_id: number;
  }): Promise<IGetHotelB2CPopularPlaceData | null> {
    return await this.db("popular_places")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .where("agency_id", query.agency_id)
      .orderBy("order_number", "desc")
      .first();
  }

  public async updatePopularPlace(
    payload: IUpdateHotelB2CPopularPlace,
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

  public async insertSiteConfig(payload: ICreateHotelB2CSiteConfig) {
    return await this.db("site_config")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload);
  }

  public async getSiteConfig(query: {
    hotel_code: number;
  }): Promise<IGetHotelB2CSiteConfigData | null> {
    return await this.db("site_config")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .where("hotel_code", query.hotel_code)
      .first();
  }

  public async updateConfig(
    payload: IUpdateHotelB2CSiteConfigPayload,
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
      | ICreateHotelB2CSocialLinkPayload
      | ICreateHotelB2CSocialLinkPayload[]
  ) {
    return await this.db("social_links")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, "id");
  }

  public async getSocialLink(
    query: IGetHotelB2CSocialLinkQuery
  ): Promise<IGetHotelB2CSocialLinkData[]> {
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
  }): Promise<IGetHotelB2CSocialLinkData | null> {
    return await this.db("social_links")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .andWhere("hotel_code", query.hotel_code)
      .andWhere("id", query.id)
      .first();
  }

  public async getSocialLinkLastNo(query: {
    hotel_code: number;
  }): Promise<IGetHotelB2CSocialLinkData | null> {
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
    payload: IUpdateHotelB2CSocialLinkPayload,
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
    payload: ICreateHotelB2CHotDeals | ICreateHotelB2CHotDeals[]
  ) {
    return await this.db("hot_deals")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload);
  }

  public async getHotDeals(
    query: IGetHotelB2CHotDealsQuery
  ): Promise<IGetHotelB2CHotDealsData[]> {
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
  }): Promise<IGetHotelB2CHotDealsData | null> {
    return await this.db("hot_deals")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .andWhere("agency_id", query.agency_id)
      .andWhere("id", query.id)
      .first();
  }

  public async getHotDealsLastNo(query: {
    agency_id: number;
  }): Promise<IGetHotelB2CHotDealsData | null> {
    return await this.db("hot_deals")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .where("agency_id", query.agency_id)
      .orderBy("order_number", "desc")
      .first();
  }

  public async updateHotDeals(
    payload: IUpdateHotelB2CHotDealsPayload,
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
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, "id");
  }

  public async updateSocialMedia(
    payload: IUpdateSocialMediaPayload,
    id: number
  ) {
    return await this.db("social_media")
      .withSchema(this.BTOC_SCHEMA)
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
      .withSchema(this.BTOC_SCHEMA)
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
    payload: ICreateHotelB2CPopUpBanner | ICreateHotelB2CPopUpBanner[]
  ) {
    return await this.db("pop_up_banner")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload);
  }

  public async getPopUpBanner(
    query: IGetHotelB2CPopUpBannerQuery
  ): Promise<IGetHotelB2CPopUpBannerData[]> {
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
  }): Promise<IGetHotelB2CPopUpBannerData | null> {
    return await this.db("pop_up_banner")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .andWhere("agency_id", query.agency_id)
      .andWhere("status", query.status)
      .first();
  }

  public async updatePopUpBanner(
    payload: IUpdateHotelB2CPopUpBannerPayload,
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
}
