import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { ILogin } from "../../common/types/commontypes";
import config from "../../config/config";
import Lib from "../../utils/lib/lib";
import { OTP_TYPE_FORGET_M_ADMIN } from "../../utils/miscellaneous/constants";
class MAdminAuthService extends AbstractServices {
  constructor() {
    super();
  }

  // login
  public async login({ email, password }: ILogin) {
    const model = this.Model.mAdmiministrationModel();
    const checkUser = await model.getSingleAdmin({ email });

    if (!checkUser.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.WRONG_CREDENTIALS,
      };
    }

    const { password: hashPass, status, created_at, ...rest } = checkUser[0];

    if (!status) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Your credential has been deactivated",
      };
    }

    const checkPass = await Lib.compare(password, hashPass);

    if (!checkPass) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.WRONG_CREDENTIALS,
      };
    }

    const token = Lib.createToken(
      { status, ...rest, type: "admin" },
      config.JWT_SECRET_M_ADMIN,
      "24h"
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.LOGIN_SUCCESSFUL,
      data: rest,
      token,
    };
  }

  // get profile
  public async getProfile(req: Request) {
    const data = await this.Model.mAdmiministrationModel().getSingleAdmin({
      id: req.admin.id,
    });
    console.log({ data });

    const { password, ...rest } = data[0];
    // const rolePermissionModel = this.Model.mRolePermissionModel();

    // const res = await rolePermissionModel.getAdminRolePermission(id);

    // const { id: admin_id, name, role_id, role_name, permissions } = res[0];

    // const output_data: any = [];

    // permissions.forEach((entry: any) => {
    //   let found = false;

    //   output_data.forEach((item: any) => {
    //     if (item.subModules[0].permission_id === entry.permission_id) {
    //       item.subModules[0].permission_type.push(entry.permission_type);
    //       found = true;
    //     }
    //   });

    //   if (!found) {
    //     output_data.push({
    //       permission_group_id: entry.permission_group_id,
    //       permission_group_name: entry.permission_group_name,
    //       subModules: [
    //         {
    //           permission_id: entry.permission_id,
    //           permission_name: entry.permission_name,
    //           permission_type: [entry.permission_type],
    //         },
    //       ],
    //     });
    //   }
    // });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      // data: { ...data[0], authorization: output_data },
      data: rest,
    };
  }

  // update profile
  public async updateProfile(req: Request) {
    const { id } = req.admin;

    // Fetch the admin by ID
    const checkAdmin = await this.Model.mAdmiministrationModel().getSingleAdmin(
      {
        id,
      }
    );

    if (!checkAdmin.length) {
      return {
        success: true,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const files = (req.files as Express.Multer.File[]) || [];

    if (files.length) {
      req.body[files[0].fieldname] = files[0].filename;
    }

    const { email } = checkAdmin[0];
    const model = this.Model.mAdmiministrationModel();

    // Update admin profile
    await model.updateAdmin(req.body, { email });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Profile updated successfully",
    };
  }

  // public async updateProfile(req: Request) {
  //   const { id } = req.admin;

  //   const checkAdmin = await this.Model.mUserAdminModel().getAdminById(id);

  //   if (!checkAdmin.length) {
  //     return {
  //       success: true,
  //       code: this.StatusCode.HTTP_NOT_FOUND,
  //       message: this.ResMsg.HTTP_NOT_FOUND,
  //     };
  //   }

  //   const files = (req.files as Express.Multer.File[]) || [];

  //   if (files.length) {
  //     req.body[files[0].fieldname] = files[0].filename;
  //   }

  //   const { email } = checkAdmin[0];
  //   const model = this.Model.mUserAdminModel();

  //   await model.updateAdmin(req.body, { email });

  //   return {
  //     success: true,
  //     code: this.StatusCode.HTTP_OK,
  //     message: "Profile updated successfully",
  //   };
  // }

  // forget
  public async forgetService({
    token,
    email,
    password,
  }: {
    token: string;
    email: string;
    password: string;
  }) {
    const tokenVerify: any = Lib.verifyToken(token, config.JWT_SECRET_M_ADMIN);

    if (!tokenVerify) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }

    const { email: verifyEmail, type } = tokenVerify;

    if (email === verifyEmail && type === OTP_TYPE_FORGET_M_ADMIN) {
      const hashPass = await Lib.hashPass(password);
      const adminModel = this.Model.mAdmiministrationModel();
      await adminModel.updateAdmin({ password: hashPass }, { email });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_FULFILLED,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.HTTP_BAD_REQUEST,
      };
    }
  }
}

export default MAdminAuthService;
