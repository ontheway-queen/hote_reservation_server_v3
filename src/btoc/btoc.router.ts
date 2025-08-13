import { Router } from "express";
import UserRouter from "./router/user.router";

class BtocRouter {
	public BtocRouter = Router();

	constructor() {
		this.callRouter();
	}

	private callRouter() {
		this.BtocRouter.use("/user", new UserRouter().router);
	}
}

export default BtocRouter;
