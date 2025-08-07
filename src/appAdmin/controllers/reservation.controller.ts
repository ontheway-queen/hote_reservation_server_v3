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

  public createGroupBooking = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createGroupBookingValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createGroupBooking(req);
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

  public getAllIndividualBooking = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllIndividualBooking(req);
      res.status(code).json(data);
    }
  );

  public getAllGroupBooking = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllGroupBooking(req);
      res.status(code).json(data);
    }
  );

  public getArrivalDepStayBookings = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getAllBookingByBookingModeValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getArrivalDepStayBookings(
        req
      );
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

  public cancelBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.cancelBooking(req);
      res.status(code).json(data);
    }
  );

  public updateRoomAndRateOfReservation = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.validator.updateRoomAndRateOfReservation,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.service.updateRoomAndRateOfReservation(req);
      res.status(code).json(data);
    }
  );

  public updateSingleReservation = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.validator.updateSingleReservation,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSingleReservation(req);
      res.status(code).json(data);
    }
  );

  public changeDatesOfBooking = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.validator.changeDatesOfBooking,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.changeDatesOfBooking(req);
      res.status(code).json(data);
    }
  );

  public changeRoomOfAReservation = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.validator.changeRoomOfAReservation,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.changeRoomOfAReservation(
        req
      );
      res.status(code).json(data);
    }
  );

  public updateOthersOfARoomByBookingID = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.doubleParamValidator(
        "booking_id",
        "room_id"
      ),
      bodySchema: this.validator.updateOthersOfARoomByBookingID,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.service.updateOthersOfARoomByBookingID(req);
      res.status(code).json(data);
    }
  );

  public individualRoomDatesChangeOfBooking = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.validator.changeDatesOfBookingRoom,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.service.individualRoomDatesChangeOfBooking(req);
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

  public individualRoomCheckIn = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.doubleParamValidator("id", "room_id") },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.individualRoomCheckIn(req);
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

  public individualCheckOut = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.doubleParamValidator("id", "room_id") },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.individualCheckOut(req);
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

  public getFoliosWithEntriesbySingleBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.service.getFoliosWithEntriesbySingleBooking(req);
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

  public adjustAmountByFolioID = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.adjustBalance,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.adjustAmountByFolioID(req);
      res.status(code).json(data);
    }
  );

  public addItemByFolioID = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.addItemByFolioID,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.addItemByFolioID(req);
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

  public updateOrRemoveGuestFromRoom = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.doubleParamValidator("id", "room_id"),
      querySchema: this.validator.updateOrRemoveGuestFromRoom,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateOrRemoveGuestFromRoom(
        req
      );
      res.status(code).json(data);
    }
  );
}
