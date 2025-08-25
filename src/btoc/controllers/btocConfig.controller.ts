import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import { BtocConfigService } from "../services/btocConfig.service";

export class BtocConfigController extends AbstractController {
  private service = new BtocConfigService();

  constructor() {
    super();
  }
}
