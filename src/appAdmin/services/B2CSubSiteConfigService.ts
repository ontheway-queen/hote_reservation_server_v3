import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IB2CSubUpdateSiteConfigReqBody,
  ICreateAgencyB2CSocialLinkPayload,
  IUpdateAgencyB2CPopUpBannerPayload,
  IUpdateAgencyB2CSiteConfigPayload,
  IUpdateAgencyB2CSocialLinkPayload,
  IUpSertPopUpBannerReqBody,
} from "../utlis/interfaces/configuration.interface";

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

    const social_links = await configModel.getSocialLink({
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: social_links,
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

      const lastNo = await configModel.getSocialLinkLastNo({ hotel_code });

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
}
