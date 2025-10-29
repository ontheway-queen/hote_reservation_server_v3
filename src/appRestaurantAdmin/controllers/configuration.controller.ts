import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RestaurantConfigurationService from "../services/configuration.service";
import RestaurantConfigurationValidator from "../utils/validator/configuration.validator";

class RestaurantConfigurationController extends AbstractController {
  private validator = new RestaurantConfigurationValidator();
  private service = new RestaurantConfigurationService();

  constructor() {
    super();
  }

  public updatePrepareFoodOption = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updatePrepareFoodOption },
    async (req: Request, res: Response) => {
      console.log(req.body);
      const { code, ...data } = await this.service.updatePrepareFoodOption(req);
      res.status(code).json(data);
    }
  );
}

export default RestaurantConfigurationController;
