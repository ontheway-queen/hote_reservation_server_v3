import AbstractRouter from "../../abstarcts/abstract.router";
import RestaurantFoodController from "../controllers/food.controller";

class RestaurantFoodRouter extends AbstractRouter {
  private controller = new RestaurantFoodController();

  constructor() {
    super();
    this.callV1Router();
  }

  private callV1Router() {
    this.router
      .route("/")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.RESTAURANT_FILES),
        this.controller.createFood
      )
      .get(this.controller.getFoods);

    this.router
      .route("/:id")
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.RESTAURANT_FILES),
        this.controller.updateFood
      )
      .delete(this.controller.deleteFood);
  }
}

export default RestaurantFoodRouter;
