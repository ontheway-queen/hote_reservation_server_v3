import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import MUserService from "../services/mHotel.service";
import MHotelValidator from "../utlis/validator/mHotel.validator";

class MHotelController extends AbstractController {
  private mUserService = new MUserService();
  private mHotelValidator = new MHotelValidator();

  constructor() {
    super();
  }

  public createHotel = this.asyncWrapper.wrap(
    { bodySchema: this.mHotelValidator.createHotelValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.mUserService.createHotel(req);

      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getAllHotel = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.mUserService.getAllHotel(req);

      res.status(code).json(data);
    }
  );

  public getSingleHotel = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.mUserService.getSingleHotel(req);

      res.status(code).json(data);
    }
  );

  // update hotel
  public updateHotel = this.asyncWrapper.wrap(
    { bodySchema: this.mHotelValidator.updateHotelValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.mUserService.updateHotel(req);

      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );
}

export default MHotelController;
