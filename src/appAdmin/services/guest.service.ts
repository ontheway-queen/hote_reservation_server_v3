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
      if (!checkUser.length || checkUser[0].user_type !== "guest") {
        const existingUserType = await model.getExistsUserType(userID, "guest");
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Guest created successfully.",
      };
    });
  }

  // get user Type
  public async getUserType(req: Request) {
    const { email, user_type } = req.query;

    // Fetch data
    const checkGuest = await this.Model.guestModel().getGuest({
      email: email as string,
      user_type: user_type as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
    };
  }

  // get All guest service
  public async getAllGuest(req: Request) {
    const { key, email, limit, skip, user_type } = req.query;
    const { hotel_code } = req.hotel_admin;

    // model
    const model = this.Model.guestModel();

    const { data, total } = await model.getAllGuest({
      key: key as string,
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

  // get Guest Single Profile service

  public async getSingleGuest(req: Request) {
    const { user_id } = req.params;
    // model
    const model = this.Model.guestModel();
    const singleInvoiceData = await model.getSingleGuest({
      hotel_code: req.hotel_admin.hotel_code,
      id: parseInt(user_id),
    });

    if (!singleInvoiceData.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: singleInvoiceData[0],
    };
  }

  // get All hall guest
  public async getHallGuest(req: Request) {
    const { hotel_code } = req.hotel_admin;
    // model
    const model = this.Model.guestModel();

    const { data, total } = await model.getHallGuest({
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // get All room guest
  public async getRoomGuest(req: Request) {
    const { hotel_code } = req.hotel_admin;

    // model
    const model = this.Model.guestModel();

    const { data, total } = await model.getRoomGuest({
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }
}
export default GuestService;
