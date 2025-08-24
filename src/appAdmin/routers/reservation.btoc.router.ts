import AbstractRouter from "../../abstarcts/abstract.router";
import AdminBtocReservationController from "../controllers/btoc.reservation.controller";

class AdminBtocReservationRouter extends AbstractRouter {
  private controller = new AdminBtocReservationController();
  constructor() {
    super();

    this.callRouter();
  }
  private callRouter() {
    this.router.route("/").get(this.controller.getAllReservation);
  }
}
export default AdminBtocReservationRouter;
