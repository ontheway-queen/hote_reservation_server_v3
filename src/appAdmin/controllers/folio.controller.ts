import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import { FolioService } from "../services/folio.service";
import { FolioValidator } from "../utlis/validator/folio.validator";

export class FolioController extends AbstractController {
  private service = new FolioService();
  private validator = new FolioValidator();
  constructor() {
    super();
  }

  public createFolio = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createFolio,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createFolio(req);
      res.status(code).json(data);
    }
  );

  public splitMasterFolio = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.splitMasterFolio,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.splitMasterFolio(req);
      res.status(code).json(data);
    }
  );
}
