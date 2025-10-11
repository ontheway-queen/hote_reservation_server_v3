import {
  IGetRestaurantTables,
  IRestaurantTablePayload,
  IUpdateRestaurantTablePayload,
} from "../../appRestaurantAdmin/utils/interface/table.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class RestaurantTableModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createTable(payload: IRestaurantTablePayload) {
    return await this.db("restaurant_tables")
      .withSchema(this.RESTAURANT_SCHEMA)
      .insert(payload, "id");
  }

  public async getTables(query: {
    hotel_code: number;
    restaurant_id: number;
    limit?: number;
    skip?: number;
    id?: number;
    name?: string;
    category?: string;
    status?: string;
  }): Promise<{ data: IGetRestaurantTables[]; total: number }> {
    const baseQuery = this.db("restaurant_tables as rt")
      .withSchema(this.RESTAURANT_SCHEMA)
      .where("rt.hotel_code", query.hotel_code)
      .andWhere("rt.restaurant_id", query.restaurant_id)
      .andWhere("rt.is_deleted", false);

    if (query.id) {
      baseQuery.andWhere("rt.id", query.id);
    }
    if (query.name) {
      baseQuery.andWhereILike("rt.name", `%${query.name}%`);
    }
    if (query.category) {
      baseQuery.andWhere("rt.category", query.category);
    }
    if (query.status) {
      baseQuery.andWhere("rt.status", query.status);
    }

    const data = await baseQuery
      .clone()
      .select(
        "rt.id",
        "rt.hotel_code",
        "rt.restaurant_id",
        "rt.name",
        "rt.category",
        "rt.status",
        "rt.is_deleted"
      )
      .orderBy("rt.id", "desc")
      .limit(query.limit ?? 100)
      .offset(query.skip ?? 0);

    const countResult = await baseQuery
      .clone()
      .count<{ total: string }[]>("rt.id as total");

    const total = Number(countResult[0].total);

    return { total, data };
  }

  public async updateTable({
    id,
    payload,
  }: {
    id: number;
    payload: IUpdateRestaurantTablePayload;
  }) {
    return await this.db("restaurant_tables as rt")
      .withSchema(this.RESTAURANT_SCHEMA)
      .where("rt.id", id)
      .update(payload);
  }

  public async deleteTable(where: { id: number }) {
    return await this.db("restaurant_tables as rt")
      .withSchema(this.RESTAURANT_SCHEMA)
      .update({ is_deleted: true })
      .where("rt.id", where.id);
  }
}
export default RestaurantTableModel;
