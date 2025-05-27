import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IgetAllRoom } from "../../appAdmin/utlis/interfaces/Room.interfaces";
import { IURoomBookingBody } from "../utils/interfaces/room-booking.interface";

class URoomBookingService extends AbstractServices {
  constructor() {
    super();
  }

  // create room booking
  public async createRoomBooking(req: Request) {
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  // get all room booking
  public async getAllRoomBooking(req: Request) {
    const { hotel_code } = req.hotel_user;

    const { limit, skip, name, status, user_id } = req.query;

    const model = this.Model.clientModel();

    const { data, total } = await model.getAllRoomBooking({
      limit: limit as string,
      skip: skip as string,
      name: name as string,
      hotel_code,
      status: status as string,
      user_id: user_id as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // get single room booking
  public async getSingleRoomBooking(req: Request) {
    const { id } = req.params;

    const { hotel_code } = req.hotel_user;

    const data = await this.Model.clientModel().getSingleRoomBooking(
      parseInt(id),
      hotel_code
    );

    if (!data.length) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: data,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data[0],
    };
  }
}
export default URoomBookingService;
