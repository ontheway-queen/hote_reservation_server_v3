import AbstractRouter from "../../abstarcts/abstract.router";
import RestaurantConfigurationController from "../controllers/configuration.controller";

class ResConfigurationRouter extends AbstractRouter {
  private controller = new RestaurantConfigurationController();

  constructor() {
    super();
    this.callV1Router();
  }

  private callV1Router() {
    this.router
      .route("/prepare-food-option")
      .patch(this.controller.updatePrepareFoodOption);
  }
}

export default ResConfigurationRouter;
