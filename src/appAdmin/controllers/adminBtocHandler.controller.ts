import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import AdminBtocHandlerValidator from "../utlis/validator/adminBtocHandler.validator";
import AdminBtocHandlerService from "../services/adminBtocHandler.service";

class AdminBtocHandlerController extends AbstractController {
  private service = new AdminBtocHandlerService();
  private validator = new AdminBtocHandlerValidator();
  constructor() {
    super();
  }

  public getSiteConfiguration = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSiteConfiguration(req);

      res.status(code).json(data);
    }
  );

  public getPopUpBannerConfiguration = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getPopUpBannerConfiguration(
        req
      );

      res.status(code).json(data);
    }
  );

  public getHeroBgContent = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getHeroBgContent(req);

      res.status(code).json(data);
    }
  );

  public getHotDeals = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getHotDeals(req);

      res.status(code).json(data);
    }
  );

  public getSocialLinks = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSocialLinks(req);

      res.status(code).json(data);
    }
  );

  public getPopularRoomTypes = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getPopularRoomTypes(req);

      res.status(code).json(data);
    }
  );

  public updateSiteConfig = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateBtocSiteConfig },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSiteConfig(req);

      res.status(code).json(data);
    }
  );

  public updatePopUpBanner = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updatePopUpBanner },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updatePopUpBanner(req);

      res.status(code).json(data);
    }
  );

  public updateHeroBgContent = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateHeroBgContent },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateHeroBgContent(req);

      res.status(code).json(data);
    }
  );

  public updateHotDeals = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateHotDeals },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateHotDeals(req);

      res.status(code).json(data);
    }
  );

  public updateSocialLinks = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateSocialLinks },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSocialLinks(req);

      res.status(code).json(data);
    }
  );

  public updatePopularRoomTypes = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updatePopularRoomTypes },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updatePopularRoomTypes(req);

      res.status(code).json(data);
    }
  );

  // ======================== Service Content ================================ //
  public createHotelServiceContent = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createHotelServiceContent(
        req
      );

      res.status(code).json(data);
    }
  );

  public updateHotelServiceContent = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateHotelServiceContent(
        req
      );

      res.status(code).json(data);
    }
  );

  public getHotelContentService = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getHotelContentService(req);

      res.status(code).json(data);
    }
  );

  // ======================== Services ================================ //
  public createHotelService = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createHotelService(req);

      res.status(code).json(data);
    }
  );

  public getAllServices = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllServices(req);

      res.status(code).json(data);
    }
  );

  public getSingleService = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleService(req);

      res.status(code).json(data);
    }
  );

  public updateService = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateService(req);

      res.status(code).json(data);
    }
  );
  public deleteService = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteService(req);

      res.status(code).json(data);
    }
  );
}

export default AdminBtocHandlerController;
