import AuthChecker from "../common/middleware/authChecker/authChecker";
import AuthBtocUserAuthRouter from "./router/auth.btoc-user.router";
import HotelAdminAuthRouter from "./router/auth.hotel-admin.router";
import MAdminAuthRouter from "./router/mAuth.admin.router";
import { Router } from "express";

class AuthRouter {
	public AuthRouter = Router();

	private authChecker = new AuthChecker();

	constructor() {
		this.callRouter();
	}
	private callRouter() {
		// admin auth for hotel
		this.AuthRouter.use("/reservation", new HotelAdminAuthRouter().router);

		// ================== m360ict admin panel auth ================== //

		this.AuthRouter.use("/m-admin", new MAdminAuthRouter().router);

		this.AuthRouter.use("/btoc", new AuthBtocUserAuthRouter().router);
	}
}

export default AuthRouter;
