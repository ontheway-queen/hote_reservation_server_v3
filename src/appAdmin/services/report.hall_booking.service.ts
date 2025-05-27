import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

export class HallBookingReportService extends AbstractServices {
  constructor() {
    super();
  }

  // get Hotel Hall Booking report Service
  public async getHallBookingReport(req: Request) {
    const { from_date, to_date, limit, skip, check_in_out_status } = req.query;
    const { hotel_code } = req.hotel_admin;

    // model
    const model = this.Model.reportModel();

    const { totalAmount, data, total } = await model.getHallBookingReport({
      from_date: from_date as string,
      to_date: to_date as string,
      limit: limit as string,
      skip: skip as string,
      check_in_out_status: check_in_out_status as string,
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      totalAmount,
      data,
    };
  }
}

export default HallBookingReportService;
