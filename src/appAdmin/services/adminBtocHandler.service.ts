import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class AdminBtocHandlerService extends AbstractServices {
	constructor() {
		super();
	}

	// get Site Configuration
	public async getSiteConfiguration(req: Request) {
		const { hotel_code } = req.hotel_admin;
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
		const { hotel_code } = req.hotel_admin;
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
		const { hotel_code } = req.hotel_admin;
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
		const { hotel_code } = req.hotel_admin;
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
		const { hotel_code } = req.hotel_admin;
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

	// update site config
	public async updateSiteConfig(req: Request) {
		return await this.db.transaction(async (trx) => {
			const hotel_code = req.hotel_admin.hotel_code;
			let {
				id,
				main_logo,
				contact_us_thumbnail,
				about_us_thumbnail,
				favicon,
				site_thumbnail,
				...rest_site_config
			} = req.body;
			const files = (req.files as Express.Multer.File[]) || [];

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

			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "main_logo":
						main_logo = filename;
						break;
					case "contact_us_thumbnail":
						contact_us_thumbnail = filename;
						break;
					case "about_us_thumbnail":
						about_us_thumbnail = filename;
						break;
					case "favicon":
						favicon = filename;
						break;
					case "site_thumbnail":
						site_thumbnail = filename;
						break;
					default:
						break;
				}
			}

			const newSiteConfig = {
				main_logo,
				contact_us_thumbnail,
				about_us_thumbnail,
				favicon,
				site_thumbnail,
				...rest_site_config,
			};

			await configurationModel.updateSiteConfig({
				hotel_code,
				payload: newSiteConfig,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Hotel configuration updated successfully",
			};
		});
	}

	// update site pop up banner
	public async updatePopUpBanner(req: Request) {
		return await this.db.transaction(async (trx) => {
			const hotel_code = req.hotel_admin.hotel_code;
			let { thumbnail: pop_up_banner_thumbnail, ...rest_pop_up_banner } =
				req.body;
			const files = (req.files as Express.Multer.File[]) || [];

			const configurationModel = this.Model.b2cConfigurationModel();
			const data = await configurationModel.getSiteConfig({
				hotel_code,
			});
			if (!data) {
				return {
					success: false,
					message: "No pop up banner found!",
					code: this.StatusCode.HTTP_NOT_FOUND,
				};
			}

			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "thumbnail":
						pop_up_banner_thumbnail = filename;
						break;
					default:
						break;
				}
			}

			const newPopUpBannerThumbnail = {
				thumbnail: pop_up_banner_thumbnail,
				...rest_pop_up_banner,
			};

			await configurationModel.updatePopUpBanner({
				hotel_code,
				payload: newPopUpBannerThumbnail,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Pop up banner updated successfully",
			};
		});
	}

	// update hero bg content
	public async updateHeroBgContent(req: Request) {
		return await this.db.transaction(async (trx) => {
			const hotel_code = req.hotel_admin.hotel_code;
			let { id, order_number, ...rest_hero_bg_content } = req.body;
			const files = (req.files as Express.Multer.File[]) || [];

			const configurationModel = this.Model.b2cConfigurationModel();
			const data = await configurationModel.getHeroBgContent({
				hotel_code,
				id: Number(id),
			});
			if (data && data.length < 1) {
				return {
					success: false,
					message: "No pop up banner found!",
					code: this.StatusCode.HTTP_NOT_FOUND,
				};
			}

			const isOrderExists = await configurationModel.getHeroBgContent({
				hotel_code,
				order_number,
			});

			if (isOrderExists && isOrderExists.length < 1) {
				return {
					success: false,
					message:
						"An entry with the same order number already exists!",
					code: this.StatusCode.HTTP_CONFLICT,
				};
			}

			let content;
			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "content":
						content = filename;
						break;
					default:
						break;
				}
			}

			const newHeroBgContent = {
				content,
				...rest_hero_bg_content,
			};

			await configurationModel.updateHeroBgContent({
				hotel_code,
				id,
				payload: newHeroBgContent,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Hotel configuration updated successfully",
			};
		});
	}

	public async updateHotDeals(req: Request) {
		return await this.db.transaction(async (trx) => {
			const hotel_code = req.hotel_admin.hotel_code;
			const { id, order_number, ...rest_hot_deals } = req.body;
			const files = (req.files as Express.Multer.File[]) || [];
			const configurationModel = this.Model.b2cConfigurationModel();
			const data = await configurationModel.getHotDeals({
				hotel_code,
				id: Number(id),
			});
			if (data && data.length < 1) {
				return {
					success: false,
					message: "No hot deals found!",
					code: this.StatusCode.HTTP_NOT_FOUND,
				};
			}

			const isOrderExists = await configurationModel.getHotDeals({
				hotel_code,
				order_number,
			});

			if (isOrderExists && isOrderExists.length < 1) {
				return {
					success: false,
					message:
						"An entry with the same order number already exists!",
					code: this.StatusCode.HTTP_CONFLICT,
				};
			}

			let thumbnail;
			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "thumbnail":
						thumbnail = filename;
						break;
					default:
						break;
				}
			}

			const newHotDeals = {
				thumbnail,
				...rest_hot_deals,
			};

			await configurationModel.updateHotDeals({
				hotel_code,
				id,
				payload: newHotDeals,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Hotel configuration updated successfully",
			};
		});
	}

	public async updateSocialLinks(req: Request) {
		return await this.db.transaction(async (trx) => {
			const hotel_code = req.hotel_admin.hotel_code;
			const { id, order_number, ...rest_social_links } = req.body;
			const files = (req.files as Express.Multer.File[]) || [];

			const configurationModel = this.Model.b2cConfigurationModel();
			const data = await configurationModel.getHotDeals({
				hotel_code,
				id: Number(id),
			});
			if (data && data.length < 1) {
				return {
					success: false,
					message: "No social links found!",
					code: this.StatusCode.HTTP_NOT_FOUND,
				};
			}

			const isOrderExists = await configurationModel.getHotDeals({
				hotel_code,
				order_number,
			});

			if (isOrderExists && isOrderExists.length < 1) {
				return {
					success: false,
					message:
						"An entry with the same order number already exists!",
					code: this.StatusCode.HTTP_CONFLICT,
				};
			}

			let icon;
			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "icon":
						icon = filename;
						break;
					default:
						break;
				}
			}

			const newSocialLinks = {
				icon,
				order_number,
				...rest_social_links,
			};

			console.log({
				newSocialLinks,
			});

			await configurationModel.updateSocialLinks({
				hotel_code,
				id,
				payload: newSocialLinks,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Hotel configuration updated successfully",
			};
		});
	}
}

export default AdminBtocHandlerService;
