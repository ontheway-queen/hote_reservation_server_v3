import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import MAdministrationService from "../services/mAdmin.administration.service";
import MAdministrationValidator from "../utlis/validator/mAdministration.validator";

class MAdministrationController extends AbstractController {
  private administrationService = new MAdministrationService();
  private mAdministratorValidator = new MAdministrationValidator();
  constructor() {
    super();
  }

  public createAdmin = this.asyncWrapper.wrap(
    { bodySchema: this.mAdministratorValidator.createAdminValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.administrationService.createAdmin(
        req
      );

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
      const { code, ...data } = await this.administrationService.updateAdmin(
        req
      );

      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  // get all admin
  public getAllAdmin = this.asyncWrapper.wrap(
    { querySchema: this.mAdministratorValidator.getAllAdminQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.administrationService.getAllAdmin(
        req
      );

      res.status(code).json(data);
    }
  );
}

export default MAdministrationController;
