import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IupdateHotelBodyPayload } from "../utlis/interfaces/setting.interface";
import { IUpdateHotelReqBody } from "../../appM360/utlis/interfaces/mHotel.common.interface";

class HotelService extends AbstractServices {
  constructor() {
    super();
  }

  // get my hotel
  public async getMyHotel(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const checkHotel = await this.Model.HotelModel().getSingleHotel({
      hotel_code,
    });

    if (!checkHotel) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: checkHotel,
    };
  }

  // update my hotel
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
      } = req.body as Partial<IupdateHotelBodyPayload>;

      const hotel_code = req.hotel_admin.hotel_code;
      const files = (req.files as Express.Multer.File[]) || [];

      if (expiry_date && new Date(expiry_date) < new Date()) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          message: "Expiry date cannot be earlier than today",
        };
      }

      const model = this.Model.HotelModel(trx);
      const existingHotel = await model.getSingleHotel({ hotel_code });

      if (!existingHotel) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // Filter out only defined fields for update
      const filteredUpdateData: Partial<IupdateHotelBodyPayload> =
        Object.fromEntries(
          Object.entries({
            ...hotelData,
            expiry_date,
            name: hotel_name,
          }).filter(([_, value]) => value !== undefined)
        );

      if (Object.keys(filteredUpdateData).length > 0) {
        await model.updateHotel(filteredUpdateData, { id: existingHotel.id });
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
        optional_phone1,
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
      console.log({ remove_hotel_images });
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
}

export default HotelService;
