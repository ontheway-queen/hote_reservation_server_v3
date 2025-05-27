import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RoomRatesService from "../services/setting.room_rates.service";
import SettingValidator from "../utlis/validator/setting.validator";

class RoomRatesController extends AbstractController {
  private service = new RoomRatesService();
  private settingValidator = new SettingValidator();
  constructor() {
    super();
  }

  public createRoomRate = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.createRoomRateValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createRoomRate(req);

      res.status(code).json(data);
    }
  );

  public getAllRoomRate = this.asyncWrapper.wrap(
    { querySchema: this.settingValidator.getAllRoomTypeQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllRoomRate(req);

      res.status(code).json(data);
    }
  );

  public getSingleRoomRate = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleRoomRate(req);

      res.status(code).json(data);
    }
  );

  public updateSingleRoomRate = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.settingValidator.updateRoomRateValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateRoomRate(req);

      res.status(code).json(data);
    }
  );
}
export default RoomRatesController;
