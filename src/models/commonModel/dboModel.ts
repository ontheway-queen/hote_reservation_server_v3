import { TDB } from '../../common/types/commontypes';
import Schema from '../../utils/miscellaneous/schema';

export default class DboModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertLastNo(payload: { type: string; last_no: number }) {
    return await this.db('last_no')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async getLastNo(
    type: string
  ): Promise<{ last_no: number } | undefined> {
    return await this.db('last_no')
      .withSchema(this.DBO_SCHEMA)
      .select('last_no')
      .where('type', type)
      .first();
  }

  public async updateLastNo(type: string, last_no: number): Promise<number> {
    return await this.db('last_no')
      .withSchema(this.DBO_SCHEMA)
      .update({ last_no })
      .where('type', type);
  }
}
