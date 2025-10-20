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
    {
      paramSchema: this.commonValidator.singleParamValidator("hotel_code"),
    },
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

  public createAmenitiesHead = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createAmenitiesHeadValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAmenitiesHead(req);

      res.status(code).json(data);
    }
  );

  public getAllAmenitiesHead = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllAmenitiesQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAmenitiesHead(req);

      res.status(code).json(data);
    }
  );

  public updateAmenitiesHead = this.asyncWrapper.wrap(
    { bodySchema: this.validator.UpdateAmenitiesHeadValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAmenitiesHead(req);

      res.status(code).json(data);
    }
  );

  public createAmenities = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createAmenitiesValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAmenities(req);

      res.status(code).json(data);
    }
  );

  public getAllAmenities = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllAmenitiesQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAmenities(req);

      res.status(code).json(data);
    }
  );

  public updateAmenities = this.asyncWrapper.wrap(
    { bodySchema: this.validator.UpdateAmenitiesValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAmenities(req);

      res.status(code).json(data);
    }
  );

  public deleteAmenities = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteAmenities(req);

      res.status(code).json(data);
    }
  );

  public createResPermissionGroup = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createPermissionGroupValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createResPermissionGroup(
        req
      );

      res.status(code).json(data);
    }
  );

  // get permission group
  public getResPermissionGroup = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getResPermissionGroup(req);

      res.status(code).json(data);
    }
  );

  public createResPermission = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createPermissionValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createResPermission(req);

      res.status(code).json(data);
    }
  );

  public getSingleResPermission = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator("hotel_code"),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleResPermission(req);

      res.status(code).json(data);
    }
  );

  public updateSingleResPermission = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator("hotel_code"),
      bodySchema: this.validator.updatePermissionValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSingleResPermission(
        req
      );

      res.status(code).json(data);
    }
  );

  public getAllResPermission = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllResPermission(req);

      res.status(code).json(data);
    }
  );
}

export default MConfigurationController;
