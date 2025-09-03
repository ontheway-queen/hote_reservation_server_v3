import AbstractRouter from "../../abstarcts/abstract.router";

import B2CSiteConfigRouter from "./siteConfiguration";

class AdminBtocHandlerRouter extends AbstractRouter {
  // private controller = new AdminBtocHandlerController();
  constructor() {
    super();

    this.callRouter();
  }
  private callRouter() {
    this.router.use("/site-config", new B2CSiteConfigRouter().router);
  }
}
export default AdminBtocHandlerRouter;
