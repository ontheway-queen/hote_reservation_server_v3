import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import StockInvService from "../services/stock.service";
import StockInvValidator from "../utils/validation/stock.validator";

class StockInvController extends AbstractController {
  private service = new StockInvService();
  private validator = new StockInvValidator();
  constructor() {
    super();
  }

  // Create Stock
  public createStock = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createstockInvValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createStock(req);

      res.status(code).json(data);
    }
  );

  // Get All Purchase
  public getAllStock = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllStockInvValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllStock(req);

      res.status(code).json(data);
    }
  );

  // get single Purchase
  public getSingleStock = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleStock(req);

      res.status(code).json(data);
    }
  );

  // get single Purchase
  public updateStockController = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.validator.updateStockValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateStockService(req);

      res.status(code).json(data);
    }
  );
}
export default StockInvController;
