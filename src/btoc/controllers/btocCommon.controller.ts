import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import { BtocCommonService } from "../services/btocCommon.service";

export class BtocCommonController extends AbstractController {
  private service = new BtocCommonService();

  constructor() {
    super();
  }
  public getAllPaymentGateway = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAllPaymentGateway(req);
      res.status(code).json(rest);
    }
  );
}
