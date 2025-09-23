import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ProductInvService from "../services/product.service";
import ProductInvValidator from "../utils/validation/product.validator";

class ProductInvController extends AbstractController {
  private service = new ProductInvService();
  private validator = new ProductInvValidator();
  constructor() {
    super();
  }

  public createProduct = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createProductInvValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createProduct(req);

      res.status(code).json(data);
    }
  );

  public getAllProduct = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllProductInvValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllProduct(req);

      res.status(code).json(data);
    }
  );

  public updateProduct = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamStringValidator(),
      bodySchema: this.validator.updateProductInvValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateProduct(req);

      res.status(code).json(data);
    }
  );

  //=================== Damaged Product  ======================//

  public createDamagedProduct = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createDamagedProductValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createDamagedProduct(req);

      res.status(code).json(data);
    }
  );

  public getAllDamagedProduct = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllDamagedProductValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllDamagedProduct(req);

      res.status(code).json(data);
    }
  );

  public getSingleDamagedProduct = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleDamagedProduct(req);

      res.status(code).json(data);
    }
  );
}
export default ProductInvController;
