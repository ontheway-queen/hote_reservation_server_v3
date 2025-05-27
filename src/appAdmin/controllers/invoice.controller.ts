import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import InvoiceService from "../services/invoice.service";
import InvoiceValidator from "../utlis/validator/invoice.validator";

class InvoiceController extends AbstractController {
  private invoiceService = new InvoiceService();
  private invoicevalidator = new InvoiceValidator();
  constructor() {
    super();
  }

  // get all invoice controller with filter
  public getAllInvoice = this.asyncWrapper.wrap(
    { querySchema: this.invoicevalidator.getAllInvoiceValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.invoiceService.getAllInvoice(req);
      res.status(code).json(data);
    }
  );

  // get Single invoice Controller
  public getSingleInvoice = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator("invoice_id") },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.invoiceService.getSingleInvoice(req);
      res.status(code).json(data);
    }
  );

  // get all invoice for money reciept
  public getAllInvoiceForMoneyReceipt = this.asyncWrapper.wrap(
    { querySchema: this.invoicevalidator.getAllInvoiceValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.invoiceService.getAllInvoiceForMoneyReceipt(req);
      res.status(code).json(data);
    }
  );

  // create invoice
  public createInvoice = this.asyncWrapper.wrap(
    { bodySchema: this.invoicevalidator.createInvoiceValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.invoiceService.createInvoice(req);
      res.status(code).json(data);
    }
  );
}
export default InvoiceController;
