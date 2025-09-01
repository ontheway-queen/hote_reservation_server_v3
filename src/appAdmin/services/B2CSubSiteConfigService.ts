import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IB2CSubUpdateSiteConfigReqBody,
  ICreateAgencyB2CSocialLinkPayload,
  ICreateHeroBGContentReqBody,
  IUpdateAgencyB2CHeroBgContentPayload,
  IUpdateAgencyB2CPopUpBannerPayload,
  IUpdateAgencyB2CSiteConfigPayload,
  IUpdateAgencyB2CSocialLinkPayload,
  IUpdateHeroBGContentReqBody,
  IUpSertPopUpBannerReqBody,
} from "../utlis/interfaces/configuration.interface";
import CustomError from "../../utils/lib/customEror";
import { heroBG } from "../../utils/miscellaneous/siteConfig/pagesContent";
import { ICreateFaqBody } from "../utlis/interfaces/faq.types";

export class B2CSubSiteConfigService extends AbstractServices {
  constructor() {
    super();
  }

  public async updateSiteConfig(req: Request) {
    return this.db.transaction(async (trx) => {
      const { emails, numbers, address, ...body } =
        req.body as IB2CSubUpdateSiteConfigReqBody;
      const files = (req.files as Express.Multer.File[]) || [];
      const { hotel_code, id: user_id } = req.hotel_admin;

      const configModel = this.Model.b2cConfigurationModel(trx);

      const checkConfig = await configModel.getSiteConfig({
        hotel_code,
      });

      const payload: IUpdateAgencyB2CSiteConfigPayload = {
        last_updated: new Date(),
        updated_by: user_id,
        ...body,
      };

      files.forEach((file) => {
        if (file.fieldname === "main_logo") {
          payload.main_logo = file.filename;
        }
        if (file.fieldname === "site_thumbnail") {
          payload.site_thumbnail = file.filename;
        }
        if (file.fieldname === "favicon") {
          payload.favicon = file.filename;
        }
      });

      if (emails) {
        payload.emails = JSON.stringify(emails);
      }

      if (numbers) {
        payload.numbers = JSON.stringify(numbers);
      }
      if (address) {
        console.log(address);
        payload.address = JSON.stringify(address);
      }

      await configModel.updateConfig(payload, { hotel_code });

      const deletedFiles: string[] = [];

      if (checkConfig?.main_logo && payload.main_logo) {
        deletedFiles.push(checkConfig.main_logo);
      }
      if (checkConfig?.favicon && payload.favicon) {
        deletedFiles.push(checkConfig.favicon);
      }
      if (checkConfig?.site_thumbnail && payload.site_thumbnail) {
        deletedFiles.push(checkConfig.site_thumbnail);
      }

      if (deletedFiles.length) {
        await this.manageFile.deleteFromCloud(deletedFiles);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          main_logo: payload.main_logo,
          favicon: payload.favicon,
          site_thumbnail: payload.site_thumbnail,
        },
      };
    });
  }

  public async getSiteConfigData(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const configModel = this.Model.b2cConfigurationModel();
    const siteConfig = await configModel.getSiteConfig({ hotel_code });

    if (!siteConfig) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const {
      hotel_code: no_need_agency_id,
      id,
      about_us_content,
      contact_us_content,
      about_us_thumbnail,
      contact_us_thumbnail,
      privacy_policy_content,
      updated_by,
      updated_by_name,
      terms_and_conditions_content,
      last_updated,
      ...restData
    } = siteConfig;

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: restData,
    };
  }

  public async updateAboutUsData(req: Request) {
    const body = req.body as { content?: string };
    const files = (req.files as Express.Multer.File[]) || [];
    const { hotel_code, id: user_id } = req.hotel_admin;

    const configModel = this.Model.b2cConfigurationModel();

    const checkConfig = await configModel.getSiteConfig({
      hotel_code,
    });

    const payload: IUpdateAgencyB2CSiteConfigPayload = {
      last_updated: new Date(),
      updated_by: user_id,
    };

    if (body.content) {
      payload.about_us_content = body.content;
    }

    files.forEach((file) => {
      if (file.fieldname === "thumbnail") {
        payload.about_us_thumbnail = file.filename;
      }
    });

    await configModel.updateConfig(payload, { hotel_code });

    if (payload.about_us_thumbnail && checkConfig?.about_us_thumbnail) {
      await this.manageFile.deleteFromCloud([checkConfig.about_us_thumbnail]);
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        thumbnail: payload.about_us_thumbnail,
      },
    };
  }

  public async getAboutUsData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;

      const configModel = this.Model.b2cConfigurationModel(trx);
      const siteConfig = await configModel.getSiteConfig({ hotel_code });

      if (!siteConfig) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { about_us_content, about_us_thumbnail } = siteConfig;

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          content: about_us_content,
          thumbnail: about_us_thumbnail,
        },
      };
    });
  }

  public async updateContactUsData(req: Request) {
    const body = req.body as { content?: string };
    const files = (req.files as Express.Multer.File[]) || [];
    const { hotel_code, id: user_id } = req.hotel_admin;

    const configModel = this.Model.b2cConfigurationModel();

    const checkConfig = await configModel.getSiteConfig({
      hotel_code,
    });

    const payload: IUpdateAgencyB2CSiteConfigPayload = {
      last_updated: new Date(),
      updated_by: user_id,
    };

    if (body.content) {
      payload.contact_us_content = body.content;
    }

    files.forEach((file) => {
      if (file.fieldname === "thumbnail") {
        payload.contact_us_thumbnail = file.filename;
      }
    });

    await configModel.updateConfig(payload, { hotel_code });

    if (payload.contact_us_content && checkConfig?.contact_us_content) {
      await this.manageFile.deleteFromCloud([checkConfig.contact_us_content]);
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        thumbnail: payload.contact_us_content,
      },
    };
  }

  public async getContactUsData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;

      const configModel = this.Model.b2cConfigurationModel(trx);
      const siteConfig = await configModel.getSiteConfig({ hotel_code });

      if (!siteConfig) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { contact_us_content, contact_us_thumbnail } = siteConfig;

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          content: contact_us_content,
          thumbnail: contact_us_thumbnail,
        },
      };
    });
  }

  public async updatePrivacyPolicyData(req: Request) {
    const body = req.body as { content?: string };
    const { hotel_code, id: user_id } = req.hotel_admin;

    const configModel = this.Model.b2cConfigurationModel();

    const payload: IUpdateAgencyB2CSiteConfigPayload = {
      last_updated: new Date(),
      updated_by: user_id,
    };

    if (body.content) {
      payload.privacy_policy_content = body.content;
    }

    await configModel.updateConfig(payload, { hotel_code });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  public async getPrivacyPolicyData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;

      const configModel = this.Model.b2cConfigurationModel(trx);
      const siteConfig = await configModel.getSiteConfig({ hotel_code });

      if (!siteConfig) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { privacy_policy_content } = siteConfig;

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          content: privacy_policy_content,
        },
      };
    });
  }

  public async updateTermsAndConditions(req: Request) {
    const body = req.body as { content?: string };
    const { hotel_code, id: user_id } = req.hotel_admin;

    const configModel = this.Model.b2cConfigurationModel();

    const payload: IUpdateAgencyB2CSiteConfigPayload = {
      last_updated: new Date(),
      updated_by: user_id,
    };

    if (body.content) {
      payload.terms_and_conditions_content = body.content;
    }

    await configModel.updateConfig(payload, { hotel_code });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  public async getTermsAndConditionsData(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const configModel = this.Model.b2cConfigurationModel();
    const siteConfig = await configModel.getSiteConfig({ hotel_code });

    if (!siteConfig) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const { terms_and_conditions_content } = siteConfig;

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        content: terms_and_conditions_content,
      },
    };
  }

  public async getSocialLinks(req: Request) {
    const configModel = this.Model.b2cConfigurationModel();
    const { hotel_code } = req.hotel_admin;

    const { data, total } = await configModel.getSocialLink({
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total,
      data,
    };
  }

  public async deleteSocialLinks(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.b2cConfigurationModel(trx);
      const { hotel_code, id: user_id } = req.hotel_admin;
      const id = Number(req.params.id);

      const check = await configModel.checkSocialLink({ hotel_code, id });

      if (!check) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await configModel.deleteSocialLink({ hotel_code, id });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async createSocialLinks(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.b2cConfigurationModel(trx);

      const { hotel_code } = req.hotel_admin;

      const body = req.body as {
        social_media_id: number;
        link: string;
      };

      const socialMedia = await configModel.checkSocialMedia(
        body.social_media_id
      );

      if (!socialMedia) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Social media not found",
        };
      }

      const lastNo = await configModel.getSocialLinkLastNo({
        hotel_code,
      });

      const payload: ICreateAgencyB2CSocialLinkPayload = {
        hotel_code,
        order_number: lastNo?.order_number ? lastNo.order_number + 1 : 1,
        link: body.link,
        social_media_id: body.social_media_id,
      };

      const newSocialMedia = await configModel.insertSocialLink(payload);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: {
          id: newSocialMedia[0].id,
        },
      };
    });
  }

  public async updateSocialLinks(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.b2cConfigurationModel(trx);
      const { hotel_code, id: user_id } = req.hotel_admin;

      const id = Number(req.params.id);
      const check = await configModel.checkSocialLink({ hotel_code, id });

      if (!check) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const body = req.body as {
        media?: string;
        link?: string;
        status?: boolean;
        order_number?: number;
      };

      const payload: IUpdateAgencyB2CSocialLinkPayload = body;

      await configModel.updateSocialLink(payload, { hotel_code, id });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  public async getPopUpBanner(req: Request) {
    const configModel = this.Model.b2cConfigurationModel();
    const { hotel_code } = req.hotel_admin;

    const popUpBanners = await configModel.getPopUpBanner({ hotel_code });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        b2c: popUpBanners,
      },
    };
  }

  public async upSertPopUpBanner(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.b2cConfigurationModel(trx);
      const { hotel_code, id: user_id } = req.hotel_admin;

      const { pop_up_for, ...restBody } = req.body as IUpSertPopUpBannerReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      const payload: IUpdateAgencyB2CPopUpBannerPayload = restBody;

      if (files.length) {
        payload.thumbnail = files[0].filename;
      }

      const checkPopUp = await configModel.getPopUpBanner({
        hotel_code,
      });

      let auditDesc = "";

      if (checkPopUp.length) {
        await configModel.updatePopUpBanner(payload, {
          hotel_code,
        });
        auditDesc = "Created new pop up banner for " + pop_up_for;
      } else {
        await configModel.insertPopUpBanner({
          ...payload,

          hotel_code,
        });
        auditDesc = "Updated " + pop_up_for + " Pop up banner.";
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          thumbnail: payload.thumbnail,
        },
      };
    });
  }

  public async getHeroBGContent(req: Request) {
    const configModel = this.Model.b2cConfigurationModel();
    const { hotel_code, id: user_id } = req.hotel_admin;

    const { limit, skip } = req.query as { limit?: string; skip?: string };

    const { data, total } = await configModel.getHeroBGContent(
      {
        hotel_code,
        limit,
        skip,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  public async createHeroBGContent(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.b2cConfigurationModel(trx);
      const { hotel_code, id: user_id } = req.hotel_admin;

      const body = req.body as ICreateHeroBGContentReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      if (!files.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Content is required",
        };
      }

      const lastOrderNumber = await configModel.getHeroBGContentLastNo({
        hotel_code,
      });

      const heroBG = await configModel.insertHeroBGContent({
        hotel_code,
        ...body,
        content: files[0].filename,
        order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          content: files[0].filename,
          id: heroBG[0].id,
        },
      };
    });
  }

  public async updateHeroBGContent(req: Request) {
    return this.db.transaction(async (trx) => {
      const body = req.body as IUpdateHeroBGContentReqBody;
      const { hotel_code, id: user_id } = req.hotel_admin;

      const configModel = this.Model.b2cConfigurationModel(trx);

      const id = Number(req.params.id);

      const check = await configModel.checkHeroBGContent({ hotel_code, id });

      if (!check.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const payload: IUpdateAgencyB2CHeroBgContentPayload = body;

      if (files.length) {
        payload.content = files[0].filename;
      }

      if (!Object.keys(payload).length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }

      await configModel.updateHeroBGContent(payload, { hotel_code, id });

      if (payload.content && check[0].content) {
        const heroContent = heroBG(hotel_code);

        const found = heroContent.find(
          (item) => item.content === check[0].content
        );

        if (!found) {
          await this.manageFile.deleteFromCloud([check[0].content]);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { content: payload.content },
      };
    });
  }

  public async deleteHeroBGContent(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code, id: user_id } = req.hotel_admin;

      const configModel = this.Model.b2cConfigurationModel(trx);

      const id = Number(req.params.id);

      const check = await configModel.checkHeroBGContent({ hotel_code, id });

      if (!check.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await configModel.deleteHeroBGContent({ hotel_code, id });

      if (check[0].content) {
        const heroContent = heroBG(hotel_code);

        const found = heroContent.find(
          (item) => item.content === check[0].content
        );

        if (!found) {
          await this.manageFile.deleteFromCloud([check[0].content]);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  // =========================== FAQ =========================== //

  public async createFaqHead(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const configModel = this.Model.b2cConfigurationModel(trx);

      const isHeadExists = await configModel.getAllFaqHeads({
        hotel_code,
        order: req.body.order_number,
      });

      if (isHeadExists.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "FAQ Head with same order already exists",
        };
      }

      await configModel.createFaqHead({
        hotel_code,
        title: req.body.title,
        order_number: req.body.order_number,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async getAllFaqHeads(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const configModel = this.Model.b2cConfigurationModel(trx);

      const heads = await configModel.getAllFaqHeads({ hotel_code });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: heads,
      };
    });
  }

  public async updateFaqHead(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { hotel_code } = req.hotel_admin;

      const configModel = this.Model.b2cConfigurationModel(trx);

      if (req.body?.order_number) {
        const isHeadExists = await configModel.getAllFaqHeads({
          hotel_code,
          order: req.body.order_number,
        });

        if (isHeadExists.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: "FAQ Head with same order already exists",
          };
        }
      }

      await configModel.updateFaqHead(req.body, { id: Number(id) });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async deleteFaqHead(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { hotel_code } = req.hotel_admin;
      const configModel = this.Model.b2cConfigurationModel(trx);

      const isHeadExists = await configModel.getSingleFaqHeads(
        Number(id),
        hotel_code
      );

      if (isHeadExists) {
        throw new CustomError(
          "FAQ Head with does not exists",
          this.StatusCode.HTTP_BAD_REQUEST
        );
      }

      await configModel.deleteFaqHead({ id: Number(id) });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async createFaq(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const configModel = this.Model.b2cConfigurationModel(trx);

      const isHeadExists = await configModel.getSingleFaqHeads(
        Number(req.body.faq_head_id),
        hotel_code
      );

      if (isHeadExists) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "FAQ Head with id does not exists",
        };
      }

      const faq = await configModel.createFaq({ ...req.body, hotel_code });
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async getFaqsByHeadId(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { hotel_code } = req.hotel_admin;
      const configModel = this.Model.b2cConfigurationModel(trx);

      const head = await configModel.getSingleFaqHeads(Number(id), hotel_code);

      if (!head) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "FAQ head not found",
        };
      }

      const data = await configModel.getFaqsByHeadId(Number(id), hotel_code);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data,
      };
    });
  }

  public async updateFaq(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;

      const configModel = this.Model.b2cConfigurationModel(trx);

      const isHeadExists = await configModel.getSingleFaq(
        Number(req.params.id),
        hotel_code
      );

      if (!isHeadExists.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Invalid faq ID",
        };
      }

      await configModel.updateFaq(req.body, {
        hotel_code,
        id: Number(req.params.id),
      });
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Successfully updated",
      };
    });
  }

  public async deleteFaq(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;

      const configModel = this.Model.b2cConfigurationModel(trx);

      const isHeadExists = await configModel.getSingleFaq(
        Number(req.params.id),
        hotel_code
      );

      if (!isHeadExists.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Invalid faq ID",
        };
      }

      await configModel.updateFaq(
        { is_deleted: true },
        {
          hotel_code,
          id: Number(req.params.id),
        }
      );
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Successfully deleted",
      };
    });
  }

  // =========================== Amenity Heads =========================== //
  public async getAllAmenityHeads(req: Request) {
    return this.db.transaction(async (trx) => {
      const { status, limit, skip, search } = req.query;
      const configModel = this.Model.mConfigurationModel(trx);
      const { data } = await configModel.getAllAmenitiesHead({
        status: status as string,
        limit: limit as string,
        skip: skip as string,
        search: search as string,
      });
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data,
      };
    });
  }

  public async getAllAmenities(req: Request) {
    return this.db.transaction(async (trx) => {
      const id = Number(req.params.id);
      const configModel = this.Model.mConfigurationModel(trx);
      const { data } = await configModel.getAllAmenities({
        head_id: id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data,
      };
    });
  }

  public async addHotelAmenities(req: Request) {
    return this.db.transaction(async (trx) => {
      const hotel_code = req.hotel_admin.hotel_code;
      const { amenity_ids } = req.body;

      const rows = amenity_ids.map((id: number) => ({
        hotel_code,
        amenity_id: id,
      }));

      const configModel = this.Model.b2cConfigurationModel(trx);
      await configModel.addHotelAmenities(rows);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async getAllHotelAmenities(req: Request) {
    return this.db.transaction(async (trx) => {
      const hotel_code = req.hotel_admin.hotel_code;

      const configModel = this.Model.b2cConfigurationModel(trx);
      const data = await configModel.getAllHotelAmenities(hotel_code);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data,
      };
    });
  }
}
