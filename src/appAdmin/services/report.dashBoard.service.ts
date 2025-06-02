import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class ReportService extends AbstractServices {
  constructor() {
    super();
  }

  public async getDashboardData(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const data = await this.db.raw(
      `CALL ${this.schema.RESERVATION_SCHEMA}.dashboard_data(?)`,
      [hotel_code]
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data[0][0][0],
    };
  }

  // Dashboard Acount Report
  public async getAccountReport(req: Request) {
    const { from_date, to_date, ac_type } = req.query;
    const { hotel_code } = req.hotel_admin;
    // model
    const model = this.Model.dashBoardModel();

    const { total, totalDebitAmount, totalCreditAmount } =
      await model.getAccountReport({
        from_date: from_date as string,
        to_date: to_date as string,
        hotel_code,
        ac_type: ac_type as string,
      });

    const totalRemainingAmount = totalCreditAmount - totalDebitAmount;

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      totalDebitAmount,
      totalCreditAmount,
      totalRemainingAmount,
    };
  }

  // Dashboard room Report
  public async getRoomReport(req: Request) {
    const { from_date, to_date, ac_type } = req.query;
    const { hotel_code } = req.hotel_admin;
    // model
    const model = this.Model.dashBoardModel();

    const {
      total_room,
      total_super_deluxe_room,
      total_deluxe_room,
      total_double_room,
      total_single_room,
    } = await model.getRoomReport({
      from_date: from_date as string,
      to_date: to_date as string,
      hotel_code,
    });

    const others_room =
      Number(total_room) -
      (Number(total_super_deluxe_room) +
        Number(total_deluxe_room) +
        Number(total_double_room) +
        Number(total_single_room));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        total_room,
        total_super_deluxe_room,
        total_deluxe_room,
        total_double_room,
        total_single_room,
        others_room,
      },
    };
  }
}
export default ReportService;
