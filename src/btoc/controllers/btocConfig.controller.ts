import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import { BtocConfigService } from "../services/btocConfig.service";

export class BtocConfigController extends AbstractController {
	private service = new BtocConfigService();

	constructor() {
		super();
	}
	public GetHomePageData = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...rest } = await this.service.GetHomePageData(req);
			res.status(code).json(rest);
		}
	);

	public GetAboutUsPageData = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...rest } = await this.service.GetAboutUsPageData(
				req
			);
			res.status(code).json(rest);
		}
	);

	public GetContactUsPageData = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...rest } = await this.service.GetContactUsPageData(
				req
			);
			res.status(code).json(rest);
		}
	);

	public GetPrivacyPolicyPageData = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...rest } =
				await this.service.GetPrivacyPolicyPageData(req);
			res.status(code).json(rest);
		}
	);

	public GetTermsAndConditionsPageData = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...rest } =
				await this.service.GetTermsAndConditionsPageData(req);
			res.status(code).json(rest);
		}
	);

	public getPopUpBanner = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getPopUpBanner(req);
			res.status(code).json(data);
		}
	);

	public getAllFaq = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllFaq(req);
			res.status(code).json(data);
		}
	);

	public GetAccountsData = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...rest } = await this.service.GetAccountsData(req);
			res.status(code).json(rest);
		}
	);

	public getAllHotelImages = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllHotelImages(req);
			res.status(code).json(data);
		}
	);
}
