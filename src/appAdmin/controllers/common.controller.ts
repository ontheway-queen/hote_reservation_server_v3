import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import { CommonService } from "../services/common.service";

export class CommonController extends AbstractController {
  private service = new CommonService();

  constructor() {
    super();
  }

  public getAllCity = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllCity(req);
      res.status(code).json(data);
    }
  );
}
