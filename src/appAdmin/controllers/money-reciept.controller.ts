import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import MoneyRecieptService from "../services/money-reciept.service";
import MoneyRecieptValidator from "../utlis/validator/money-reciept.validator";

class MoneyRecieptController extends AbstractController {
  private service = new MoneyRecieptService();
  private moneyRecieptValidator = new MoneyRecieptValidator();
  constructor() {
    super();
  }

  public getMoneyReceiptByFolio = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getMoneyReceiptByFolio(req);
      res.status(code).json(data);
    }
  );

  public getMoneyReceiptById = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getMoneyReceiptById(req);
      res.status(code).json(data);
    }
  );
}

export default MoneyRecieptController;
