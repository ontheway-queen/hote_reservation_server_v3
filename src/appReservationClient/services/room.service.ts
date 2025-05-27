import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

export class ClientRoomService extends AbstractServices {
  constructor() {
    super();
  }

  // get All Hotel Room
  public async getAllHotelRoom(req: Request) {
    const { key, availability, refundable, limit, skip, adult, child } =
      req.query;

    const { id: hotel_code } = req.web_token;

    // model
    const model = this.Model.clientModel();

    const { data, total } = await model.getAllRoom({
      key: key as string,
      availability: availability as string,
      refundable: refundable as string,
      adult: adult as string,
      child: child as string,
      limit: limit as string,
      skip: skip as string,
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // get all available and unavailable room
  public async getAllAvailableAndUnavailableRoom(req: Request) {
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,

      data: [],
    };
  }

  // get All available Room
  public async getAllAvailableRoom(req: Request) {
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: [],
    };
  }

  // get Single Hotel Room
  public async getSingleHotelRoom(req: Request) {
    const { room_id } = req.params;

    const { id: hotel_code } = req.web_token;

    const model = this.Model.clientModel();

    const data = await model.getSingleRoom(hotel_code, parseInt(room_id));
    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data[0],
    };
  }

  // get All Hotel room images
  public async getAllHotelRoomImages(req: Request) {
    const { limit, skip } = req.query;

    const { id: hotel_code } = req.web_token;

    // model
    const model = this.Model.clientModel();

    const { data } = await model.getHotelRoomImages({
      limit: limit as string,
      skip: skip as string,
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
}
export default ClientRoomService;
