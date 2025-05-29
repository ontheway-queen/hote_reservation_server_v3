import AbstractRouter from "../../abstarcts/abstract.router";
import MoneyRecieptController from "../controllers/money-reciept.controller";

class MoneyRecieptRouter extends AbstractRouter {
  public moneyRecieptController;

  constructor() {
    super();
    this.moneyRecieptController = new MoneyRecieptController();
    this.callRouter();
  }

  private callRouter() {}
}

export default MoneyRecieptRouter;
