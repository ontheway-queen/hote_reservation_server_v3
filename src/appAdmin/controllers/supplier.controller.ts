import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import SupplierService from "../services/supplier.service";
import HRconfigurationValidator from "../utlis/validator/hrConfiguration.validator";

class SupplierController extends AbstractController {
  private service = new SupplierService();
  private validator = new HRconfigurationValidator();
  constructor() {
    super();
  }

  public createSupplier = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createSupplierValidatorValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createSupplier(req);

      res.status(code).json(data);
    }
  );

  public getAllSupplier = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllSupplierQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllSupplier(req);

      res.status(code).json(data);
    }
  );

  public getAllSupplierPaymentById = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllSupplierPaymentById(
        req
      );

      res.status(code).json(data);
    }
  );

  public getAllSupplierInvoiceById = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllSupplierInvoiceById(
        req
      );

      res.status(code).json(data);
    }
  );

  public updateSupplier = this.asyncWrapper.wrap(
    { bodySchema: this.validator.UpdateSupplierValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSupplier(req);

      res.status(code).json(data);
    }
  );

  public deleteSupplier = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteSupplier(req);

      res.status(code).json(data);
    }
  );

  public supplierPayment = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.supplierPayment,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.supplierPayment(req);
      res.status(code).json(data);
    }
  );

  public getAllSupplierPayment = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllSupplierPayment(req);
      res.status(code).json(data);
    }
  );
}
export default SupplierController;
