import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import GuestService from "../services/guest.service";
import GuestValidator from "../utlis/validator/guest.validator";

class GuestController extends AbstractController {
  private guestService = new GuestService();
  private guestValidator = new GuestValidator();
  constructor() {
    super();
  }
  // Create guest controller
  public createGuest = this.asyncWrapper.wrap(
    { bodySchema: this.guestValidator.createGuestValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.guestService.createGuest(req);
      res.status(code).json(data);
    }
  );

  // get all Guest controller with filter
  public getAllGuest = this.asyncWrapper.wrap(
    { querySchema: this.guestValidator.getAllGuestValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.guestService.getAllGuest(req);
      res.status(code).json(data);
    }
  );

  // get Single Guest Controller
  public getSingleGuest = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.guestService.getSingleGuest(req);
      res.status(code).json(data);
    }
  );

  // public updateSingleGuest = this.asyncWrapper.wrap(
  //   { bodySchema: this.guestValidator.updateSingleGuestValidator },
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } = await this.guestService.updateSingleGuest(req);
  //     res.status(code).json(data);
  //   }
  // );
}
export default GuestController;
