import AbstractRouter from "../../abstarcts/abstract.router";
import { CommonController } from "../controllers/common.controller";
import SettingRootRouter from "./setting.root.router";

class CommonRouter extends AbstractRouter {
  private controller = new CommonController();
  constructor() {
    super();

    this.callRouter();
  }
  private callRouter() {
    this.router.route("/city").get(this.controller.getAllCity);
  }
}
export default CommonRouter;
