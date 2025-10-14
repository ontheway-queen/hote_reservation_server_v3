import AbstractRouter from "../../abstarcts/abstract.router";
import RestaurantTableController from "../controllers/restaurantTable.controller";

class RestaurantTableRouter extends AbstractRouter {
  private controller = new RestaurantTableController();

  constructor() {
    super();
    this.callV1Router();
  }

  private callV1Router() {
    this.router
      .route("/")
      .post(this.controller.createTable)
      .get(this.controller.getTables);

    this.router
      .route("/:id")
      .patch(this.controller.updateTable)
      .delete(this.controller.deleteTable);
  }
}

export default RestaurantTableRouter;
