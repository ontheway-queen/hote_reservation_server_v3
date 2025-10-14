import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import HotelRestaurantService from "../services/restaurant.hotel.service";
import HotelRestaurantValidator from "../utlis/validator/restaurant.hotel.validator";

class HotelRestaurantController extends AbstractController {
  private Service = new HotelRestaurantService();
  private Validator = new HotelRestaurantValidator();

  constructor() {
    super();
  }

  public createRestaurant = this.asyncWrapper.wrap(
    { bodySchema: this.Validator.createRestaurantValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.Service.createRestaurant(req);

      res.status(code).json(data);
    }
  );

  public getAllRestaurant = this.asyncWrapper.wrap(
    { querySchema: this.Validator.getAllRestaurantQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.Service.getAllRestaurant(req);
      res.status(code).json(data);
    }
  );

  public getRestaurantWithAdmin = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.Service.getRestaurantWithAdmin(req);
      res.status(code).json(data);
    }
  );

  public updateHotelRestaurantAndAdmin = this.asyncWrapper.wrap(
    { bodySchema: this.Validator.updateHotelRestaurantValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.Service.updateHotelRestaurantAndAdmin(req);

      res.status(code).json(data);
    }
  );
}
export default HotelRestaurantController;
