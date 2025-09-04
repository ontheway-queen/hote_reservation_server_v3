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
import {
  IFaqHeadsWithFaq,
  IgetFaqsByHeadId,
  IgetSingleFaqHeads,
} from "../../appAdmin/utlis/interfaces/faq.types";
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
    query: IGetAgencyB2CHeroBgContentQuery,
    with_total: boolean = false
  ): Promise<{ data: IGetAgencyB2CHeroBgContentData[]; total?: number }> {
    const data = await this.db("hero_bg_content")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .orderBy("order_number", "asc")
      .andWhere("hotel_code", query.hotel_code)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere("status", query.status);
        }
        if (query.type) {
          qb.andWhere("type", query.type);
        }
      })
      .limit(query.limit ? parseInt(query.limit) : 100)
      .offset(query.skip ? parseInt(query.skip) : 0);

    let total: any[] = [];
    if (with_total) {
      total = await this.db("hero_bg_content")
        .withSchema(this.BTOC_SCHEMA)
        .count("id AS total")
        .andWhere("hotel_code", query.hotel_code)
        .where((qb) => {
          if (query.status !== undefined) {
            qb.andWhere("status", query.status);
          }
          if (query.type) {
            qb.andWhere("type", query.type);
          }
        });
    }

    return { data, total: Number(total[0]?.total) || 0 };
  }

  public async checkHeroBGContent(query: {
    hotel_code: number;
    id: number;
  }): Promise<IGetAgencyB2CHeroBgContentData[]> {
    return await this.db("hero_bg_content")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .orderBy("order_number", "asc")
      .andWhere("hotel_code", query.hotel_code)
      .andWhere("id", query.id);
  }

  public async getHeroBGContentLastNo(query: {
    hotel_code: number;
  }): Promise<IGetAgencyB2CHeroBgContentData | null> {
    return await this.db("hero_bg_content")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .where("hotel_code", query.hotel_code)
      .orderBy("order_number", "desc")
      .first();
  }

  public async updateHeroBGContent(
    payload: IUpdateAgencyB2CHeroBgContentPayload,
    where: {
      hotel_code: number;
      id: number;
    }
  ) {
    return await this.db("hero_bg_content")
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where("hotel_code", where.hotel_code)
      .where("id", where.id);
  }

  public async deleteHeroBGContent(where: { hotel_code: number; id: number }) {
    return await this.db("hero_bg_content")
      .withSchema(this.BTOC_SCHEMA)
      .del()
      .where("hotel_code", where.hotel_code)
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
      .joinRaw(`LEFT JOIN public.airport AS da ON pd.from_airport = da.id`)
      .joinRaw(`LEFT JOIN public.airport AS aa ON pd.to_airport = aa.id`)
      .joinRaw(`LEFT JOIN public.country AS dc ON da.country_id = dc.id`)
      .joinRaw(`LEFT JOIN public.country AS ac ON aa.country_id = ac.id`)
      .joinRaw(`LEFT JOIN public.city AS dci ON da.city = dci.id`)
      .joinRaw(`LEFT JOIN public.city AS aci ON aa.city = aci.id`)
      .orderBy("pd.order_number", "asc")
      .andWhere("pd.hotel_code", query.hotel_code)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere("pd.status", query.status);
        }
      });
  }

  public async checkPopularDestination(query: {
    hotel_code: number;
    id: number;
  }): Promise<IGetAgencyB2CPopularDestinationLastNoData | null> {
    return await this.db("popular_destination")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .orderBy("order_number", "asc")
      .andWhere("hotel_code", query.hotel_code)
      .andWhere("id", query.id)
      .first();
  }

  public async getPopularDestinationLastNo(query: {
    hotel_code: number;
  }): Promise<IGetAgencyB2CPopularDestinationLastNoData | null> {
    return await this.db("popular_destination")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .where("hotel_code", query.hotel_code)
      .orderBy("order_number", "desc")
      .first();
  }

  public async updatePopularDestination(
    payload: IUpdateAgencyB2CPopularDestinationPayload,
    where: {
      hotel_code: number;
      id: number;
    }
  ) {
    return await this.db("popular_destination")
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where("hotel_code", where.hotel_code)
      .where("id", where.id);
  }

  public async deletePopularDestination(where: {
    hotel_code: number;
    id: number;
  }) {
    return await this.db("popular_destination")
      .withSchema(this.BTOC_SCHEMA)
      .del()
      .where("hotel_code", where.hotel_code)
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
      .andWhere("pp.hotel_code", query.hotel_code)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere("pp.status", query.status);
        }
      });
  }

  public async checkPopularPlace(query: {
    hotel_code: number;
    id: number;
  }): Promise<IGetAgencyB2CPopularPlaceData | null> {
    return await this.db("popular_places")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .andWhere("hotel_code", query.hotel_code)
      .andWhere("id", query.id)
      .first();
  }

  public async getPopularPlaceLastNo(query: {
    hotel_code: number;
  }): Promise<IGetAgencyB2CPopularPlaceData | null> {
    return await this.db("popular_places")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .where("hotel_code", query.hotel_code)
      .orderBy("order_number", "desc")
      .first();
  }

  public async updatePopularPlace(
    payload: IUpdateAgencyB2CPopularPlace,
    where: {
      hotel_code: number;
      id: number;
    }
  ) {
    return await this.db("popular_places")
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where("hotel_code", where.hotel_code)
      .andWhere("id", where.id);
  }

  public async deletePopularPlace(where: { hotel_code: number; id: number }) {
    return await this.db("popular_places")
      .withSchema(this.BTOC_SCHEMA)
      .del()
      .where("hotel_code", where.hotel_code)
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
    query: IGetAgencyB2CSocialLinkQuery,
    with_total: boolean = false
  ): Promise<{ data: IGetAgencyB2CSocialLinkData[]; total?: number }> {
    const data = await this.db("social_links AS sl")
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

      .leftJoin("social_media AS sm", "sl.social_media_id", "sm.id")
      .orderBy("sl.order_number", "asc")
      .andWhere("sl.hotel_code", query.hotel_code)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere("sl.status", query.status);
        }
      })
      .limit(query.limit ? parseInt(query.limit) : 100)
      .offset(query.skip ? parseInt(query.skip) : 0);

    let total: any[] = [];

    if (with_total) {
      total = await this.db("social_links")
        .withSchema(this.BTOC_SCHEMA)
        .count("id AS total")
        .andWhere("hotel_code", query.hotel_code)
        .where((qb) => {
          if (query.status !== undefined) {
            qb.andWhere("status", query.status);
          }
        });
    }

    return { data, total: Number(total[0]?.total) || 0 };
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
    query: IGetAgencyB2CHotDealsQuery,
    with_total: boolean = false
  ): Promise<{ data: IGetAgencyB2CHotDealsData[]; total?: number }> {
    const data = await this.db("hot_deals")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .orderBy("order_number", "asc")
      .andWhere("hotel_code", query.hotel_code)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere("status", query.status);
        }
      });

    let total: any[] = [];
    if (with_total) {
      total = await this.db("hot_deals")
        .withSchema(this.BTOC_SCHEMA)
        .count("id AS total")
        .andWhere("hotel_code", query.hotel_code)
        .where((qb) => {
          if (query.status !== undefined) {
            qb.andWhere("status", query.status);
          }
        });
    }

    return { data, total: Number(total[0]?.total) || 0 };
  }

  public async checkHotDeals(query: {
    hotel_code: number;
    id: number;
  }): Promise<IGetAgencyB2CHotDealsData | null> {
    return await this.db("hot_deals")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .andWhere("hotel_code", query.hotel_code)
      .andWhere("id", query.id)
      .first();
  }

  public async getHotDealsLastNo(query: {
    hotel_code: number;
  }): Promise<IGetAgencyB2CHotDealsData | null> {
    return await this.db("hot_deals")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .where("hotel_code", query.hotel_code)
      .orderBy("order_number", "desc")
      .first();
  }

  public async updateHotDeals(
    payload: IUpdateAgencyB2CHotDealsPayload,
    where: {
      hotel_code: number;
      id: number;
    }
  ) {
    return await this.db("hot_deals")
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where("hotel_code", where.hotel_code)
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
      });
  }

  public async getSinglePopUpBanner(query: {
    hotel_code: number;
    status: boolean;
  }): Promise<IGetAgencyB2CPopUpBannerData | null> {
    return await this.db("pop_up_banner")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .andWhere("hotel_code", query.hotel_code)
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

  public async deletePopUpBanner(where: { hotel_code: number; id: number }) {
    return await this.db("pop_up_banner")
      .withSchema(this.BTOC_SCHEMA)
      .del()
      .where("hotel_code", where.hotel_code)
      .where("id", where.id);
  }

  // =========================== FAQ =========================== //
  public async getAllFaqHeads(where: {
    hotel_code: number;
    order?: number;
  }): Promise<IFaqHeadsWithFaq[]> {
    return await this.db("faq_heads as fh")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        "fh.id",
        "fh.order_number",
        "fh.title",
        this.db.raw(`
        COALESCE(
          (
            SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'faq_id', fq.id,
                'question', fq.question,
                'answer', fq.answer,
                'order_number', fq.order_number,
                'status', fq.status
              ) ORDER BY fq.order_number ASC
            )
            FROM btoc.faqs fq
            WHERE fq.faq_head_id = fh.id
              AND fq.is_deleted = false
          ), '[]'::json
        ) AS faqs
      `)
      )
      .where("fh.hotel_code", where.hotel_code)
      .andWhere((qb) => {
        if (where.order) {
          qb.andWhere("fh.order_number", where.order);
        }
      })
      .andWhere("fh.is_deleted", false)
      .groupBy("fh.id", "fh.order_number", "fh.title")
      .orderBy("fh.order_number", "asc");
  }

  public async getSingleFaqHeads(
    id: number,
    hotel_code: number
  ): Promise<IgetSingleFaqHeads> {
    return await this.db("faq_heads")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        "id",
        "hotel_code",
        "title",
        "order_number",
        "status",
        "created_at"
      )
      .where({ id })
      .andWhere({ hotel_code })
      .andWhere("is_deleted", false)
      .first();
  }

  public async createFaqHead(payload: {
    hotel_code: number;
    title: string;
    order_number: number;
  }) {
    console.log({ payload });
    return await this.db("faq_heads")
      .withSchema(this.BTOC_SCHEMA)
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
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where("id", where.id);
  }

  public async deleteFaqHead(where: { id: number }) {
    return await this.db("faq_heads")
      .withSchema(this.BTOC_SCHEMA)
      .update("is_deleted", "true")
      .where("id", where.id);
  }

  public async createFaq(payload: {
    faq_head_id: number;
    question: string;
    answer: string;
    order_number: number;
    hotel_code: number;
  }) {
    return await this.db("faqs")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, "id");
  }

  public async updateFaq(
    payload: Partial<{
      question: string;
      answer: string;
      order_number: number;
      is_deleted: boolean;
    }>,
    where: { id: number; hotel_code: number }
  ) {
    return await this.db("faqs")
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where(where);
  }

  public async getFaqsByHeadId(
    head_id: number,
    hotel_code: number
  ): Promise<IgetFaqsByHeadId[]> {
    return await this.db("faqs")
      .select(
        "id",
        "question",
        "answer",
        "order_number",
        "status",
        "created_at"
      )
      .withSchema(this.BTOC_SCHEMA)
      .where("faq_head_id", head_id)
      .andWhere("is_deleted", false)
      .andWhere("hotel_code", hotel_code);
  }

  public async getSingleFaq(faq_id: number, hotel_code: number) {
    return await this.db("faqs")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .where({ id: faq_id })
      .andWhere({ hotel_code });
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

  public async getAllHotelAmenities(hotel_code: number): Promise<
    {
      id: number;
      hotel_code: number;
      head_id: number;
      name: string;
      description: string;
      icon: string;
      status: string;
    }[]
  > {
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

  public async getAllHotelImages({
    hotel_code,
  }: {
    hotel_code: number;
  }): Promise<
    {
      id: number;
      hotel_code: number;
      image_url: string;
      image_caption: string;
      main_image: string;
      image_type: string;
      is_deleted: boolean;
    }[]
  > {
    return await this.db("hotel_image as hi")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "hi.id",
        "hi.hotel_code",
        "hi.image_url",
        "hi.image_caption",
        "hi.main_image",
        "hi.image_type",
        "hi.is_deleted"
      )
      .where("hotel_code", hotel_code)
      .andWhere("is_deleted", false);
  }
}
