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

  //=================== Room Type Controller ======================//

  // Create Room Type
  public createRoomType = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.createRoomTypeValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.createRoomType(
        req
      );

      res.status(code).json(data);
    }
  );

  // Get All Room Type
  public getAllRoomType = this.asyncWrapper.wrap(
    { querySchema: this.settingValidator.getAllRoomTypeQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.getAllRoomType(
        req
      );

      res.status(code).json(data);
    }
  );

  // single Room Type
  public getSingleRoomType = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.getSingleRoomType(
        req
      );

      res.status(code).json(data);
    }
  );

  // Update Room Type
  public updateRoomType = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.updateRoomTypeValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.updateRoomType(
        req
      );

      res.status(code).json(data);
    }
  );

  // Delete Room Type
  public deleteRoomType = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.deleteRoomType(
        req
      );

      res.status(code).json(data);
    }
  );

  // Get All Room Type Categories
  public getAllRoomTypeAmenities = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.getAllRoomTypeAmenities(req);

      res.status(code).json(data);
    }
  );

  //=================== Room Type Categories Controller ======================//

  // Create Room Type Categories
  public createRoomTypeCategories = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.createRoomTypeCategoriesValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.createRoomTypeCategories(req);

      res.status(code).json(data);
    }
  );

  // Get All Room Type Categories
  public getAllRoomTypeCategories = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.getAllRoomTypeCategories(req);

      res.status(code).json(data);
    }
  );

  // Update Room Type Categories
  public updateRoomTypeCategories = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.UpdateRoomTypeCategoriesValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.updateRoomTypeCategories(req);

      res.status(code).json(data);
    }
  );

  // Delete Room Type
  public deleteRoomTypeCategories = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.roomSettingService.deleteRoomTypeCategories(req);

      res.status(code).json(data);
    }
  );

  //=================== Bed Type Controller ======================//

  // Create Bed Type
  public createBedType = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.createBedTypeValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.createBedType(
        req
      );

      res.status(code).json(data);
    }
  );

  // Get All Bed Type
  public getAllBedType = this.asyncWrapper.wrap(
    { querySchema: this.settingValidator.getAllBedTypeQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.getAllBedType(
        req
      );

      res.status(code).json(data);
    }
  );

  // Update Bed Type
  public updateBedType = this.asyncWrapper.wrap(
    { bodySchema: this.settingValidator.UpdateBedTypeValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.updateBedType(
        req
      );

      res.status(code).json(data);
    }
  );

  // Delete Bed Type
  public deleteBedType = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.roomSettingService.deleteBedType(
        req
      );

      res.status(code).json(data);
    }
  );
}
export default RoomSettingController;
