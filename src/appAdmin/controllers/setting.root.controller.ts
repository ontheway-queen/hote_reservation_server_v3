import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import { SettingRootService } from "../services/setting.root.service";
import SettingValidator from "../utlis/validator/setting.validator";

export class SettingRootController extends AbstractController {
  private service = new SettingRootService();
  private validator = new SettingValidator();
  constructor() {
    super();
  }

  public insertAccomodation = this.asyncWrapper.wrap(
    { bodySchema: this.validator.insertAccomodationValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.insertAccomodation(req);
      res.status(code).json(data);
    }
  );

  public getAccomodation = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAccomodation(req);
      res.status(code).json(data);
    }
  );

  public updateAccomodation = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateAccomodationValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAccomodation(req);
      res.status(code).json(data);
    }
  );

  public insertCancellationPolicy = this.asyncWrapper.wrap(
    { bodySchema: this.validator.insertCancellationPolicyValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.insertCancellationPolicy(
        req
      );
      res.status(code).json(data);
    }
  );

  public getAllCancellationPolicy = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllCancellationPolicy(
        req
      );
      res.status(code).json(data);
    }
  );

  public getSingleCancellationPolicy = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleCancellationPolicy(
        req
      );
      res.status(code).json(data);
    }
  );

  public updateCancellationPolicy = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateCancellationPolicyValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateCancellationPolicy(
        req
      );
      res.status(code).json(data);
    }
  );

  public getAllMealPlan = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllMealPlan(req);
      res.status(code).json(data);
    }
  );

  public getAllSources = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllSources(req);
      res.status(code).json(data);
    }
  );

  public getChildAgePolicies = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getChildAgePolicies(req);
      res.status(code).json(data);
    }
  );
}
