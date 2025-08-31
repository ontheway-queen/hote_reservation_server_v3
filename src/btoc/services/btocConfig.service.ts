import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

export class BtocConfigService extends AbstractServices {
  constructor() {
    super();
  }

  public async GetHomePageData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.web_token;

      const configModel = this.Model.b2cConfigurationModel(trx);
      const siteConfig = await configModel.getSiteConfig({ hotel_code });

      if (!siteConfig) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      console.log({ siteConfig });
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

      const hero_bg_data = await configModel.getHeroBGContent({
        hotel_code,
        status: true,
      });

      const hot_deals = await configModel.getHotDeals({
        hotel_code,
        status: true,
      });

      const social_links = await configModel.getSocialLink({
        hotel_code,
        status: true,
      });

      console.log({ social_links });

      const popUpBanner = await configModel.getPopUpBanner({
        hotel_code,
        status: true,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          site_data: restData,
          hero_bg_data: hero_bg_data.data,
          hot_deals: hot_deals.data,

          social_links: social_links.data,
          popup: {
            allow: popUpBanner.length ? true : false,
            pop_up_data: popUpBanner[0],
          },
        },
      };
    });
  }

  public async GetAboutUsPageData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.web_token;

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
          about_us_content,
          about_us_thumbnail,
        },
      };
    });
  }

  public async GetContactUsPageData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.web_token;

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
          contact_us_content,
          contact_us_thumbnail,
        },
      };
    });
  }

  public async GetPrivacyPolicyPageData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.web_token;

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
          privacy_policy_content,
        },
      };
    });
  }

  public async GetTermsAndConditionsPageData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.web_token;

      const configModel = this.Model.b2cConfigurationModel(trx);
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
          terms_and_conditions_content,
        },
      };
    });
  }

  public async getPopUpBanner(req: Request) {
    const configModel = this.Model.b2cConfigurationModel();
    const { hotel_code } = req.web_token;

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

  public async GetAccountsData(req: Request) {
    const { hotel_code } = req.web_token;

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }
}
