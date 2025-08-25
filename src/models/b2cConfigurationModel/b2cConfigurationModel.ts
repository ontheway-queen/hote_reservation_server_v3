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

  // ======================== Service Content ================================ //
  public async createHotelServiceContent(payload: {
    hotel_code: number;
    title: string;
    description: string;
  }) {
    return await this.db("hotel_service_content")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  public async getSingleServiceContent(query: {
    hotel_code?: number;
    id?: number;
  }) {
    return await this.db("hotel_service_content")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .modify((qb) => {
        if (query.id) {
          qb.andWhere("id", query.id);
        }
        if (query.hotel_code) {
          qb.andWhere("hotel_code", query.hotel_code);
        }
      })
      .first();
  }

  public async getHotelServiceContentWithServices(query: {
    hotel_code?: number;
    search?: string;
    limit?: number;
    skip?: number;
    id?: number;
  }) {
    return await this.db("hotel_service_content as hsc")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "hsc.id",
        "hsc.hotel_code",
        "hsc.title",
        "hsc.description",
        this.db.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id', hs.id,
              'icon', hs.icon,
              'title', hs.title,
              'description', hs.description
            )
          ) FILTER (WHERE hs.id IS NOT NULL),
          '[]'
        ) as services
      `)
      )
      .leftJoin("hotel_services as hs", "hs.hotel_code", "hsc.hotel_code")
      .modify((qb) => {
        if (query.id) {
          qb.andWhere("hsc.id", query.id);
        }
        if (query.hotel_code) {
          qb.andWhere("hsc.hotel_code", query.hotel_code);
        }
      })
      .groupBy("hsc.id")
      .first();
  }

  public async updateServiceContent(
    payload: { title: string; description: string },
    query: { hotel_code: number }
  ) {
    return await this.db("hotel_service_content")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .modify((qb) => {
        if (query.hotel_code) {
          qb.andWhere("hotel_code", query.hotel_code);
        }
      });
  }

  // ======================== Services ================================ //
  public async createHotelService(payload: {
    title: string;
    description: string;
    icon: string;
  }) {
    return await this.db("hotel_services")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  public async getSingleService(query: { id?: number; title?: string }) {
    return await this.db("hotel_services")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .modify((qb) => {
        if (query.id) {
          qb.andWhere("id", query.id);
        }
        if (query.title) {
          qb.andWhere("title", "ilike", `%${query.title}%`);
        }
      })
      .first();
  }

  public async getAllServices(query: {
    title?: string;
    limit: number;
    skip: number;
  }): Promise<{
    data: {
      id: number;
      icon: string;
      title: string;
      description: string;
      is_deleted: boolean;
      created_at: string;
      updated_at: string;
    };
    total: number;
  }> {
    const qb = this.db("hotel_services")
      .withSchema(this.RESERVATION_SCHEMA)
      .modify((qb) => {
        if (query.title) {
          qb.andWhere("title", "ilike", `%${query.title}%`);
        }
      })
      .andWhere("is_deleted", false);

    const data = await qb
      .clone()
      .limit(query.limit)
      .offset(query.skip)
      .orderBy("id", "desc");

    const total = await qb.clone().count("* as count").first();

    return {
      data,
      total: Number(total?.count || 0),
    };
  }

  public async updateHotelService(
    payload: {
      icon: string;
      title: string;
      description: string;
      is_deleted?: boolean;
    },
    query: { id: number }
  ) {
    return await this.db("hotel_services")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where("id", query.id);
  }
}
