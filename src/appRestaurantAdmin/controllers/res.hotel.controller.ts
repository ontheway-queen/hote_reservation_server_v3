import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RestaurantHotelService from "../services/res.hotel.service";
import RestaurantCommonValidator from "../utils/validator/res.common.validator";

class RestaurantHotelController extends AbstractController {
  private service = new RestaurantHotelService();
  private validator = new RestaurantCommonValidator();

  constructor() {
    super();
  }

  public geAllBookings = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.geAllBookings(req);
      res.status(code).json(data);
    }
  );

  public getAllAccount = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllAccountQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAccount(req);
      res.status(code).json(data);
    }
  );

  public getAllFloors = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllFloors(req);
      res.status(code).json(data);
    }
  );
}

export default RestaurantHotelController;
