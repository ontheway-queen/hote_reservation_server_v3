import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import MConfigurationService from "../services/mConfiguration.service";
import MConfigurationValidator from "../utlis/validator/mConfiguration.validator";

class MConfigurationController extends AbstractController {
  private service = new MConfigurationService();
  private validator = new MConfigurationValidator();

  constructor() {
    super();
  }

  public getAllAccomodation = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAccomodation(req);

      res.status(code).json(data);
    }
  );

  public getSingleAccomodation = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleAccomodation(req);

      res.status(code).json(data);
    }
  );

  public getAllCity = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllCity(req);

      res.status(code).json(data);
    }
  );

  public insertCity = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.insertCityValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.insertCity(req);

      res.status(code).json(data);
    }
  );

  public getAllCountry = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllCountry(req);

      res.status(code).json(data);
    }
  );

  public createPermissionGroup = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createPermissionGroupValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createPermissionGroup(req);

      res.status(code).json(data);
    }
  );

  // get permission group
  public getPermissionGroup = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getPermissionGroup(req);

      res.status(code).json(data);
    }
  );

  // create permission
  public createPermission = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createPermissionValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createPermission(req);

      res.status(code).json(data);
    }
  );

  // get single hotel permission
  public getSingleHotelPermission = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator("hotel_code") },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleHotelPermission(
        req
      );

      res.status(code).json(data);
    }
  );

  // update single hotel permission
  public updateSingleHotelPermission = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator("hotel_code"),
      bodySchema: this.validator.updatePermissionValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSingleHotelPermission(
        req
      );

      res.status(code).json(data);
    }
  );

  // get all permission
  public getAllPermission = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllPermission(req);

      res.status(code).json(data);
    }
  );

  //=================== Room Amenities Controller ======================//

  // Create Room Amenities head
  public createRoomTypeAmenitiesHead = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createRoomTypeAmenitiesHeadValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createRoomTypeAmenitiesHead(
        req
      );

      res.status(code).json(data);
    }
  );

  // Get All Room type Amenities head
  public getAllRoomTypeAmenitiesHead = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllRoomTypeAmenitiesQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllRoomTypeAmenitiesHead(
        req
      );

      res.status(code).json(data);
    }
  );

  // Update Room Amenities jead
  public updateRoomTypeAmenitiesHead = this.asyncWrapper.wrap(
    { bodySchema: this.validator.UpdateRoomTypeAmenitiesHeadValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateRoomTypeAmenitiesHead(
        req
      );

      res.status(code).json(data);
    }
  );

  // Create Room Amenities
  public createRoomTypeAmenities = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createRoomTypeAmenitiesValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createRoomTypeAmenities(req);

      res.status(code).json(data);
    }
  );

  // Get All Room type Amenities
  public getAllRoomTypeAmenities = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllRoomTypeAmenitiesQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllRoomTypeAmenities(req);

      res.status(code).json(data);
    }
  );

  // Update Room Amenities
  public updateRoomTypeAmenities = this.asyncWrapper.wrap(
    { bodySchema: this.validator.UpdateRoomTypeAmenitiesValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateRoomTypeAmenities(req);

      res.status(code).json(data);
    }
  );

  // Delete Room type Amenities
  public deleteRoomTypeAmenities = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteRoomTypeAmenities(req);

      res.status(code).json(data);
    }
  );
}

export default MConfigurationController;
