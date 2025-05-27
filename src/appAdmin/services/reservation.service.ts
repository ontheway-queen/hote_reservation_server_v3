import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IBookingRequest,
  IgetChildRateGroups,
  ISearchAvailableRoom,
} from "../utlis/interfaces/reservation.interface";

export class ReservationService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAllAvailableRoomsTypeWithAvailableRoomCount(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { check_in, check_out } = req.query;

    const getAllAvailableRoomsWithType =
      await this.Model.reservationModel().getAllAvailableRoomsTypeWithAvailableRoomCount(
        {
          hotel_code,
          check_in: check_in as string,
          check_out: check_out as string,
        }
      );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: getAllAvailableRoomsWithType,
    };
  }

  public async getAllAvailableRoomsByRoomType(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { check_in, check_out } = req.query;

    const getAllAvailableRoomsByRoomType =
      await this.Model.reservationModel().getAllAvailableRoomsByRoomType({
        hotel_code,
        check_in: check_in as string,
        check_out: check_out as string,
        room_type_id: parseInt(req.params.id),
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: getAllAvailableRoomsByRoomType,
    };
  }

  public async createBooking(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { check_in, check_out, rooms, special_requests } =
      req.body as IBookingRequest;

    if (!check_in || !check_out) {
      throw new Error(
        "check_in and check_out dates must be provided and valid"
      );
    }

    // Implement booking creation logic here
    // This is a placeholder response
    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      data: { message: "Booking created successfully" },
    };
  }
}
export default ReservationService;
