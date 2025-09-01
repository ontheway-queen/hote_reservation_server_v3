import { IgetAllChannel } from "../../appAdmin/utlis/interfaces/channelManager.types";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class ChannelManagerModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async addChannelManager(payload: {
    name: string;
    hotel_code: number;
    is_internal: boolean;
  }) {
    return await this.db("channels").withSchema(this.CM_SCHEMA).insert(payload);
  }

  public async getAllChannelManager({
    hotel_code,
    is_internal,
  }: {
    hotel_code: number;
    is_internal?: boolean;
  }): Promise<IgetAllChannel[] | []> {
    return await this.db("channels")
      .withSchema(this.CM_SCHEMA)
      .select("id", "name", "is_internal")
      .where("hotel_code", hotel_code)
      .andWhere(function () {
        if (is_internal) {
          this.andWhere("is_internal", is_internal);
        }
      });
  }

  public async updateChannelManager(
    payload: {
      name: string;
      is_internal: boolean;
    },
    conditions: { id: number; hotel_code: number }
  ) {
    return await this.db("channels")
      .withSchema(this.CM_SCHEMA)
      .update(payload)
      .where(conditions);
  }
}
export default ChannelManagerModel;
