import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import { BtocPaymentServices } from "../services/btoc.payment.service";
import { BtocPaymentValidator } from "../utills/validators/btoc.payment.validator";

export class BtocPaymentController extends AbstractController {
  private service = new BtocPaymentServices();
  private validator = new BtocPaymentValidator();
  constructor() {
    super();
  }

  // public createPayment = this.asyncWrapper.wrap(
  //   null,
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } = await this.service.createPayment(req);
  //     res.status(code).json(data);
  //   }
  // );

  public createSurjopayPaymentOrder = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createSurjopayPaymentOrder,
      // querySchema: this.validator.paymentQueryValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createSurjopayPaymentOrder(
        req
      );

      res.status(code).json(data);
    }
  );

  // public getInvoice = this.asyncWrapper.wrap(
  //   null,
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } = await this.service.getInvoice(req);
  //     res.status(code).json(data);
  //   }
  // );

  // public singleInvoice = this.asyncWrapper.wrap(
  //   { paramSchema: this.commonValidator.singleParamStringValidator("id") },
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } = await this.service.singleInvoice(req);
  //     res.status(code).json(data);
  //   }
  // );
}
