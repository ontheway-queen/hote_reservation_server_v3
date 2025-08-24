import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

export class BtocConfigService extends AbstractServices {
	constructor() {
		super();
	}

	// get Site Configuration
	public async getSiteConfiguration(req: Request) {
		const { hotel_code } = req.web_token;
		const configurationModel = this.Model.b2cConfigurationModel();
		const data = await configurationModel.getSiteConfig({
			hotel_code,
		});
		if (!data) {
			return {
				success: false,
				message: "No site configuration found!",
				code: this.StatusCode.HTTP_NOT_FOUND,
			};
		}

		return {
			success: false,
			message: "Site configuration fetched successfully!",
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	// get pop up banner
	public async getPopUpBannerConfiguration(req: Request) {
		const { hotel_code } = req.web_token;
		const configurationModel = this.Model.b2cConfigurationModel();
		const data = await configurationModel.getPopUpBanner({
			hotel_code,
		});
		if (!data) {
			return {
				success: false,
				message: "No pop up banner found!",
				code: this.StatusCode.HTTP_NOT_FOUND,
			};
		}

		return {
			success: false,
			message: "Pop up banner fetched successfully!",
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	// get hero bg content
	public async getHeroBgContent(req: Request) {
		const { hotel_code } = req.web_token;
		const configurationModel = this.Model.b2cConfigurationModel();
		const data = await configurationModel.getHeroBgContent({
			hotel_code,
		});
		if (data && data.length < 1) {
			return {
				success: false,
				message: "No hero bg content found!",
				code: this.StatusCode.HTTP_NOT_FOUND,
			};
		}

		return {
			success: false,
			message: "Hero BG content fetched successfully!",
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async getHotDeals(req: Request) {
		const { hotel_code } = req.web_token;
		const configurationModel = this.Model.b2cConfigurationModel();
		const data = await configurationModel.getHotDeals({
			hotel_code,
		});
		if (data && data.length < 1) {
			return {
				success: false,
				message: "No Hot deals found!",
				code: this.StatusCode.HTTP_NOT_FOUND,
			};
		}

		return {
			success: false,
			message: "Hot Deals fetched successfully!",
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async getSocialLinks(req: Request) {
		const { hotel_code } = req.web_token;
		const configurationModel = this.Model.b2cConfigurationModel();
		const data = await configurationModel.getSocialLinks({
			hotel_code,
		});
		if (data && data.length < 1) {
			return {
				success: false,
				message: "No social links found!",
				code: this.StatusCode.HTTP_NOT_FOUND,
			};
		}

		return {
			success: false,
			message: "Social Links fetched successfully!",
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async getPopularRoomTypes(req: Request) {
		const { hotel_code } = req.web_token;
		const configurationModel = this.Model.b2cConfigurationModel();
		const data = await configurationModel.getPopularRoomTypes({
			hotel_code,
		});
		if (data && data.length < 1) {
			return {
				success: false,
				message: "No social links found!",
				code: this.StatusCode.HTTP_NOT_FOUND,
			};
		}

		return {
			success: false,
			message: "Social Links fetched successfully!",
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}
}
