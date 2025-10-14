import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RestaurantTableService from "../services/restaurantTable.service";
import RestaurantTableValidator from "../utils/validator/table.validator";

class RestaurantTableController extends AbstractController {
  private validator = new RestaurantTableValidator();
  private service = new RestaurantTableService();

  constructor() {
    super();
  }

  public createTable = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createTableValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createTable(req);
      res.status(code).json(data);
    }
  );

  public getTables = this.asyncWrapper.wrap(
    { querySchema: this.validator.getTablesValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getTables(req);
      res.status(code).json(data);
    }
  );

  public updateTable = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateTableValidator,
      paramSchema: this.commonValidator.singleParamStringValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateTable(req);
      res.status(code).json(data);
    }
  );

  public deleteTable = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamStringValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteTable(req);
      res.status(code).json(data);
    }
  );
}

export default RestaurantTableController;
