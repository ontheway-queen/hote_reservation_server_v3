import { Router } from "express";
import AbstractRouter from "../../abstarcts/abstract.router";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import { BtocCommonController } from "../controllers/btocCommon.controller";

export class BtocCommonRouter extends AbstractRouter {
  public router = Router();
  public authChecker = new AuthChecker();
  private controller = new BtocCommonController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route("/gateways").get(this.controller.getAllPaymentGateway);
  }
}
