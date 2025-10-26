import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RestaurantFoodService from "../services/food.service";
import RestaurantFoodValidator from "../utils/validator/food.validator";

class RestaurantFoodController extends AbstractController {
  private validator = new RestaurantFoodValidator();
  private service = new RestaurantFoodService();

  constructor() {
    super();
  }

  public getAllProduct = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllProduct(req);
      res.status(code).json(data);
    }
  );

  public insertPreparedFood = this.asyncWrapper.wrap(
    { bodySchema: this.validator.preparedFoodValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.insertPreparedFood(req);
      res.status(code).json(data);
    }
  );

  public createFoodV2 = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createFoodV2Validator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createFoodV2(req);
      res.status(code).json(data);
    }
  );

  public getFoods = this.asyncWrapper.wrap(
    { querySchema: this.validator.getFoodsValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getFoods(req);
      res.status(code).json(data);
    }
  );

  public getFood = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getFood(req);
      res.status(code).json(data);
    }
  );

  public updateFood = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateFoodV2Validator,
      paramSchema: this.commonValidator.singleParamStringValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateFood(req);
      res.status(code).json(data);
    }
  );

  public deleteFood = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamStringValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteFood(req);
      res.status(code).json(data);
    }
  );

  public geFoodStocks = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getFoodStocks(req);
      res.status(code).json(data);
    }
  );
}

export default RestaurantFoodController;
