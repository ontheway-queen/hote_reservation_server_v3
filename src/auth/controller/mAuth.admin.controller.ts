import { Request, Response } from "express";

import AbstractController from "../../abstarcts/abstract.controller";
import CommonService from "../../common/services/commonServices";
import { ILogin } from "../../common/types/commontypes";
import MAdminAuthService from "../services/mAuth.admin.service";
import MAuthValidator from "../utils/validator/mAuth.validator";
import Schema from "../../utils/miscellaneous/schema";

class MAdminAuthController extends AbstractController {
  private mAdminAuthService = new MAdminAuthService();
  private commonService = new CommonService();
  private mAuthValidator = new MAuthValidator();
  constructor() {
    super();
  }

  // login
  public login = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { email, password } = req.body as ILogin;
      const { code, ...data } = await this.mAdminAuthService.login({
        email,
        password,
      });
      res.status(code).json(data);
    }
  );

  // get profile
  public getProfile = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.mAdminAuthService.getProfile(req);
      res.status(code).json(data);
    }
  );

  // update profile
  public updateProfile = this.asyncWrapper.wrap(
    { bodySchema: this.mAuthValidator.updateProfileValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.mAdminAuthService.updateProfile(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  // forget password
  public forgetPassword = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.forgetPasswordValidator },
    async (req: Request, res: Response) => {
      const { token, email, password } = req.body;
      const { code, ...data } = await this.mAdminAuthService.forgetService({
        token,
        email,
        password,
      });
      res.status(code).json(data);
    }
  );

  // change password
  public changeAdminPassword = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.changePasswordValidator },
    async (req: Request, res: Response) => {
      const { old_password, new_password } = req.body;
      const { id } = req.admin;
      const table = "user_admin";
      const passField = "password";
      const userIdField = "id";

      const { code, ...data } = await this.commonService.userPasswordVerify({
        table,
        oldPassword: old_password,
        passField,
        userId: id,
        userIdField,
        schema: new Schema().M_SCHEMA,
      });

      if (data.success) {
        const { code, ...data } = await this.commonService.changePassword({
          password: new_password,
          table,
          passField,
          userId: id,
          userIdField,
          schema: new Schema().M_SCHEMA,
        });

        res.status(code).json(data);
      } else {
        res.status(code).json(data);
      }
    }
  );
}

export default MAdminAuthController;
