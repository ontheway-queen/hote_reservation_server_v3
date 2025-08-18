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
}
