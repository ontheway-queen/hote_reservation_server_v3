import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { ILogin } from "../../common/types/commontypes";
import config from "../../config/config";
import Lib from "../../utils/lib/lib";
import { OTP_TYPE_FORGET_HOTEL_ADMIN } from "../../utils/miscellaneous/constants";

class HotelAdminAuthService extends AbstractServices {
  constructor() {
    super();
  }

  // login
  public async login({ email, password }: ILogin) {
    const model = this.Model.rAdministrationModel();
    const checkUser = await model.getSingleAdmin({ email });

    if (!checkUser) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.WRONG_CREDENTIALS,
      };
    }

    const {
      password: hashPass,
      id,
      status,
      hotel_status,
      hotel_contact_details,
      ...rest
    } = checkUser;

    if (hotel_status == "disabled") {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Your hotel account has been disabled. Please contact support",
      };
    } else if (hotel_status == "expired") {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Your hotel account has been expired",
      };
    }

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
      { status, ...rest, id, type: "admin" },
      config.JWT_SECRET_HOTEL_ADMIN,
      "24h"
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.LOGIN_SUCCESSFUL,

      data: {
        id,
        ...rest,
        status,
        hotel_contact_details,
      },
      token,
    };
  }

  // get profile
  public async getProfile(req: Request) {
    const { id } = req.hotel_admin;

    const data = await this.Model.rAdministrationModel().getSingleAdmin({
      id,
    });

    const { password, ...rest } = data;

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        ...rest,
      },
    };
  }

  // update profile
  public async updateProfile(req: Request) {
    const { id } = req.hotel_admin;

    const model = this.Model.rAdministrationModel();

    const checkAdmin = await model.getSingleAdmin({
      id,
    });

    if (!checkAdmin) {
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

    const { email } = checkAdmin;

    await model.updateAdmin(req.body, { email });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Profile updated successfully",
    };
  }

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
    const tokenVerify: any = Lib.verifyToken(
      token,
      config.JWT_SECRET_HOTEL_ADMIN
    );

    if (!tokenVerify) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }

    const { email: verifyEmail, type } = tokenVerify;

    if (email === verifyEmail && type === OTP_TYPE_FORGET_HOTEL_ADMIN) {
      const hashPass = await Lib.hashPass(password);
      const adminModel = this.Model.rAdministrationModel();
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

export default HotelAdminAuthService;
