import { Knex } from 'knex';
import AccountModel from '../../../models/reservationPanel/accountModel/accountModel';

export default class HelperLib {
  private trx: Knex.Transaction;
  constructor(trx: Knex.Transaction) {
    this.trx = trx;
  }
  // Create head code
  public async createAccHeadCode({
    hotel_code,
    group_code,
    parent_id,
  }: {
    parent_id?: number;
    hotel_code: number;
    group_code: string;
  }): Promise<string | false> {
    const accHeadModel = new AccountModel(this.trx);

    let newHeadCode = '';

    if (parent_id) {
      const parentHead = await accHeadModel.getAccountHead({
        hotel_code,
        group_code,
        id: parent_id,
      });

      if (!parentHead.length) {
        return false;
      }

      const { code: parent_head_code } = parentHead[0];

      const heads = await accHeadModel.getAccountHead({
        hotel_code,
        group_code,
        parent_id,
        order_by: 'ah.code',
        order_to: 'desc',
      });

      if (heads.length) {
        const { code: child_code } = heads[0];

        const lastHeadCodeNum = child_code.split('.');
        const newNum = Number(lastHeadCodeNum[lastHeadCodeNum.length - 1]) + 1;

        newHeadCode = lastHeadCodeNum.pop();
        newHeadCode = lastHeadCodeNum.join('.');

        if (newNum < 10) {
          newHeadCode += '.00' + newNum;
        } else if (newNum < 100) {
          newHeadCode += '.0' + newNum;
        } else {
          newHeadCode += '.' + newNum;
        }
      } else {
        newHeadCode = parent_head_code + '.001';
      }
    } else {
      const checkHead = await accHeadModel.getAccountHead({
        hotel_code,
        group_code,
        parent_id: null,
        order_by: 'ah.id',
        order_to: 'desc',
      });

      if (checkHead.length) {
        newHeadCode = Number(checkHead[0].code) + 1 + '';
      } else {
        newHeadCode = Number(group_code) + 1 + '';
      }
    }

    return newHeadCode;
  }
}
