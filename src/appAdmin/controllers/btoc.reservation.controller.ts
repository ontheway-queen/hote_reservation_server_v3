import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import AdminBtocReservationService from "../services/reservation.btoc.service";

class AdminBtocReservationController extends AbstractController {
  private service = new AdminBtocReservationService();

  constructor() {
    super();
  }

  public getAllReservation = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllReservation(req);

      res.status(code).json(data);
    }
  );
}

export default AdminBtocReservationController;
