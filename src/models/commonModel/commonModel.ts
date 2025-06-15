import {
  IGetOTPPayload,
  IInsertOTPPayload,
} from "../../common/interfaces/commonInterface";
import {
  IUpdateChangePassModelProps,
  IVerifyModelPassProps,
  TDB,
} from "../../common/types/commontypes";

import Schema from "../../utils/miscellaneous/schema";
class CommonModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertOTP(payload: IInsertOTPPayload) {
    return await this.db("email_otp")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  public async getOTP(payload: IGetOTPPayload) {
    console.log({ payload });
    const check = await this.db("email_otp")
      .withSchema(this.DBO_SCHEMA)
      .select("id", "hashed_otp as otp", "tried")
      .andWhere("email", payload.email)
      .andWhere("type", payload.type)
      .andWhere("matched", 0)
      .andWhere("tried", "<", 3)
      .andWhereRaw(`"created_at" + interval '3 minutes' > NOW()`);
    return check;
  }

  public async updateOTP(
    payload: { tried: number; matched?: number },
    where: { id: number }
  ) {
    return await this.db("email_otp")
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where(where);
  }

  public async getUserPassword({
    table,
    schema,
    passField,
    userIdField,
    userId,
  }: IVerifyModelPassProps) {
    return await this.db(table)
      .withSchema(schema)
      .select(passField)
      .where(userIdField, userId);
  }

  public async updatePassword({
    table,
    userIdField,
    userId,
    passField,
    schema,
    hashedPass,
  }: IUpdateChangePassModelProps) {
    return await this.db(table)
      .update(passField, hashedPass)
      .withSchema(schema)
      .where(userIdField, userId);
  }

  public async getAllCountry() {
    return await this.db("country").withSchema(this.PUBLIC_SCHEMA).select("*");
  }
  // insert audit trail
  // public async insetAuditTrail(payload: IInsertAuditTrailPayload) {
  //   return await this.db("auditTrail")
  //     .withSchema(this.ADMINISTRATION_SCHEMA)
  //     .insert(payload);
  // }
}
export default CommonModel;
