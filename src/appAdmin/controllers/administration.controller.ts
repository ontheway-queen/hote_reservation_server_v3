import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import service from "../services/administration.service";
import validator from "../utlis/validator/administration.validator";

class AdministrationController extends AbstractController {
  private service = new service();
  private validator = new validator();
  constructor() {
    super();
  }

  // // get all permission
  // public getAllPermission = this.asyncWrapper.wrap(
  //   null,
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } =
  //       await this.service.getAllPermission(req);

  //     res.status(code).json(data);
  //   }
  // );

  // // create role
  // public createRole = this.asyncWrapper.wrap(
  //   { bodySchema: this.administratorValidator.createRolePermissionValidator },
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } = await this.service.createRole(
  //       req
  //     );

  //     res.status(code).json(data);
  //   }
  // );

  // // get role
  // public getRole = this.asyncWrapper.wrap(
  //   null,
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } = await this.service.getRole(req);

  //     res.status(code).json(data);
  //   }
  // );

  // // get single role
  // public getSingleRole = this.asyncWrapper.wrap(
  //   { paramSchema: this.commonValidator.singleParamValidator() },
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } = await this.service.getSingleRole(
  //       req
  //     );

  //     res.status(code).json(data);
  //   }
  // );

  // // update single role
  // public updateSingleRole = this.asyncWrapper.wrap(
  //   null,
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } =
  //       await this.service.updateSingleRole(req);

  //     res.status(code).json(data);
  //   }
  // );

  // // create admin
  // public createAdmin = this.asyncWrapper.wrap(
  //   { bodySchema: this.administratorValidator.createAdminValidator },
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } = await this.service.createAdmin(
  //       req
  //     );

  //     if (data.success) {
  //       res.status(code).json(data);
  //     } else {
  //       this.error(data.message, code);
  //     }
  //   }
  // );

  // // update admin
  // public updateAdmin = this.asyncWrapper.wrap(
  //   null,
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } = await this.service.updateAdmin(
  //       req
  //     );

  //     if (data.success) {
  //       res.status(code).json(data);
  //     } else {
  //       this.error(data.message, code);
  //     }
  //   }
  // );

  // // get all admin
  // public getAllAdmin = this.asyncWrapper.wrap(
  //   { querySchema: this.administratorValidator.getAllAdminQueryValidator },
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } = await this.service.getAllAdmin(
  //       req
  //     );

  //     res.status(code).json(data);
  //   }
  // );

  //create role
  public createRole = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createRole },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createRole(req);
      res.status(code).json(data);
    }
  );

  //role list
  public roleList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.roleList(req);
      res.status(code).json(data);
    }
  );

  //permission list
  public permissionList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.permissionList(req);
      res.status(code).json(data);
    }
  );

  //get single role permission
  public getSingleRolePermission = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleRolePermission(req);
      res.status(code).json(data);
    }
  );

  //update role permission
  public updateRolePermissions = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.validator.updateRolePermissions,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateRolePermissions(req);
      res.status(code).json(data);
    }
  );

  //create admin
  public createAdmin = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createAdmin,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAdmin(req);
      res.status(code).json(data);
    }
  );

  //get all admin
  public getAllAdmin = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllAdminQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAdmin(req);
      res.status(code).json(data);
    }
  );

  //get single admin
  public getSingleAdmin = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleAdmin(req);
      res.status(code).json(data);
    }
  );

  //update admin
  public updateAdmin = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateAdmin },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAdmin(req);
      res.status(code).json(data);
    }
  );
}

export default AdministrationController;
