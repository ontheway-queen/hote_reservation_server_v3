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

  public getAllAvailableRooms = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.getAvailableRoomsValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAvailableRooms(req);
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
