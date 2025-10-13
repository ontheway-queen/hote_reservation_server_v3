import AbstractRouter from "../../abstarcts/abstract.router";
import RestaurantMenuCategoryController from "../controllers/menuCategory.controller";

class RestaurantMenuCategoryRouter extends AbstractRouter {
  private controller = new RestaurantMenuCategoryController();

  constructor() {
    super();
    this.callV1Router();
  }

  private callV1Router() {
    this.router
      .route("/")
      .post(this.controller.createMenuCategory)
      .get(this.controller.getMenuCategories);

    this.router
      .route("/:id")
      .patch(this.controller.updateMenuCategory)
      .delete(this.controller.deleteMenuCategory);
  }
}

export default RestaurantMenuCategoryRouter;
