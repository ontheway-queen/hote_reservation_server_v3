import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import AdminBtocService from "../services/btoc.service";

class AdminBtocController extends AbstractController {
	private btocService = new AdminBtocService();
	constructor() {
		super();
	}

	public updateSiteConfiguration = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.btocService.updateSiteConfiguration(req);

			res.status(code).json(data);
		}
	);
}

export default AdminBtocController;
