import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import PayRollService from "../services/payroll.service";
import PayRollValidator from "../utlis/validator/payRoll.validator";

// mehedi
class PayRollController extends AbstractController {
  private service = new PayRollService();
  private payRollValidator = new PayRollValidator();
  constructor() {
    super();
  }

  public createPayRoll = this.asyncWrapper.wrap(
    { bodySchema: this.payRollValidator.CreatePayrollValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createPayRoll(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getAllPayRoll = this.asyncWrapper.wrap(
    { querySchema: this.payRollValidator.getAllPayRollValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllPayRoll(req);
      res.status(code).json(data);
    }
  );

  public getSinglePayRoll = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSinglePayRoll(req);

      res.status(code).json(data);
    }
  );

  public updatePayRollController = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.payRollValidator.updatePayrollValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updatePayRoll(req);

      res.status(code).json(data);
    }
  );

  public deletePayRollController = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deletePayRoll(req);

      res.status(code).json(data);
    }
  );
}
export default PayRollController;
