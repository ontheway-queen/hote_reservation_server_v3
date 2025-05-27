import AbstractRouter from "../../abstarcts/abstract.router";
import RoomRatesController from "../controllers/setting.room_rates.controller";

class RoomRatesRouter extends AbstractRouter {
  private controller = new RoomRatesController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/")
      .post(this.controller.createRoomRate)
      .get(this.controller.getAllRoomRate);

    this.router
      .route("/:id")
      .get(this.controller.getSingleRoomRate)
      .put(this.controller.updateSingleRoomRate);
  }
}
export default RoomRatesRouter;
