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

  private callRouter() {}
}
