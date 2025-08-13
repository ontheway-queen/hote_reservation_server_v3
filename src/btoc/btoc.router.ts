import { Router } from "express";
import UserProfileRouter from "./router/userProfile.router";

class BtocRouter {
	public BtocRouter = Router();

	constructor() {
		this.callRouter();
	}

	private callRouter() {
		this.BtocRouter.use("/user", new UserProfileRouter().router);
	}
}

export default BtocRouter;
