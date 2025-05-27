import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { newHotelUserAccount } from "../../templates/mHotelUserCredentials.template";
import Lib from "../../utils/lib/lib";
import { OTP_FOR_CREDENTIALS } from "../../utils/miscellaneous/constants";
import { IhotelPermissions } from "../utlis/interfaces/mConfiguration.interfaces.";
import { IhotelCreateRequestBodyPayload } from "../utlis/interfaces/mHotel.common.interface";

class MHotelService extends AbstractServices {
  constructor() {
    super();
  }

  public async createHotel(req: Request) {
    return await this.db.transaction(async (trx) => {
      const {
        hotel_email,
        user_name,
        password,
        accommodation_type_id,
        hotel_name,
        address,
        chain_name,
        city_code,
        country_code,
        description,
        expiry_date,
        latitude,
        longitude,
        postal_code,
        star_category,
      } = req.body as IhotelCreateRequestBodyPayload;

      const expiry = new Date(expiry_date);
      if (expiry < new Date()) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          message: "Expiry date must be later than the current date",
        };
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const model = this.Model.HotelModel(trx);

      const administrationModel = this.Model.rAdministrationModel(trx);

      //  check hotel admin by hotel email
      const checkHotelAdmin = await administrationModel.getSingleAdmin({
        email: hotel_email,
      });

      if (checkHotelAdmin.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Admin email already exists",
        };
      }

      const hashPass = await Lib.hashPass(password);

      // get last hotel id
      const lastHotelId = await model.getHotelLastId();

      const now = new Date();
      const hotel_code = parseInt(
        `${now.getFullYear().toString().slice(2)}${String(
          now.getMonth() + 1
        ).padStart(2, "0")}${String(lastHotelId).padStart(4, "0")}`,
        10
      );

      let logoFilename = "";

      const hotelImages: {
        hotel_code: number;
        image_url: string;
        image_caption?: string;
        main_image: string;
      }[] = [];

      files.forEach((file) => {
        if (file.fieldname === "logo") {
          logoFilename = file.filename;
        } else if (file.fieldname === "hotel_images") {
          hotelImages.push({
            hotel_code,
            image_url: file.filename,
            image_caption: undefined,
            main_image: "N",
          });
        } else if (file.fieldname === "main_image") {
          hotelImages.push({
            hotel_code,
            image_url: file.filename,
            image_caption: undefined,
            main_image: "Y",
          });
        }
      });

      // get single accommodation type
      const getSingleAccomodationType =
        await this.Model.mConfigurationModel().getSingleAccomodation(
          accommodation_type_id
        );

      // create hotel
      await model.createHotel({
        name: hotel_name,
        hotel_code,
        accommodation_type_id,
        accommodation_type_name: getSingleAccomodationType[0]?.name,
        city_code,
        country_code,
        latitude,
        longitude,
        star_category,
        address,
        chain_name,
        description,
        postal_code,
      });

      // insert others info
      await model.insertHotelOtherInfo({
        logo: logoFilename,
        expiry_date: expiry,
        hotel_code,
      });

      // insert hotel images
      await model.insertHotelImages(hotelImages);

      // insert Role
      const roleRes = await administrationModel.createRole({
        name: "super-admin",
        hotel_code,
      });

      // insert user admin
      await administrationModel.insertUserAdmin({
        email: hotel_email,
        name: user_name,
        password: hashPass,
        role: roleRes[0].id,
        hotel_code,
        init_creds: true,
      });

      await Lib.sendEmail(
        hotel_email,
        OTP_FOR_CREDENTIALS,
        newHotelUserAccount(hotel_email, password, hotel_name)
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  // get all hotel
  public async getAllHotel(req: Request) {
    const { status, from_date, to_date, name, limit, skip, group, city } =
      req.query;
    const model = this.Model.HotelModel();

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const { data, total } = await model.getAllHotel({
      name: name as string,
      status: status as string,
      from_date: from_date as string,
      to_date: endDate as unknown as string,
      limit: limit as string,
      skip: skip as string,
      group: group as string,
      city: city as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // get single hotel
  public async getSingleHotel(req: Request) {
    const { id } = req.params;

    const model = this.Model.HotelModel();
    const getSingleHotel = await model.getSingleHotel({ id: parseInt(id) });

    if (!getSingleHotel.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    // const data: IhotelPermissions[] =
    //   await this.Model.mConfigurationModel().getAllPermissionByHotel(
    //     parseInt(id)
    //   );

    // const { permissions } = data[0];

    // const groupedPermissions: any = {};

    // permissions?.forEach((entry) => {
    //   const permission_group_id = entry.permission_group_id;
    //   const permission = {
    //     permission_id: entry.permission_id,
    //     permission_name: entry.permission_name,
    //   };

    //   if (!groupedPermissions[permission_group_id]) {
    //     groupedPermissions[permission_group_id] = {
    //       permission_group_id: permission_group_id,
    //       permissionGroupName: entry.permission_group_name,
    //       permissions: [permission],
    //     };
    //   } else {
    //     groupedPermissions[permission_group_id].permissions.push(permission);
    //   }
    // });
    // const result = Object.values(groupedPermissions);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: getSingleHotel[0],
      // data: { ...rest, permissions: result },
    };
  }

  // update hotel
  public async updateHotel(req: Request) {
    return await this.db.transaction(async (trx) => {
      const body = req.body;

      const { id } = req.params;

      if (body.expiry_date < new Date()) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          message: "Date expiry cannot shorter than present Date",
        };
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const model = this.Model.HotelModel(trx);

      // check user
      const checkUser = await model.getSingleHotel({ email: body.email });

      if (!checkUser.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (files.length) {
        body["logo"] = files[0].filename;
      }

      await model.updateHotel(body, { id: parseInt(id) });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "User updated successfully",
      };
    });
  }
}

export default MHotelService;
