import AbstractRouter from "../../abstarcts/abstract.router";
import { SettingRootController } from "../controllers/setting.root.controller";

class SettingRootRouter extends AbstractRouter {
  private controller = new SettingRootController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/accommodation")
      .post(this.controller.insertAccomodation)
      .get(this.controller.getAccomodation)
      .patch(this.controller.updateAccomodation);

    //cancellation policy
    this.router
      .route("/cancellation-policy")
      .post(this.controller.insertCancellationPolicy)
      .get(this.controller.getAllCancellationPolicy);

    this.router
      .route("/cancellation-policy/:id")
      .get(this.controller.getSingleCancellationPolicy)
      .patch(this.controller.updateCancellationPolicy);

    this.router.route("/meal-plan").get(this.controller.getAllMealPlan);

    this.router.route("/sources").get(this.controller.getAllSources);

    this.router
      .route("/child-age-policies")
      .get(this.controller.getChildAgePolicies);
  }
}
export default SettingRootRouter;
