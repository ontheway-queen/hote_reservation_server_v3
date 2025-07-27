import moment from 'moment';
import AbstractServices from '../../../abstarcts/abstract.service';
import knex, { Knex } from 'knex';

export class HelperFunction extends AbstractServices {
  public static generateRateCalendar(rawData: any) {
    const calendarOutput = [];

    for (const detail of rawData.rate_plan_details) {
      const room_type_id = detail.room_type_id;

      // Filter overrides
      const overrideMap = new Map();
      for (const d of rawData.daily_rates) {
        if (d.room_type_id === room_type_id) {
          overrideMap.set(d.date, d);
        }
      }

      const start = new Date(detail.start_date);
      const end = new Date(detail.end_date);
      const dailyRates = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const override = overrideMap.get(dateStr);

        if (override) {
          dailyRates.push({
            date: dateStr,
            day_name: d.toLocaleDateString('en-US', { weekday: 'long' }),
            rate: override.rate,
            extra_adult_rate: override.extra_adult_rate,
            extra_child_rate: override.extra_child_rate,
            stop_sell: override.stop_sell,
            is_override: true,
          });
        } else {
          dailyRates.push({
            date: dateStr,
            day_name: d.toLocaleDateString('en-US', { weekday: 'long' }),
            rate: detail.base_rate,
            extra_adult_rate: detail.extra_adult_rate,
            extra_child_rate: detail.extra_child_rate,
            stop_sell: false,
            is_override: false,
          });
        }
      }

      calendarOutput.push({
        room_type_id: detail.room_type_id,
        room_type_name: detail.room_type_name,
        base_rate: detail.base_rate,
        extra_adult_rate: detail.extra_adult_rate,
        extra_child_rate: detail.extra_child_rate,
        rates: dailyRates,
      });
    }

    return calendarOutput;
  }

  public static getDatesBetween(startDate: string, endDate: string): string[] {
    const dates = [];
    const current = new Date(startDate);
    const stop = new Date(endDate);
    while (current <= stop) {
      dates.push(current.toISOString().slice(0, 10)); // YYYY-MM-DD format
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  public static calculateNights(checkIn: string, checkOut: string): number {
    const from = new Date(checkIn);
    const to = new Date(checkOut);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public static generateFolioNumber(lastFolioId: number): string {
    const now = moment();
    const prefix = `FOLIO-${now.format('YYYYMM')}`;

    const nextId = (lastFolioId || 0) + 1;
    const padded = nextId.toString().padStart(4, '0');

    return `${prefix}-${padded}`;
  }

  public async generateVoucherNo(
    type: 'JV' | 'BCV' | 'DV' | 'CCV',
    trx: Knex.Transaction
  ): Promise<string> {
    const now = moment();

    const prefix = `${type}-${now.format('YYYY')}`;

    const model = this.Model.DboModel(trx);

    const getLasVoucherId = await model.getLastNo('Voucher');
    let next = 1;

    if (getLasVoucherId === undefined) {
      await model.insertLastNo({ type: 'Voucher', last_no: next });
    } else {
      next = getLasVoucherId.last_no + 1;
      await model.updateLastNo('Voucher', next);
    }

    const padded = next.toString().padStart(4, '0');

    return `${prefix}-${padded}`;
  }

  public async generateInvoiceNumber() {
    const lastId = await this.Model.hotelInvoiceModel().getLastInvoiceId();
    const nextId = lastId + 1;
    const padded = String(nextId).padStart(6, '0'); // e.g., "000004"
    return `INV-${padded}`;
  }
}
