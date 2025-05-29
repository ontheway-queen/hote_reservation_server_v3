import AbstractRouter from "../../abstarcts/abstract.router";
import GuestController from "../controllers/guest.controller";

class RoomGuestRouter extends AbstractRouter {
  private guestController;

  constructor() {
    super();
    this.guestController = new GuestController();
    this.callRouter();
  }

  private callRouter() {}
}
export default RoomGuestRouter;
