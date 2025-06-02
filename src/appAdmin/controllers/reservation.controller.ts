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

  public calendar = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getAvailableRoomsQueryValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.calendar(req);
      res.status(code).json(data);
    }
  );

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

  public getAllAvailableRoomsTypeForEachDateAvailableRoom =
    this.asyncWrapper.wrap(
      {
        querySchema: this.validator.getAvailableRoomsQueryValidator,
      },
      async (req: Request, res: Response) => {
        const { code, ...data } =
          await this.service.getAllAvailableRoomsTypeForEachDateAvailableRoom(
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

  public getAllBooking = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllBooking(req);
      res.status(code).json(data);
    }
  );

  public getSingleBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleBooking(req);
      res.status(code).json(data);
    }
  );

  public checkIn = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.checkIn(req);
      res.status(code).json(data);
    }
  );

  public checkOut = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.checkOut(req);
      res.status(code).json(data);
    }
  );

  public updateReservationHoldStatus = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.validator.updateReservationHoldStatusValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateReservationHoldStatus(
        req
      );
      res.status(code).json(data);
    }
  );

  public getFoliosbySingleBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getFoliosbySingleBooking(
        req
      );
      res.status(code).json(data);
    }
  );

  public addPaymentByFolioID = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.addPayment,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.addPaymentByFolioID(req);
      res.status(code).json(data);
    }
  );

  public refundPaymentByFolioID = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.addPayment,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.refundPaymentByFolioID(req);
      res.status(code).json(data);
    }
  );

  public getFolioEntriesbyFolioID = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getFolioEntriesbyFolioID(
        req
      );
      res.status(code).json(data);
    }
  );
}
