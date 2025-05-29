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
}
export default InvoiceController;
