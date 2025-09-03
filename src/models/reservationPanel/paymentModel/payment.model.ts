import {
  IGetPaymentGatewayQuery,
  IGetPaymentGatewaySetting,
  IPaymentGatewaySettingPayload,
  IUpdatePaymentGatewaySetting,
} from "../../../appAdmin/utlis/interfaces/payment.gateway.interface";
import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class PaymentModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createPaymentGateway(payload: IPaymentGatewaySettingPayload) {
    return await this.db("payment_gateway_setting")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  public async getPaymentGateway<T>(
    params: IGetPaymentGatewayQuery
  ): Promise<IGetPaymentGatewaySetting<T>[]> {
    return await this.db("payment_gateway_setting as pgs")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "pgs.id",
        "pgs.title",
        "pgs.details",
        "pgs.status",
        "pgs.type",
        "pgs.bank_charge",
        "pgs.bank_charge_type",
        "pgs.logo",
        "pgs.is_default",
        "pgs.hotel_code",
        "pgs.created_by",
        "pgs.updated_at",
        this.db.raw(`COALESCE(ua.name, 'System') AS created_by_name`)
      )
      .leftJoin("user_admin as ua", "pgs.created_by", "ua.id")
      .where((qb) => {
        qb.where("pgs.hotel_code", params.hotel_code);
        if (params.id) {
          qb.andWhere("pgs.id", params.id);
        }
        if (params.type) {
          qb.andWhere("pgs.type", params.type);
        }
        if (params.status) {
          qb.andWhere("pgs.status", params.status);
        }
        if (params.is_default) {
          qb.andWhere("pgs.is_default", params.is_default);
        }
      })
      .orderBy("pgs.is_default", "desc");
  }

  public async getAllPaymentGatewayForBTOC<T>(
    params: IGetPaymentGatewayQuery
  ): Promise<IGetPaymentGatewaySetting<T>[]> {
    return await this.db("payment_gateway_setting as pgs")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "pgs.id",
        "pgs.title",
        "pgs.logo",
        "pgs.bank_charge",
        "pgs.bank_charge_type"
      )

      .where((qb) => {
        qb.where("pgs.status", 1);
        if (params.id) {
          qb.andWhere("pgs.id", params.id);
        }
        if (params.type) {
          qb.andWhere("pgs.type", params.type);
        }
        if (params.hotel_code) {
          qb.andWhere("pgs.hotel_code", params.hotel_code);
        }
      })
      .orderBy("pgs.is_default", "desc");
  }

  public async updatePaymentGateway({
    payload,
    id,
    whereNotId,
  }: {
    payload: IUpdatePaymentGatewaySetting;
    id?: number;
    whereNotId?: number;
  }) {
    return await this.db("payment_gateway_setting")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where((qb) => {
        if (id) {
          qb.where({ id });
        }
        if (whereNotId) {
          qb.whereNot("id", whereNotId);
        }
      });
  }
}

export default PaymentModel;
