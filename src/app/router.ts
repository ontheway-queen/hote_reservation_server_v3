import { Router } from "express";
import { ReservationRootRouter } from "../appAdmin/reservationRoot.router";
import ManagementRouter from "../appM360/routers/managementRoot.router";
import AuthRouter from "../auth/auth.router";
import CommonRouter from "../common/router/common.router";
import BtocRouter from "../btoc/btoc.router";

class RootRouter {
	public v1Router = Router();

	constructor() {
		this.callV1Router();
	}

	private callV1Router() {
		this.v1Router.use("/common", new CommonRouter().router);

		this.v1Router.use("/auth", new AuthRouter().AuthRouter);

		this.v1Router.use("/reservation", new ReservationRootRouter().router);

		this.v1Router.use(
			"/management",
			new ManagementRouter().managementRouter
		);

		this.v1Router.use("/btoc", new BtocRouter().BtocRouter);
	}
}
export default RootRouter;
