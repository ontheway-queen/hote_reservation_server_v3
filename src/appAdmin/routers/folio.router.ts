import AbstractRouter from "../../abstarcts/abstract.router";
import { FolioController } from "../controllers/folio.controller";

class FolioRouter extends AbstractRouter {
  private controller;
  constructor() {
    super();
    this.controller = new FolioController();
    this.callRouter();
  }

  private callRouter() {
    this.router.route("/").post(this.controller.createFolio);

    this.router
      .route("/split-master-folio")
      .post(this.controller.splitMasterFolio);
  }
}
export default FolioRouter;
