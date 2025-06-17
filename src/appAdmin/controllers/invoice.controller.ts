import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import InvoiceService from "../services/invoice.service";
import InvoiceValidator from "../utlis/validator/invoice.validator";

class InvoiceController extends AbstractController {
  private service = new InvoiceService();
  private validator = new InvoiceValidator();
  constructor() {
    super();
  }

  public createFolioInvoice = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createFolioInvoiceValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createFolioInvoice(req);
      res.status(code).json(data);
    }
  );

  public getAllFolioInvoice = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getAllFolioValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllFolioInvoice(req);
      res.status(code).json(data);
    }
  );

  public getSingleFolioInvoice = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleFolioInvoice(req);
      res.status(code).json(data);
    }
  );

  public deleteSingleFolioInvoice = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteSingleFolioInvoice(
        req
      );
      res.status(code).json(data);
    }
  );

  public getSingleBookingRoomsInvoice = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleBookingRoomsInvoice(
        req
      );
      res.status(code).json(data);
    }
  );
}
export default InvoiceController;
