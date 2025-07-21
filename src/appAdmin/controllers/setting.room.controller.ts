import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RoomSettingService from "../services/setting.room.service";
import SettingValidator from "../utlis/validator/setting.validator";

class RoomSettingController extends AbstractController {
  private roomSettingService = new RoomSettingService();
  private settingValidator = new SettingValidator();
  constructor() {
    super();
  }

  public createRoomType = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.createRoomTypeValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.createRoomType(
        req
      );

      res.status(code).json(data);
    }
  );

  public getAllRoomType = this.asyncWrapper.wrap(
    { querySchema: this.settingValidator.getAllRoomTypeQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.getAllRoomType(
        req
      );

      res.status(code).json(data);
    }
  );

  public getSingleRoomType = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.getSingleRoomType(
        req
      );

      res.status(code).json(data);
    }
  );

  public updateRoomType = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.updateRoomTypeValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.updateRoomType(
        req
      );

      res.status(code).json(data);
    }
  );

  public deleteRoomType = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.deleteRoomType(
        req
      );

      res.status(code).json(data);
    }
  );

  public getAllRoomTypeAmenities = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.getAllRoomTypeAmenities(req);

      res.status(code).json(data);
    }
  );

  //=================== Room Type Categories Controller ======================//

  public createRoomTypeCategories = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.createRoomTypeCategoriesValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.createRoomTypeCategories(req);

      res.status(code).json(data);
    }
  );

  public getAllRoomTypeCategories = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.getAllRoomTypeCategories(req);

      res.status(code).json(data);
    }
  );

  public updateRoomTypeCategories = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.UpdateRoomTypeCategoriesValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.updateRoomTypeCategories(req);

      res.status(code).json(data);
    }
  );

  public deleteRoomTypeCategories = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.deleteRoomTypeCategories(req);

      res.status(code).json(data);
    }
  );

  //=================== Bed Type Controller ======================//

  public createBedType = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.createBedTypeValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.createBedType(
        req
      );

      res.status(code).json(data);
    }
  );

  public getAllBedType = this.asyncWrapper.wrap(
    { querySchema: this.settingValidator.getAllBedTypeQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.getAllBedType(
        req
      );

      res.status(code).json(data);
    }
  );

  public updateBedType = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.UpdateBedTypeValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.updateBedType(
        req
      );

      res.status(code).json(data);
    }
  );

  public deleteBedType = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.deleteBedType(
        req
      );

      res.status(code).json(data);
    }
  );

  //=================== Floor Setup Controller ======================//

  public createFloorSetup = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.createFloorSetupValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.createFloorSetup(
        req
      );

      res.status(code).json(data);
    }
  );

  public getAllFloorSetup = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.getAllFloorSetup(
        req
      );

      res.status(code).json(data);
    }
  );

  public updateFloorSetup = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.updateFloorSetupValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.updateFloorSetup(
        req
      );

      res.status(code).json(data);
    }
  );

  public deleteFloorSetup = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.deleteFloorSetup(
        req
      );

      res.status(code).json(data);
    }
  );

  //=================== Building Setup Controller ======================//
  public createBuildingSetup = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.createBuildingSetupValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.createBuildingSetup(req);

      res.status(code).json(data);
    }
  );
  public getAllBuildingSetup = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.getAllBuildingSetup(req);

      res.status(code).json(data);
    }
  );
  public updateBuildingSetup = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.updateBuildingSetupValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.updateBuildingSetup(req);

      res.status(code).json(data);
    }
  );
  public deleteBuildingSetup = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.deleteBuildingSetup(req);

      res.status(code).json(data);
    }
  );
}
export default RoomSettingController;
