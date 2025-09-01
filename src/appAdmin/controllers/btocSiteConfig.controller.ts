import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import { B2CSubSiteConfigService } from "../services/B2CSubSiteConfigService";
import { B2CSubSiteConfigValidator } from "../utlis/validator/B2CSubSiteConfigValidator";

export class B2CSiteConfigController extends AbstractController {
  private service = new B2CSubSiteConfigService();
  private validator = new B2CSubSiteConfigValidator();

  constructor() {
    super();
  }

  public updateSiteConfig = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateSiteConfig },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSiteConfig(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getSiteConfigData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSiteConfigData(req);
      res.status(code).json(data);
    }
  );

  public getAboutUsData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAboutUsData(req);
      res.status(code).json(data);
    }
  );

  public updateAboutUsData = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateAboutUs },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAboutUsData(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getContactUsData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getContactUsData(req);
      res.status(code).json(data);
    }
  );

  public updateContactUsData = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateContactUs },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateContactUsData(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getPrivacyPolicyData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getPrivacyPolicyData(req);
      res.status(code).json(data);
    }
  );

  public updatePrivacyPolicyData = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updatePrivacyPolicy },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updatePrivacyPolicyData(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getTermsAndConditionsData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getTermsAndConditionsData(
        req
      );
      res.status(code).json(data);
    }
  );

  public updateTermsAndConditions = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateTermsAndConditions },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateTermsAndConditions(
        req
      );
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getSocialLinks = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSocialLinks(req);
      res.status(code).json(data);
    }
  );

  public deleteSocialLinks = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteSocialLinks(req);
      res.status(code).json(data);
    }
  );

  public createSocialLinks = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createSocialLinks },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createSocialLinks(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public updateSocialLinks = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.validator.updateSocialLinks,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSocialLinks(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getPopUpBanner = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getPopUpBanner(req);
      res.status(code).json(data);
    }
  );

  public upSertPopUpBanner = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.upSertPopUpBanner,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.upSertPopUpBanner(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getHeroBGContent = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getHeroBGContent(req);
      res.status(code).json(data);
    }
  );

  public createHeroBGContent = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createHeroBGContent },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createHeroBGContent(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public updateHeroBGContent = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.validator.updateHeroBGContent,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateHeroBGContent(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public deleteHeroBGContent = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteHeroBGContent(req);
      res.status(code).json(data);
    }
  );

  // =========================== FAQ =========================== //
  public getAllFaqHeads = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllFaqHeads(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public createFaqHead = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createFaqHead },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createFaqHead(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public updateFaqHead = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createFaqHead },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateFaqHead(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public deleteFaqHead = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteFaqHead(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getFaqsByHeadId = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getFaqsByHeadId(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public createFaq = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createFaq },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createFaq(req);

      res.status(code).json(data);
    }
  );

  public updateFaq = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateFaq,
      paramSchema: this.commonValidator.singleParamValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateFaq(req);

      res.status(code).json(data);
    }
  );

  public deleteFaq = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteFaq(req);

      res.status(code).json(data);
    }
  );

  public getAllAmenityHeads = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAmenityHeads(req);
      res.status(code).json(data);
    }
  );

  public getAllAmenities = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAmenities(req);
      res.status(code).json(data);
    }
  );

  public addHotelAmenities = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.addHotelAmenities(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getAllHotelAmenities = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllHotelAmenities(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );
}
