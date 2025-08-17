import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import { BtocConfigService } from "../services/btocConfig.service";

export class BtocConfigController extends AbstractController {
	private service = new BtocConfigService();

	constructor() {
		super();
	}

	public getSiteConfiguration = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSiteConfiguration(
				req
			);

			res.status(code).json(data);
		}
	);

	public getPopUpBannerConfiguration = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getPopUpBannerConfiguration(req);

			res.status(code).json(data);
		}
	);

	public getHeroBgContent = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getHeroBgContent(req);

			res.status(code).json(data);
		}
	);

	public getHotDeals = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getHotDeals(req);

			res.status(code).json(data);
		}
	);

	public getSocialLinks = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSocialLinks(req);

			res.status(code).json(data);
		}
	);

	public getPopularRoomTypes = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getPopularRoomTypes(
				req
			);

			res.status(code).json(data);
		}
	);
}
