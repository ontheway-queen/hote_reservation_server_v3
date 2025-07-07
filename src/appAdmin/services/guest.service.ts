import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

export class GuestService extends AbstractServices {
  constructor() {
    super();
  }

  // Create Guest
  public async createGuest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { name, email, city, country } = req.body;

      // Model
      const model = this.Model.guestModel(trx);

      // Check if user already exists
      const checkUser = await model.getSingleGuest({
        email,
        hotel_code,
      });

      if (checkUser.length > 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Email already exists, give another unique email address",
        };
      }

      let userRes: any;

      // Create user
      userRes = await model.createGuest({
        first_name: name,
        last_name: name,
        email,
        city,
        country,
        hotel_code,
      });

      const userID = userRes[0].id;

      // Check user's user_type

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Guest created successfully.",
      };
    });
  }

  // get All guest service
  public async getAllGuest(req: Request) {
    const { search, email, limit, skip, status } = req.query;
    const { hotel_code } = req.hotel_admin;

    const { data, total } = await this.Model.guestModel().getAllGuest({
      status: status as string,
      key: search as string,
      email: email as string,
      limit: limit as string,
      skip: skip as string,
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getSingleGuest(req: Request) {
    const singleGuest = await this.Model.guestModel().getSingleGuest({
      hotel_code: req.hotel_admin.hotel_code,
      id: parseInt(req.params.id),
    });

    if (!singleGuest.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: singleGuest[0],
    };
  }

  public async updateSingleGuestValidator(req: Request) {
    const { first_name, last_name, email, address, phone, country_id } =
      req.body;

    console.log(req.body);
    const { hotel_code } = req.hotel_admin;

    // Model
    const model = this.Model.guestModel();

    // Check if user already exists
    const checkUser = await model.getSingleGuest({
      hotel_code,
      id: parseInt(req.params.id),
    });

    if (checkUser.length === 0) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "Guest not found",
      };
    }

    // Update guest
    await model.updateSingleGuest(
      {
        id: parseInt(req.params.id),
        hotel_code,
      },
      {
        first_name,
        last_name,
        email,
        address,
        phone,
        country_id,
      }
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Guest updated successfully",
    };
  }
}
export default GuestService;
