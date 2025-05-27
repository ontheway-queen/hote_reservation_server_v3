import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RoomService from "../services/room.service";
import RoomValidator from "../utlis/validator/Room.validator";

class RoomController extends AbstractController {
  private roomService = new RoomService();
  private roomvalidator = new RoomValidator();
  constructor() {
    super();
  }
  // Create room
  public createroom = this.asyncWrapper.wrap(
    { bodySchema: this.roomvalidator.createRoomValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.createRoom(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getAllRoom = this.asyncWrapper.wrap(
    { querySchema: this.roomvalidator.getAllHotelRoomQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.getAllRoom(req);
      res.status(code).json(data);
    }
  );

  public getAllRoomByRoomTypes = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.getAllRoomByRoomTypes(
        req
      );
      res.status(code).json(data);
    }
  );

  public getAllAvailableRooms = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.getAllAvailableRooms(
        req
      );
      res.status(code).json(data);
    }
  );

  // update single hotel room
  public updateHotelRoom = this.asyncWrapper.wrap(
    { bodySchema: this.roomvalidator.updateRoomValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.updateroom(req);
      res.status(code).json(data);
    }
  );

  // update single hotel room status
  public updateHotelRoomStatus = this.asyncWrapper.wrap(
    { bodySchema: this.roomvalidator.updateRoomStatusValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.updateRoomStatus(req);
      res.status(code).json(data);
    }
  );
}
export default RoomController;
