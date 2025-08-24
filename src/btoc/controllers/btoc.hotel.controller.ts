import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import { BtocHotelService } from "../services/hotel.service";
import { BtoHotelValidator } from "../utills/validators/hotel.validator";

export class BtocHotelController extends AbstractController {
  private service = new BtocHotelService();
  private validator = new BtoHotelValidator();

  constructor() {
    super();
  }

  public searchAvailability = this.asyncWrapper.wrap(
    { bodySchema: this.validator.hotelSearchValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.searchAvailability(req);
      res.status(code).json(data);
    }
  );

  public recheck = this.asyncWrapper.wrap(
    { bodySchema: this.validator.recheckValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.recheck(req);
      res.status(code).json(data);
    }
  );

  public booking = this.asyncWrapper.wrap(
    { bodySchema: this.validator.bookingValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.booking(req);
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
    { paramSchema: this.commonValidator.singleParamStringValidator("ref_id") },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleBooking(req);
      res.status(code).json(data);
    }
  );

  public cancelSingleBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator("ref_id") },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.cancelSingleBooking(req);
      res.status(code).json(data);
    }
  );
}
