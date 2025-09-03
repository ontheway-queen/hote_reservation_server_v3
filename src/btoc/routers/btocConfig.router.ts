import { Router } from "express";
import AbstractRouter from "../../abstarcts/abstract.router";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import { BtocConfigController } from "../controllers/btocConfig.controller";

export class BtocConfigRouter extends AbstractRouter {
	public router = Router();
	public authChecker = new AuthChecker();
	private controller = new BtocConfigController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/home").get(this.controller.GetHomePageData);

		this.router.route("/about-us").get(this.controller.GetAboutUsPageData);

		this.router
			.route("/contact-us")
			.get(this.controller.GetContactUsPageData);

		this.router
			.route("/privacy-policy")
			.get(this.controller.GetPrivacyPolicyPageData);

		this.router
			.route("/terms-and-conditions")
			.get(this.controller.GetTermsAndConditionsPageData);

		this.router.route("/pop-up").get(this.controller.getPopUpBanner);

		this.router.route("/faq").get(this.controller.getAllFaq);

		this.router.route("/accounts").get(this.controller.GetAccountsData);

		this.router
			.route("/hotel-images")
			.get(this.controller.getAllHotelImages);
	}
}
