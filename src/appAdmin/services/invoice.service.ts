// invoice.service.ts
import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IcreateInvoicePayload } from "../utlis/interfaces/invoice.interface";

export class InvoiceService extends AbstractServices {
  constructor() {
    super();
  }
}
export default InvoiceService;
