import { IOrderInfo } from "../../appRestaurantAdmin/utils/interface/report.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class RestaurantReportModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async getOrderInfo(query: {
    hotel_code: number;
    restaurant_id: number;
  }): Promise<IOrderInfo> {
    const { hotel_code, restaurant_id } = query;

    const result = await this.db
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        this.db.raw(`
      COALESCE(SUM(o.grand_total), 0) AS "lifeTimeSales",
      COUNT(o.id) AS "lifeTimeSalesCount",

      COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN o.grand_total END), 0) AS "todaySales",
      COUNT(CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN 1 END) AS "todaySalesCount",

      COALESCE(SUM(CASE 
        WHEN DATE_PART('week', o.created_at) = DATE_PART('week', CURRENT_DATE)
         AND DATE_PART('year', o.created_at) = DATE_PART('year', CURRENT_DATE)
        THEN o.grand_total END), 0) AS "weeklySales",
      COUNT(CASE 
        WHEN DATE_PART('week', o.created_at) = DATE_PART('week', CURRENT_DATE)
         AND DATE_PART('year', o.created_at) = DATE_PART('year', CURRENT_DATE)
        THEN 1 END) AS "weeklySalesCount",

      COALESCE(SUM(CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE)
        THEN o.grand_total END), 0) AS "monthlySales",
      COUNT(CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE)
        THEN 1 END) AS "monthlySalesCount",

      COALESCE(SUM(CASE WHEN DATE_PART('year', o.created_at) = DATE_PART('year', CURRENT_DATE)
        THEN o.grand_total END), 0) AS "yearlySales",
      COUNT(CASE WHEN DATE_PART('year', o.created_at) = DATE_PART('year', CURRENT_DATE)
        THEN 1 END) AS "yearlySalesCount"
    `)
      )
      .from("orders as o")
      .where({ hotel_code, restaurant_id })
      .andWhere("o.status", "completed")
      .first();

    return result;
  }

  public async getDailyOrderCounts(query: {
    hotel_code: number;
    restaurant_id: number;
    to_date: string;
    from_date: string;
  }): Promise<{ dates: string[]; counts: number[] }> {
    const { hotel_code, restaurant_id, to_date, from_date } = query;

    const result = await this.db
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        this.db.raw(`
        TO_CHAR(gs.date::date, 'YYYY-MM-DD') AS "date",
        COUNT(o.id) AS "count"
      `)
      )
      .fromRaw(
        `
      generate_series(
        '${from_date}'::date,
        '${to_date}'::date,
        interval '1 day'
      ) AS gs(date)
      LEFT JOIN hotel_restaurant.orders o
        ON DATE(o.created_at) = gs.date
        AND o.hotel_code = ${hotel_code}
        AND o.restaurant_id = ${restaurant_id}
        AND o.status = 'completed'
    `
      )
      .groupBy("gs.date")
      .orderBy("gs.date");

    const dates = result.map((r: any) => r.date);
    const counts = result.map((r: any) => Number(r.count));

    return {
      dates,
      counts,
    };
  }

  public async getHourlyOrders(query: {
    from_date: string;
    to_date: string;
    hotel_code: number;
    restaurant_id: number;
  }) {
    const { from_date, to_date, hotel_code, restaurant_id } = query;

    const result = await this.db
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        this.db.raw(`
				hour_series.hour AS hour,
				COALESCE(o_count.order_count, 0) AS order_count
			`)
      )
      .from(
        this.db.raw(
          `
				(SELECT generate_series(00.00, 23.00) AS hour) AS hour_series
				LEFT JOIN (
					SELECT EXTRACT(HOUR FROM created_at) AS hour,
						   COUNT(id) AS order_count
					FROM hotel_restaurant.orders
					WHERE created_at::date BETWEEN ? AND ?
					  AND hotel_code = ?
					  AND restaurant_id = ?
					  AND status = 'completed'
					GROUP BY EXTRACT(HOUR FROM created_at)
				) AS o_count
				ON hour_series.hour = o_count.hour
			`,
          [from_date, to_date, hotel_code, restaurant_id]
        )
      )
      .orderBy("hour_series.hour");

    const hourlyOrders: Record<string, number> = {};
    let totalOrders = 0;

    result.forEach((row) => {
      if (Number(row.order_count) > 0) {
        hourlyOrders[row.hour] = Number(row.order_count);
        totalOrders += Number(row.order_count);
      }
    });

    return {
      total: totalOrders,
      data: hourlyOrders,
    };
  }

  public async getProductsReport(query: {
    hotel_code: number;
    restaurant_id: number;
    from_date: string;
    to_date: string;
  }): Promise<
    {
      food_id: number;
      food_name: string;
      total_sold_quantity: number;
    }[]
  > {
    const { hotel_code, restaurant_id, from_date, to_date } = query;

    const db = this.db;

    const result = await db
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        "f.id as food_id",
        "f.name as food_name",
        "mc.name as category_name",
        db.raw(`COALESCE(SUM(oi.quantity), 0) AS total_sold_quantity`),
        this.db.raw(
          "COALESCE(SUM(oi.quantity * oi.rate), 0) as total_sales_amount"
        )
      )
      .from("foods as f")
      .leftJoin("order_items as oi", function () {
        this.on("oi.food_id", "=", "f.id").andOn(
          "oi.is_deleted",
          "=",
          db.raw("false")
        );
      })
      .leftJoin("orders as o", function () {
        this.on("o.id", "=", "oi.order_id")
          .andOn("o.status", "=", db.raw(`'completed'`))
          .andOn("o.hotel_code", "=", db.raw("?", [hotel_code]))
          .andOn("o.restaurant_id", "=", db.raw("?", [restaurant_id]));
      })
      .leftJoin("menu_categories as mc", "f.menu_category_id", "mc.id")
      .where("f.hotel_code", hotel_code)
      .andWhere("f.restaurant_id", restaurant_id)
      .andWhere(function () {
        if (from_date && to_date) {
          const endDate = new Date(
            new Date(to_date).setDate(new Date(to_date).getDate() + 1)
          );

          this.whereRaw(`o.created_at::date BETWEEN ? AND ?`, [
            from_date,
            to_date,
          ]);
        }
      })
      .groupBy("f.id", "f.name", "mc.name")
      .orderBy("total_sold_quantity", "desc");

    return result;
  }

  public async getSalesChart(query: {
    from_date: string;
    to_date: string;
    hotel_code: number;
    restaurant_id: number;
  }) {
    const { from_date, to_date, hotel_code, restaurant_id } = query;

    const salesOverview = await this.db
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        this.db.raw(`
        ROUND(COALESCE(SUM(o.sub_total), 0), 2) as "total_sales",
        ROUND(COALESCE(SUM(CASE WHEN o.discount_type = 'percentage' THEN (o.sub_total * o.discount / 100) ELSE o.discount END), 0), 2) as "total_discount",
        ROUND(COALESCE(SUM(o.vat_amount), 0), 2) as "total_vat",
        ROUND(COALESCE(SUM(CASE WHEN o.service_charge_type = 'percentage' THEN (o.sub_total * o.service_charge / 100) ELSE o.service_charge END), 0),2) as "total_service_charge",
        ROUND(COALESCE(SUM(o.grand_total), 0),2) as "grand_total"
      `)
      )
      .from("orders as o")
      .where("o.status", "completed")
      .andWhere("o.hotel_code", hotel_code)
      .andWhere("o.restaurant_id", restaurant_id)
      .andWhereRaw("DATE(o.created_at) BETWEEN ? AND ?", [from_date, to_date])
      .first();

    const typeWiseSales = await this.db
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        "o.order_type",
        this.db.raw("SUM(o.grand_total) as net_total_amount")
      )
      .from("orders as o")
      .where("o.status", "completed")
      .andWhere("o.hotel_code", hotel_code)
      .andWhere("o.restaurant_id", restaurant_id)
      .andWhereRaw("DATE(o.created_at) BETWEEN ? AND ?", [from_date, to_date])
      .groupBy("o.order_type");

    return {
      salesOverview,
      typeWiseSales,
    };
  }

  // public async getSalesReport(query: {
  //   from_date: string;
  //   to_date: string;
  //   hotel_code: number;
  //   restaurant_id: number;
  //   order_type: string;
  //   limit: string;
  //   skip: string;
  // }) {
  //   const {
  //     from_date,
  //     to_date,
  //     hotel_code,
  //     restaurant_id,
  //     limit,
  //     skip,
  //     order_type,
  //   } = query;

  //   const data = await this.db
  //     .withSchema(this.RESTAURANT_SCHEMA)
  //     .select(
  //       "o.id",
  //       "o.order_no",
  //       "o.guest_name",
  //       "o.room_no",
  //       "o.order_type",
  //       "o.discount_amount",
  //       "o.service_charge_amount",
  //       "o.vat_amount",
  //       "o.grand_total",
  //       "o.created_at",
  //       "u.name as user_name"
  //     )
  //     .from("orders as o")
  //     .leftJoin("user_admin as u", "o.created_by", "u.id")
  //     .where("o.status", "completed")
  //     .andWhere("o.hotel_code", hotel_code)
  //     .andWhere("o.restaurant_id", restaurant_id)
  //     .andWhere(function () {
  //       if (from_date && to_date) {
  //         this.andWhereRaw("DATE(o.created_at) BETWEEN ? AND ?", [
  //           from_date,
  //           to_date,
  //         ]);
  //       }
  //     })
  //     .andWhere(function () {
  //       if (order_type) {
  //         this.andWhere("o.order_type", order_type);
  //       }
  //     })
  //     .limit(limit ? Number(limit) : 100)
  //     .offset(skip ? Number(skip) : 0)
  //     .orderBy("o.created_at", "asc");

  //   const total = await this.db("orders as o")
  //     .withSchema(this.RESTAURANT_SCHEMA)
  //     .count("o.id as total")
  //     .where("o.status", "completed")
  //     .andWhere("o.hotel_code", hotel_code)
  //     .andWhere("o.restaurant_id", restaurant_id)
  //     .andWhere(function () {
  //       if (from_date && to_date) {
  //         this.andWhereRaw("DATE(o.created_at) BETWEEN ? AND ?", [
  //           from_date,
  //           to_date,
  //         ]);
  //       }
  //     })
  //     .andWhere(function () {
  //       if (order_type) {
  //         this.andWhere("o.order_type", order_type);
  //       }
  //     });

  //   return {
  //     data,
  //     total: Number(total[0].total as string),
  //   };
  // }

  public async getSalesReport(query: {
    from_date: string;
    to_date: string;
    hotel_code: number;
    restaurant_id: number;
    order_type?: string;
    limit?: string;
    skip?: string;
  }) {
    const {
      from_date,
      to_date,
      hotel_code,
      restaurant_id,
      limit,
      skip,
      order_type,
    } = query;
    console.log({ from_date, to_date });

    console.log(query, "weeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");

    const limitNum = Number(limit) || 100;
    const skipNum = Number(skip) || 0;

    const data = await this.db
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        "o.id",
        "o.order_no",
        "o.guest_name",
        "o.room_no",
        "o.order_type",
        "o.discount_amount",
        "o.service_charge_amount",
        "o.vat_amount",
        "o.grand_total",
        "o.created_at",
        "u.name as user_name"
      )
      .from("orders as o")
      .leftJoin("user_admin as u", "o.created_by", "u.id")
      .where("o.status", "completed")
      .andWhere("o.hotel_code", hotel_code)
      .andWhere("o.restaurant_id", restaurant_id)
      .modify((qb) => {
        if (from_date && to_date) {
          qb.andWhere("o.created_at", ">=", `${from_date} 00:00:00`).andWhere(
            "o.created_at",
            "<=",
            `${to_date} 23:59:59`
          );
        }
        if (order_type) {
          qb.andWhere("o.order_type", order_type);
        }
      })
      .orderBy("o.created_at", "asc")
      .limit(limitNum)
      .offset(skipNum);

    // Get total record count
    const total = await this.db("orders as o")
      .withSchema(this.RESTAURANT_SCHEMA)
      .count("o.id as total")
      .where("o.status", "completed")
      .andWhere("o.hotel_code", hotel_code)
      .andWhere("o.restaurant_id", restaurant_id)
      .modify((qb) => {
        if (from_date && to_date) {
          qb.andWhere("o.created_at", ">=", `${from_date} 00:00:00`).andWhere(
            "o.created_at",
            "<=",
            `${to_date} 23:59:59`
          );
        }
        if (order_type) {
          qb.andWhere("o.order_type", order_type);
        }
      })
      .first();

    const totals = await this.db("orders as o")
      .withSchema(this.RESTAURANT_SCHEMA)
      .sum({ total_discount_amount: "o.discount_amount" })
      .sum({ total_vat_amount: "o.vat_amount" })
      .sum({ total_service_charge_amount: "o.service_charge_amount" })
      .sum({ total_grand_amount: "o.grand_total" })
      .where("o.status", "completed")
      .andWhere("o.hotel_code", hotel_code)
      .andWhere("o.restaurant_id", restaurant_id)
      .modify((qb) => {
        if (from_date && to_date) {
          qb.andWhereRaw("DATE(o.created_at) BETWEEN ? AND ?", [
            from_date,
            to_date,
          ]);
        }
        if (order_type) {
          qb.andWhere("o.order_type", order_type);
        }
      })
      .first();

    return {
      data,
      total: Number(total?.total || 0),
      totals: {
        total_discount_amount: Number(totals?.total_discount_amount || 0),
        total_vat_amount: Number(totals?.total_vat_amount || 0),
        total_service_charge_amount: Number(
          totals?.total_service_charge_amount || 0
        ),
        total_grand_amount: Number(totals?.total_grand_amount || 0),
      },
    };
  }

  public async getUserSalesReport(query: {
    from_date: string;
    to_date: string;
    hotel_code: number;
    restaurant_id: number;
    user_id: string;
    limit?: string;
    skip?: string;
  }) {
    const {
      from_date,
      to_date,
      hotel_code,
      restaurant_id,
      user_id,
      limit,
      skip,
    } = query;

    const limitNum = Number(limit) || 100;
    const skipNum = Number(skip) || 0;

    const data = await this.db
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        "o.id",
        "o.order_no",
        "o.guest_name",
        "o.room_no",
        "o.order_type",
        "o.discount_amount",
        "o.service_charge_amount",
        "o.vat_amount",
        "o.grand_total",
        "o.created_at",
        "u.name as order_created_by",
        "emp.name as waiter_name"
      )
      .from("orders as o")
      .leftJoin("user_admin as u", "o.created_by", "u.id")
      .joinRaw("LEFT JOIN hr.employee as emp on o.staff_id = emp.id")
      .where("o.status", "completed")
      .andWhere("o.hotel_code", hotel_code)
      .andWhere("o.restaurant_id", restaurant_id)
      .andWhere(function () {
        if (user_id) this.andWhere("o.staff_id", user_id);
      })
      .modify((qb) => {
        if (from_date && to_date) {
          qb.andWhereRaw("DATE(o.created_at) BETWEEN ? AND ?", [
            from_date,
            to_date,
          ]);
        }
      })
      .orderBy("o.created_at", "asc")
      .limit(limitNum)
      .offset(skipNum);

    // Get total count
    const total = await this.db("orders as o")
      .withSchema(this.RESTAURANT_SCHEMA)
      .count("o.id as total")
      .where("o.status", "completed")
      .andWhere("o.hotel_code", hotel_code)
      .andWhere("o.restaurant_id", restaurant_id)
      .andWhere(function () {
        if (user_id) this.andWhere("o.staff_id", user_id);
      })
      .modify((qb) => {
        if (from_date && to_date) {
          qb.andWhereRaw("DATE(o.created_at) BETWEEN ? AND ?", [
            from_date,
            to_date,
          ]);
        }
      })

      .first();

    // Get summary totals (discount, VAT, service charge)
    const totals = await this.db("orders as o")
      .withSchema(this.RESTAURANT_SCHEMA)
      .sum({ total_discount_amount: "o.discount_amount" })
      .sum({ total_vat_amount: "o.vat_amount" })
      .sum({ total_service_charge_amount: "o.service_charge_amount" })
      .sum({ total_amount: "o.grand_total" })
      .where("o.status", "completed")
      .andWhere("o.hotel_code", hotel_code)
      .andWhere("o.restaurant_id", restaurant_id)
      .andWhere(function () {
        if (user_id) this.andWhere("o.staff_id", user_id);
      })
      .modify((qb) => {
        if (from_date && to_date) {
          qb.andWhereRaw("DATE(o.created_at) BETWEEN ? AND ?", [
            from_date,
            to_date,
          ]);
        }
      })
      .first();

    return {
      data,
      total: total?.total || 0,
      totals: {
        total_amount: Number(totals?.total_amount || 0),
        total_discount_amount: Number(totals?.total_discount_amount || 0),
        total_vat_amount: Number(totals?.total_vat_amount || 0),
        total_service_charge_amount: Number(
          totals?.total_service_charge_amount || 0
        ),
      },
    };
  }
}

export default RestaurantReportModel;
