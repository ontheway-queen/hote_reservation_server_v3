import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ReservationService from "../services/reservation.service";
import { ReservationValidator } from "../utlis/validator/reservation.validator";

export class ReservationController extends AbstractController {
  private service = new ReservationService();
  private validator = new ReservationValidator();
  constructor() {
    super();
  }

  public getAllAvailableRoomsTypeWithAvailableRoomCount =
    this.asyncWrapper.wrap(
      {
        querySchema: this.validator.getAvailableRoomsQueryValidator,
      },
      async (req: Request, res: Response) => {
        const { code, ...data } =
          await this.service.getAllAvailableRoomsTypeWithAvailableRoomCount(
            req
          );
        res.status(code).json(data);
      }
    );

  public getAllAvailableRoomsByRoomType = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      querySchema: this.validator.getAvailableRoomsQueryValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.service.getAllAvailableRoomsByRoomType(req);
      res.status(code).json(data);
    }
  );

  public createBooking = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createBookingValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createBooking(req);
      res.status(code).json(data);
    }
  );
}
