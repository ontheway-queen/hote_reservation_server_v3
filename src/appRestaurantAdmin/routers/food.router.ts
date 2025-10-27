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
        this.controller.createFoodV2
      )
      .get(this.controller.getFoods);

    this.router.route("/wastage").get(this.controller.getWastageFood);

    this.router.route("/wastage/:id").post(this.controller.wastageFood);

    this.router.route("/prepared").post(this.controller.insertPreparedFood);

    this.router.route("/ingredients").get(this.controller.getAllProduct);

    this.router.route("/stocks").get(this.controller.geFoodStocks);

    this.router
      .route("/:id")
      .get(this.controller.getFood)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.RESTAURANT_FILES),
        this.controller.updateFood
      )
      .delete(this.controller.deleteFood);
  }
}

export default RestaurantFoodRouter;
