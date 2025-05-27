import AbstractRouter from "../../abstarcts/abstract.router";
import AccountController from "../controllers/account.controller";

class AccountRouter extends AbstractRouter {
  private controller;
  constructor() {
    super();
    this.controller = new AccountController();
    this.callRouter();
  }
  private callRouter() {
    this.router.get("/groups", this.controller.getAllGroups);

    this.router
      .route("/head")
      .get(this.controller.getallAccHeads)
      .post(this.controller.insertAccHead);

    this.router
      .route("/acc-head/:id")
      .get(this.controller.updateAccHead)
      .post(this.controller.deleteAccHead);

    this.router.route("/general-journal").get(this.controller.generalJournal);

    this.router.route("/acc-voucher").get(this.controller.allAccVouchers);

    this.router
      .route("/")
      .post(this.controller.createAccount)
      .get(this.controller.getAllAccount);

    this.router
      .route("/balance-transfer")
      .post(this.controller.balanceTransfer);

    this.router.route("/:id").patch(this.controller.updateAccount);
  }
}
export default AccountRouter;
