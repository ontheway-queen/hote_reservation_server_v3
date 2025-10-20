import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ResAdministrationService from "../services/res.administration.service";
import ResAdministrationValidator from "../utils/validator/res.administration.validator";

class ResAdministrationController extends AbstractController {
  private service = new ResAdministrationService();
  private validator = new ResAdministrationValidator();
  constructor() {
    super();
  }

  // get all permission
  public getAllPermission = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllPermission(req);

      res.status(code).json(data);
    }
  );

  // create role
  public createRole = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createRole(req);

      res.status(code).json(data);
    }
  );

  // get role
  public getAllRole = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllRole(req);

      res.status(code).json(data);
    }
  );

  public getSingleRole = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleRole(req);

      res.status(code).json(data);
    }
  );

  public updateSingleRole = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateRolePermissions },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSingleRole(req);

      res.status(code).json(data);
    }
  );

  // create admin
  public createAdmin = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createAdmin,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAdmin(req);

      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  // update admin
  public updateAdmin = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAdmin(req);

      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  // get all admin
  public getAllAdmin = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAdmin(req);

      res.status(code).json(data);
    }
  );

  public getSingleAdmin = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleAdmin(req);

      res.status(code).json(data);
    }
  );
}

export default ResAdministrationController;
