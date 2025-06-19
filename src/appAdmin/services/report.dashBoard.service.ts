import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class ReportService extends AbstractServices {
  constructor() {
    super();
  }

  public async getHotelStatistics(req: Request) {
    const { totalRooms } = await this.Model.dashBoardModel().getHotelStatistics(
      req.hotel_admin.hotel_code
    );
    const { totalArrivals, totalDepartures, totalStays } =
      await this.Model.dashBoardModel().getHotelStatisticsArrivalDepartureStays(
        {
          hotel_code: req.hotel_admin.hotel_code,
          current_date: req.query.current_date as string,
        }
      );
    const { totalActiveBookings, totalHoldBookings, totalOccupiedRoomsResult } =
      await this.Model.dashBoardModel().getOccupiedRoomAndBookings({
        hotel_code: req.hotel_admin.hotel_code,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        totalRooms,
        totalArrivals,
        totalDepartures,
        totalStays,
        totalActiveBookings,
        totalHoldBookings,
        totalOccupiedRoomsResult,
      },
    };
  }

  public async getGuestReport(req: Request) {
    const { data, total } = await this.Model.dashBoardModel().getGuestReport({
      hotel_code: req.hotel_admin.hotel_code,
      booking_mode: req.query.booking_mode as any,
      current_date: req.query.current_date as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        guest_data: data,
        total,
      },
    };
  }

  public async getSingleGuestLedger(req: Request) {
    const { from_date, to_date, limit, skip } = req.query;
    const { data, total } = await this.Model.guestModel().getSingleGuestLedeger(
      {
        hotel_code: req.hotel_admin.hotel_code,
        from_date: from_date as string,
        to_date: to_date as string,
        guest_id: parseInt(req.params.id),
        limit: parseInt(limit as string),
        skip: parseInt(skip as string),
      }
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }
  public async getGuestDistributionCountryWise(req: Request) {
    const data =
      await this.Model.dashBoardModel().getGuestDistributionCountryWise({
        hotel_code: req.hotel_admin.hotel_code,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getRoomReport(req: Request) {
    const data = await this.Model.dashBoardModel().getRoomReport({
      hotel_code: req.hotel_admin.hotel_code,
      current_date: req.query.current_date as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
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
}
export default ReportService;
