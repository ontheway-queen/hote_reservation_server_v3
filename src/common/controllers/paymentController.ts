import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import PaymentService from "../services/paymentService";

class PaymentController extends AbstractController {
  private PaymentService = new PaymentService();

  constructor() {
    super();
  }

  public btocSurjoPaymentSuccess = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } =
        await this.PaymentService.btocSurjoPaymentSuccess(req);
      if (rest.redirect_url) {
        res.status(code).redirect(rest.redirect_url);
      } else {
        res.status(code).json(rest);
      }
    }
  );

  public btocSurjoPaymentCancelled = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } =
        await this.PaymentService.btocSurjoPaymentCancelled(req);
      if (rest.redirect_url) {
        res.status(code).redirect(rest.redirect_url);
      } else {
        res.status(code).json(rest);
      }
    }
  );

  public btocSurjoPaymentFailed = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } =
        await this.PaymentService.btocSurjoPaymentFailed(req);
      if (rest.redirect_url) {
        res.status(code).redirect(rest.redirect_url);
      } else {
        res.status(code).json(rest);
      }
    }
  );
}

export default PaymentController;
