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

  public createMultipleRooms = this.asyncWrapper.wrap(
    { bodySchema: this.roomvalidator.createMultipleRoomValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.createMultipleRooms(req);
      res.status(code).json(data);
    }
  );

  public getAllRoom = this.asyncWrapper.wrap(
    { querySchema: this.roomvalidator.getAllHotelRoomQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.getAllRoom(req);
      res.status(code).json(data);
    }
  );

  public getAllRoomByRoomStatus = this.asyncWrapper.wrap(
    {
      querySchema: this.roomvalidator.getAllHotelRoomByRoomStatusQueryValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.getAllRoomByRoomStatus(
        req
      );
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

  public updateHotelRoom = this.asyncWrapper.wrap(
    { bodySchema: this.roomvalidator.updateRoomValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.updateroom(req);
      res.status(code).json(data);
    }
  );

  public deleteHotelRoom = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator("room_id") },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.deleteHotelRoom(req);
      res.status(code).json(data);
    }
  );

  public updateHotelRoomStatus = this.asyncWrapper.wrap(
    { bodySchema: this.roomvalidator.updateRoomStatusValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.updateRoomStatus(req);
      res.status(code).json(data);
    }
  );

  // get all rooms by room type
  public getAllRoomByRoomType = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator("room_type_id"),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.getAllRoomByRoomType(
        req
      );
      res.status(code).json(data);
    }
  );

  // get all occupied rooms using date
  public getAllOccupiedRooms = this.asyncWrapper.wrap(
    { querySchema: this.roomvalidator.getAllOccupiedRoomsQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomService.getAllOccupiedRooms(req);
      res.status(code).json(data);
    }
  );
}
export default RoomController;
