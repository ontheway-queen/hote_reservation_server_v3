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
    const data = await this.db("restaurant_tables as rt")
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        "rt.id",
        "rt.hotel_code",
        "rt.restaurant_id",
        "rt.name",
        "f.floor_no",
        "rt.floor_id",
        "rt.status",
        "rt.is_deleted",
        "rt.capacity",
        this.db.raw(`
      (
        SELECT 
          rt.capacity - COALESCE(SUM(o.id), 0)
        FROM hotel_restaurant.orders AS o
        WHERE 
          o.table_id = rt.id 
      
      ) AS available_capacity
    `)
      )
      .joinRaw(
        "left join hotel_reservation.floors as f on rt.floor_id = f.id and rt.hotel_code = f.hotel_code"
      )
      .where("rt.hotel_code", query.hotel_code)
      .andWhere("rt.restaurant_id", query.restaurant_id)
      .andWhere("rt.is_deleted", false)
      .andWhere(function () {
        if (query.id) {
          this.andWhere("rt.id", query.id);
        }
        if (query.name) {
          this.andWhereILike("rt.name", `%${query.name}%`);
        }

        if (query.status) {
          this.andWhere("rt.status", query.status);
        }
      })
      .orderBy("rt.id", "desc")
      .limit(query.limit ?? 100)
      .offset(query.skip ?? 0);

    const total = await this.db("restaurant_tables as rt")
      .withSchema(this.RESTAURANT_SCHEMA)
      .count("rt.id as total")
      .where("rt.hotel_code", query.hotel_code)
      .andWhere("rt.restaurant_id", query.restaurant_id)
      .andWhere("rt.is_deleted", false)
      .andWhere(function () {
        if (query.id) {
          this.andWhere("rt.id", query.id);
        }
        if (query.name) {
          this.andWhereILike("rt.name", `%${query.name}%`);
        }

        if (query.status) {
          this.andWhere("rt.status", query.status);
        }
      });

    return { total: total[0].total as number, data };
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
