import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RestaurantUnitService from "../services/unit.service";
import RestaurantUnitsValidator from "../utils/validator/unit.validator";

class RestaurantUnitController extends AbstractController {
  private validator = new RestaurantUnitsValidator();
  private service = new RestaurantUnitService();

  constructor() {
    super();
  }

  public createUnit = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createUnitValidator },
    async (req: Request, res: Response) => {
      console.log(req.body);
      const { code, ...data } = await this.service.createUnit(req);
      res.status(code).json(data);
    }
  );

  public getUnits = this.asyncWrapper.wrap(
    { querySchema: this.validator.getUnitValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getUnits(req);
      res.status(code).json(data);
    }
  );

  public updateUnit = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateUnitValidator,
      paramSchema: this.commonValidator.singleParamStringValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateUnit(req);
      res.status(code).json(data);
    }
  );

  public deleteUnit = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamStringValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteUnit(req);
      res.status(code).json(data);
    }
  );
}

export default RestaurantUnitController;
