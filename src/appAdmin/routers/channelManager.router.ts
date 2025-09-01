import AbstractRouter from "../../abstarcts/abstract.router";
import ChannelManagerController from "../controllers/channelManager.controller";

class ChannelManagerRouter extends AbstractRouter {
  private controller;
  constructor() {
    super();
    this.controller = new ChannelManagerController();
    this.callRouter();
  }
  private callRouter() {
    this.router
      .route("/")
      .post(this.controller.addChannelManager)
      .get(this.controller.getAllChannelManager);

    this.router.route("/:id").patch(this.controller.updateChannelManager);
  }
}
export default ChannelManagerRouter;
