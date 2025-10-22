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

  public assignFoodIngredientsToRestaurant = this.asyncWrapper.wrap(
    { bodySchema: this.Validator.assignFoodIngredientsToRestaurant },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.Service.assignFoodIngredientsToRestaurant(req);
      res.status(code).json(data);
    }
  );

  public getAssignFoodIngredientsToRestaurant = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.Service.getAssignFoodIngredientsToRestaurant(req);
      res.status(code).json(data);
    }
  );

  public deleteAssignFoodIngredientsToRestaurant = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.Service.deleteAssignFoodIngredientsToRestaurant(req);
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

  public addStaffs = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.Service.addStaffs(req);

      res.status(code).json(data);
    }
  );

  public removeStaff = this.asyncWrapper.wrap(
    { paramSchema: this.Validator.removeStaffValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.Service.removeStaff(req);

      res.status(code).json(data);
    }
  );
}
export default HotelRestaurantController;
