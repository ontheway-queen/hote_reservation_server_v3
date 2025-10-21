import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IUpdateRestaurantUserAdminPayload } from "../../appAdmin/utlis/interfaces/restaurant.hotel.interface";
import config from "../../config/config";
import Lib from "../../utils/lib/lib";
import { OTP_TYPE_FORGET_RESTAURANT_ADMIN } from "../../utils/miscellaneous/constants";

class AuthHotelRestaurantAdminService extends AbstractServices {
  constructor() {
    super();
  }

  public async login(req: Request) {
    const { email, password } = req.body as unknown as {
      email: string;
      password: string;
    };
    const model = this.restaurantModel.restaurantAdminModel();
    const user = await model.getRestaurantAdmin({ email });
    if (!user) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }

    if (user.status !== "active") {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: `Your account is ${user.status}. Please contact support.`,
      };
    }

    const { password: hashPass, is_deleted, ...rest } = user;

    const isPasswordValid = await Lib.compare(password, hashPass);
    if (!isPasswordValid) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.WRONG_CREDENTIALS,
      };
    }

    const tokenPayload = {
      id: user.id,
      hotel_code: user.hotel_code,
      restaurant_id: user.restaurant_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      type: "admin",
    };

    const token = Lib.createToken(
      tokenPayload,
      config.JWT_SECRET_H_RESTURANT,
      "24h"
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Successfully Logged In",
      data: rest,
      token,
    };
  }

  public async getProfile(req: Request) {
    const { id, hotel_code, restaurant_id } = req.restaurant_admin;

    const restaurantAdminModel = this.restaurantModel.restaurantAdminModel();
    const data = await restaurantAdminModel.getRestaurantAdminProfile({
      id,
      hotel_code,
      restaurant_id,
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const singleRolePermissions =
      await restaurantAdminModel.getSingleRoleByView({
        id: data.role_id,
        hotel_code,
      });

    const output_data: {
      permission_group_id: number;
      permission_group_name: string;
      subModules: {
        permission_id: number;
        permission_name: string;
        permissions: {
          read: 0 | 1;
          write: 0 | 1;
          update: 0 | 1;
          delete: 0 | 1;
        };
      }[];
    }[] = [];
    const { permissions } = singleRolePermissions || {};

    if (permissions?.length) {
      for (const perm of permissions) {
        let group = output_data.find(
          (g) => g.permission_group_id === perm.permission_group_id
        );
        if (!group) {
          group = {
            permission_group_id: perm.permission_group_id,
            permission_group_name: perm.permission_group_name,
            subModules: [],
          };
          output_data.push(group);
        }

        // Push permission submodule
        group.subModules.push({
          permission_id: perm.permission_id,
          permission_name: perm.permission_name,
          permissions: {
            read: perm.read,
            write: perm.write,
            update: perm.update,
            delete: perm.delete,
          },
        });
      }
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        ...data,
        permissions: output_data,
      },
    };
  }

  public async updateProfile(req: Request) {
    const { id, hotel_code } = req.restaurant_admin;
    const body = req.body as IUpdateRestaurantUserAdminPayload;
    console.log({ body });
    const model = this.restaurantModel.restaurantAdminModel();

    const checkAdmin = await model.getRestaurantAdmin({
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

    if (body?.email) {
      const emailExists = await model.getAllRestaurantAdminEmail({
        email: body.email,
        hotel_code,
      });
      if (emailExists) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Restaurant Admin's email already exists with this hotel.",
        };
      }
    }

    await model.updateRestaurantAdmin({ id, payload: body });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  public async changeAdminPassword(req: Request) {
    const { id } = req.restaurant_admin;
    const { old_password, new_password } = req.body as {
      old_password: string;
      new_password: string;
    };

    const model = this.restaurantModel.restaurantAdminModel();

    const checkAdmin = await model.getRestaurantAdmin({
      id,
    });

    if (!checkAdmin) {
      return {
        success: true,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const comparePassword = await Lib.compare(
      old_password,
      checkAdmin.password
    );

    if (!comparePassword) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: "Old password is not correct!",
      };
    }

    const hashPass = await Lib.hashPass(new_password);

    await model.updateRestaurantAdmin({
      id,
      payload: { password: hashPass },
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  public async resetForgetPassword({
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
      config.JWT_SECRET_H_RESTURANT
    );

    if (!tokenVerify) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }

    const { email: verifyEmail, type } = tokenVerify;

    if (email === verifyEmail && type === OTP_TYPE_FORGET_RESTAURANT_ADMIN) {
      const hashPass = await Lib.hashPass(password);
      const adminModel = this.restaurantModel.restaurantAdminModel();
      await adminModel.updateRestaurantAdmin({
        email,
        payload: { password: hashPass },
      });

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

export default AuthHotelRestaurantAdminService;
