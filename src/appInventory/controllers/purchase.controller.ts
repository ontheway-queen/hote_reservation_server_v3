import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import PurchaseInvService from "../services/purchase.service";
import PurchaseInvValidator from "../utils/validation/purchase.validator";

class PurchaseInvController extends AbstractController {
  private service = new PurchaseInvService();
  private validator = new PurchaseInvValidator();
  constructor() {
    super();
  }

  public createPurchase = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createPurchaseInvValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createPurchase(req);

      res.status(code).json(data);
    }
  );

  public getAllPurchase = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllPurchaseInvValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllPurchase(req);

      res.status(code).json(data);
    }
  );

  public getSinglePurchase = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSinglePurchase(req);

      res.status(code).json(data);
    }
  );

  public getInvoiceByPurchaseId = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getInvoiceByPurchaseId(req);

      res.status(code).json(data);
    }
  );

  public getMoneyReceiptByPurchaseId = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getMoneyReceiptByPurchaseId(
        req
      );
      res.status(code).json(data);
    }
  );
}
export default PurchaseInvController;
