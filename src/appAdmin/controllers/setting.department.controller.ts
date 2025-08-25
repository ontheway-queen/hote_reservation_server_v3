import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import DepartmentSettingService from "../services/setting.department.service";
import SettingValidator from "../utlis/validator/setting.validator";

class DepartmentSettingController extends AbstractController {
  private departmentSettingService = new DepartmentSettingService();
  private settingValidator = new SettingValidator();
  constructor() {
    super();
  }

  public createDepartment = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.createdepartmentValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.departmentSettingService.createDepartment(req);

      res.status(code).json(data);
    }
  );

  public getAllDepartment = this.asyncWrapper.wrap(
    { querySchema: this.settingValidator.getAlldepartmentQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.departmentSettingService.getAllDepartment(req);

      res.status(code).json(data);
    }
  );

  public getSingleDepartment = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.departmentSettingService.getSingleDepartment(req);

      res.status(code).json(data);
    }
  );

  public updateDepartment = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.UpdatedepatmentValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.departmentSettingService.updateDepartment(req);

      res.status(code).json(data);
    }
  );

  public deleteDepartment = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.departmentSettingService.deleteDepartment(req);

      res.status(code).json(data);
    }
  );
}
export default DepartmentSettingController;
