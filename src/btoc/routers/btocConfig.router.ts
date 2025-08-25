import { Router } from "express";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import AbstractRouter from "../../abstarcts/abstract.router";
import { BtocConfigController } from "../controllers/btocConfig.controller";

export class BtocConfigRouter extends AbstractRouter {
  public router = Router();
  public authChecker = new AuthChecker();
  private controller = new BtocConfigController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/site-configuration")
      .get(this.controller.getSiteConfiguration);

    this.router
      .route("/pop-up-banner")
      .get(this.controller.getPopUpBannerConfiguration);

    this.router.route("/hero-bg-content").get(this.controller.getHeroBgContent);

    this.router.route("/hot-deals").get(this.controller.getHotDeals);

    this.router.route("/social-links").get(this.controller.getSocialLinks);

    this.router
      .route("/popular-room-types")
      .get(this.controller.getPopularRoomTypes);
  }
}
