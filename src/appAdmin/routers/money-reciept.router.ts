import AbstractRouter from "../../abstarcts/abstract.router";
import MoneyRecieptController from "../controllers/money-reciept.controller";

class MoneyRecieptRouter extends AbstractRouter {
  public controller;

  constructor() {
    super();
    this.controller = new MoneyRecieptController();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/by-folio-id/:id")
      .get(this.controller.getMoneyReceiptByFolio);

    // get single money receipt by id
    this.router.route("/:id").get(this.controller.getMoneyReceiptById);
  }
}

export default MoneyRecieptRouter;
