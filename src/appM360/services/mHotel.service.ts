import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { newHotelUserAccount } from "../../templates/mHotelUserCredentials.template";
import Lib from "../../utils/lib/lib";
import { OTP_FOR_CREDENTIALS } from "../../utils/miscellaneous/constants";
import {
  IhotelCreateRequestBodyPayload,
  IUpdateHotelReqBody,
} from "../utlis/interfaces/mHotel.common.interface";
import config from "../../config/config";

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
        fax,
        phone,
        website_url,
        permission,
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

      if (checkHotelAdmin) {
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
        expiry_date,
      });

      // insert others info
      await model.insertHotelContactDetails({
        logo: logoFilename,
        email: hotel_email,
        fax,
        phone,
        hotel_code,
        website_url,
      });

      // Insert hotel accounts head
      await Lib.insertHotelCOA(trx, hotel_code);

      if (hotelImages.length) await model.insertHotelImages(hotelImages);

      // ============ create hotel admin step ==============//

      const configModel = this.Model.mConfigurationModel(trx);

      let extractPermission;
      let permissionRes: any[] = [];
      if (permission) {
        extractPermission = JSON.parse(permission);

        // check all permission
        const checkAllPermission = await configModel.getAllPermission({
          ids: extractPermission,
        });

        if (checkAllPermission.length != extractPermission.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Invalid Permissions",
          };
        }

        const hotel_permission_payload = extractPermission.map(
          (item: number) => {
            return {
              permission_id: item,
              hotel_code,
            };
          }
        );

        // insert hotel permission
        permissionRes = await configModel.addedHotelPermission(
          hotel_permission_payload
        );
      }

      // insert Role
      const roleRes = await administrationModel.createRole({
        name: "Super Admin",
        hotel_code,
        init_role: true,
      });

      if (permission) {
        const rolePermissionPayload: {
          role_id: Number;
          hotel_code: number;
          h_permission_id: Number;
          read: number;
          write: number;
          update: number;
          delete: number;
          created_by?: Number;
        }[] = [];

        for (let i = 0; i < extractPermission.length; i++) {
          for (let j = 0; j < 4; j++) {
            rolePermissionPayload.push({
              hotel_code,
              h_permission_id: permissionRes[0].id + i,
              read: 1,
              write: 1,
              update: 1,
              delete: 1,
              role_id: roleRes[0].id,
            });
          }
        }

        // insert role permission
        await administrationModel.insertInRolePermission(rolePermissionPayload);
      }

      // insert user admin
      await administrationModel.createAdmin({
        email: hotel_email,
        name: user_name,
        password: hashPass,
        role_id: roleRes[0].id,
        hotel_code,
        owner: true,
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

  public async getAllHotel(req: Request) {
    const { status, from_date, to_date, key, limit, skip } = req.query;
    const model = this.Model.HotelModel();

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const { data, total } = await model.getAllHotel({
      name: key as string,
      status: status as string,
      from_date: from_date as string,
      to_date: endDate as unknown as string,
      limit: limit as string,
      skip: skip as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getSingleHotel(req: Request) {
    const { id } = req.params;

    const model = this.Model.HotelModel();
    const getSingleHotel = await model.getSingleHotel({ id: parseInt(id) });

    if (!getSingleHotel) {
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
      data: getSingleHotel,
      // data: { ...rest, permissions: result },
    };
  }

  public async updateHotel(req: Request) {
    return await this.db.transaction(async (trx) => {
      const {
        fax,
        phone,
        website_url,
        hotel_email,
        remove_hotel_images,
        expiry_date,
        optional_phone1,
        hotel_name,
        ...hotelData
      } = req.body as Partial<IUpdateHotelReqBody>;

      const { id } = req.params;
      const parsedId = parseInt(id);
      const files = (req.files as Express.Multer.File[]) || [];

      if (expiry_date && new Date(expiry_date) < new Date()) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          message: "Expiry date cannot be earlier than today",
        };
      }

      const model = this.Model.HotelModel(trx);
      const existingHotel = await model.getSingleHotel({ id: parsedId });

      if (!existingHotel) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { hotel_code } = existingHotel;

      // Filter out only defined fields for update
      const filteredUpdateData: Partial<IUpdateHotelReqBody> =
        Object.fromEntries(
          Object.entries({
            ...hotelData,
            expiry_date,
            name: hotel_name,
          }).filter(([_, value]) => value !== undefined)
        );

      if (Object.keys(filteredUpdateData).length > 0) {
        await model.updateHotel(filteredUpdateData, { id: parsedId });
      }

      // === Handle file uploads ===
      let logoFilename: string | undefined;
      const hotelImages: {
        hotel_code: number;
        image_url: string;
        image_caption?: string;
        main_image: string;
      }[] = [];

      for (const file of files) {
        const { fieldname, filename } = file;

        if (fieldname === "logo") {
          logoFilename = filename;
        } else {
          hotelImages.push({
            hotel_code,
            image_url: filename,
            image_caption: undefined,
            main_image: fieldname === "main_image" ? "Y" : "N",
          });
        }
      }

      // === Update hotel contact details ===
      const contactUpdates: Record<string, string | undefined> = {
        email: hotel_email,
        fax,
        phone,
        website_url,
      };

      if (logoFilename) {
        contactUpdates.logo = logoFilename;
      }

      const hasContactUpdates = Object.values(contactUpdates).some(
        (val) => val !== undefined
      );

      if (hasContactUpdates) {
        await model.updateHotelContactDetails(contactUpdates, hotel_code);
      }

      // === Insert new hotel images ===
      if (hotelImages.length > 0) {
        await model.insertHotelImages(hotelImages);
      }

      // === Remove selected hotel images ===
      if (
        Array.isArray(remove_hotel_images) &&
        remove_hotel_images.length > 0
      ) {
        await model.deleteHotelImage(remove_hotel_images, hotel_code);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Hotel updated successfully",
      };
    });
  }

  public async directLogin(req: Request) {
    const data = await this.Model.HotelModel().getSingleHotel({
      id: parseInt(req.params.id),
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const model = this.Model.rAdministrationModel();
    const checkUser = await model.getSingleAdmin({
      owner: "true",
      hotel_code: data.hotel_code,
    });

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
}

export default MHotelService;
