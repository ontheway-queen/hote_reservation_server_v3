// import { Request } from "express";
// import AbstractServices from "../../abstarcts/abstract.service";
// import CustomError from "../../utils/lib/customEror";
// import {
// 	IUpdateAgencyB2CHeroBgContentPayload,
// } from "../utlis/interfaces/configuration.interface";
// import { heroBG } from "../../utils/miscellaneous/siteConfig/pagesContent";

// class AdminBtocHandlerService extends AbstractServices {
// 	constructor() {
// 		super();
// 	}

// 	// get Site Configuration
// 	public async getSiteConfiguration(req: Request) {
// 		const { hotel_code } = req.hotel_admin;
// 		const configurationModel = this.Model.b2cConfigurationModel();
// 		const data = await configurationModel.getSiteConfig({
// 			hotel_code,
// 		});
// 		if (!data) {
// 			return {
// 				success: false,
// 				message: "No site configuration found!",
// 				code: this.StatusCode.HTTP_NOT_FOUND,
// 			};
// 		}

// 		return {
// 			success: false,
// 			message: "Site configuration fetched successfully!",
// 			code: this.StatusCode.HTTP_OK,
// 			data,
// 		};
// 	}

// 	public async getPopUpBannerConfiguration(req: Request) {
// 		const { hotel_code } = req.hotel_admin;
// 		const configurationModel = this.Model.b2cConfigurationModel();
// 		const data = await configurationModel.getPopUpBanner({
// 			hotel_code,
// 		});

// 		return {
// 			success: false,
// 			message: "Pop up banner fetched successfully!",
// 			code: this.StatusCode.HTTP_OK,
// 			data,
// 		};
// 	}

// 	// get hero bg content
// 	public async getHeroBgContent(req: Request) {
// 		const { hotel_code } = req.hotel_admin;
// 		const configurationModel = this.Model.b2cConfigurationModel();
// 		const data = await configurationModel.getHeroBgContent({
// 			hotel_code,
// 		});

// 		return {
// 			success: false,
// 			message: "Hero BG content fetched successfully!",
// 			code: this.StatusCode.HTTP_OK,
// 			data,
// 		};
// 	}

// 	public async getHotDeals(req: Request) {
// 		const { hotel_code } = req.hotel_admin;
// 		const configurationModel = this.Model.b2cConfigurationModel();
// 		const data = await configurationModel.getHotDeals({
// 			hotel_code,
// 		});
// 		if (data && data.length < 1) {
// 			return {
// 				success: false,
// 				message: "No Hot deals found!",
// 				code: this.StatusCode.HTTP_NOT_FOUND,
// 			};
// 		}

// 		return {
// 			success: false,
// 			message: "Hot Deals fetched successfully!",
// 			code: this.StatusCode.HTTP_OK,
// 			data,
// 		};
// 	}

// 	public async getSocialLinks(req: Request) {
// 		const { hotel_code } = req.hotel_admin;
// 		const configurationModel = this.Model.b2cConfigurationModel();
// 		const data = await configurationModel.getSocialLinks({
// 			hotel_code,
// 		});
// 		if (data && data.length < 1) {
// 			return {
// 				success: false,
// 				message: "No social links found!",
// 				code: this.StatusCode.HTTP_NOT_FOUND,
// 			};
// 		}

// 		return {
// 			success: false,
// 			message: "Social Links fetched successfully!",
// 			code: this.StatusCode.HTTP_OK,
// 			data,
// 		};
// 	}

// 	public async getPopularRoomTypes(req: Request) {
// 		const { hotel_code } = req.hotel_admin;
// 		const configurationModel = this.Model.b2cConfigurationModel();
// 		const data = await configurationModel.getPopularRoomTypes({
// 			hotel_code,
// 		});
// 		if (data && data.length < 1) {
// 			return {
// 				success: false,
// 				message: "No popular room types found!",
// 				code: this.StatusCode.HTTP_NOT_FOUND,
// 			};
// 		}

// 		return {
// 			success: false,
// 			message: "Popular room types fetched successfully!",
// 			code: this.StatusCode.HTTP_OK,
// 			data,
// 		};
// 	}

// 	// update site config
// 	public async updateSiteConfig(req: Request) {
// 		return await this.db.transaction(async (trx) => {
// 			const hotel_code = req.hotel_admin.hotel_code;
// 			let {} = req.body as IBtocSiteConfigUpdateReqBody;

// 			const files = (req.files as Express.Multer.File[]) || [];

// 			const configurationModel = this.Model.b2cConfigurationModel(trx);
// 			//   const data = await configurationModel.getSiteConfig({
// 			//     hotel_code,
// 			//   });

// 			//   if (!data) {
// 			//     return {
// 			//       success: false,
// 			//       message: "No site configuration found!",
// 			//       code: this.StatusCode.HTTP_NOT_FOUND,
// 			//     };
// 			//   }

// 			for (const { fieldname, filename } of files) {
// 				switch (fieldname) {
// 					case "main_logo":
// 						req.body.main_logo = filename;
// 						break;
// 					case "contact_us_thumbnail":
// 						req.body.contact_us_thumbnail = filename;
// 						break;
// 					case "about_us_thumbnail":
// 						req.body.about_us_thumbnail = filename;
// 						break;
// 					case "favicon":
// 						req.body.favicon = filename;
// 						break;
// 					case "site_thumbnail":
// 						req.body.site_thumbnail = filename;
// 						break;
// 					default:
// 						break;
// 				}
// 			}

// 			const newSiteConfig = {
// 				main_logo: req.body.main_logo,
// 				contact_us_thumbnail: req.body.contact_us_thumbnail,
// 				hotel_code: req.hotel_admin.hotel_code,
// 				favicon: req.body.favicon,
// 				site_thumbnail: req.body.site_thumbnail,
// 				emails: JSON.stringify(req.body.emails ?? []),
// 				numbers: JSON.stringify(req.body.numbers ?? []),
// 				address: JSON.stringify(req.body.address ?? []),
// 				hero_quote: req.body.hero_quote,
// 				hero_sub_quote: req.body.hero_sub_quote,
// 				site_name: req.body.site_name,
// 				contact_us_content: req.body.contact_us_content,
// 				about_us_content: req.body.about_us_content,
// 				privacy_policy_content: req.body.privacy_policy_content,
// 				terms_and_conditions_content:
// 					req.body.terms_and_conditions_content,
// 				meta_title: req.body.meta_title,
// 				meta_description: req.body.meta_description,
// 				meta_tags: req.body.meta_tags,
// 				notice: req.body.notice,
// 				android_app_link: req.body.android_app_link,
// 				ios_app_link: req.body.ios_app_link,
// 			};

// 			console.log(newSiteConfig);
// 			await configurationModel.updateSiteConfig({
// 				hotel_code,
// 				payload: newSiteConfig,
// 			});

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_OK,
// 				message: "Hotel configuration updated successfully",
// 			};
// 		});
// 	}

// 	// update site pop up banner
// 	public async updatePopUpBanner(req: Request) {
// 		return await this.db.transaction(async (trx) => {
// 			const hotel_code = req.hotel_admin.hotel_code;
// 			let { thumbnail: pop_up_banner_thumbnail, ...rest_pop_up_banner } =
// 				req.body;
// 			const files = (req.files as Express.Multer.File[]) || [];

// 			const configurationModel = this.Model.b2cConfigurationModel();
// 			const data = await configurationModel.getSiteConfig({
// 				hotel_code,
// 			});
// 			if (!data) {
// 				return {
// 					success: false,
// 					message: "No pop up banner found!",
// 					code: this.StatusCode.HTTP_NOT_FOUND,
// 				};
// 			}

// 			for (const { fieldname, filename } of files) {
// 				switch (fieldname) {
// 					case "thumbnail":
// 						pop_up_banner_thumbnail = filename;
// 						break;
// 					default:
// 						break;
// 				}
// 			}

// 			const newPopUpBannerThumbnail = {
// 				thumbnail: pop_up_banner_thumbnail,
// 				updated_at: new Date(),
// 				...rest_pop_up_banner,
// 			};

// 			await configurationModel.updatePopUpBanner({
// 				hotel_code,
// 				payload: newPopUpBannerThumbnail,
// 			});

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_OK,
// 				message: "Pop up banner updated successfully",
// 			};
// 		});
// 	}

// 	public async getHeroBGContent(req: Request) {
// 		const configModel = this.Model.b2cConfigurationModel();
// 		const { hotel_code } = req.hotel_admin;

// 		const hero_bg_data = await configModel.getHeroBGContent({
// 			hotel_code,
// 		});

// 		return {
// 			success: true,
// 			code: this.StatusCode.HTTP_OK,
// 			message: this.ResMsg.HTTP_OK,
// 			data: hero_bg_data,
// 		};
// 	}

// 	public async createHeroBGContent(req: Request) {
// 		return this.db.transaction(async (trx) => {
// 			const configModel = this.Model.b2cConfigurationModel(trx);
// 			const { hotel_code, id } = req.hotel_admin;

// 			const body = req.body as ICreateHeroBGContentReqBody;

// 			const files = (req.files as Express.Multer.File[]) || [];

// 			if (!files.length) {
// 				return {
// 					success: false,
// 					code: this.StatusCode.HTTP_BAD_REQUEST,
// 					message: "Content is required",
// 				};
// 			}

// 			const lastOrderNumber = await configModel.getHeroBGContentLastNo({
// 				hotel_code,
// 			});

// 			const heroBG = await configModel.insertHeroBGContent({
// 				hotel_code,
// 				...body,
// 				content: files[0].filename,
// 				order_number: lastOrderNumber
// 					? lastOrderNumber.order_number + 1
// 					: 1,
// 			});

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_OK,
// 				message: this.ResMsg.HTTP_OK,
// 				data: {
// 					content: files[0].filename,
// 					id: heroBG[0].id,
// 				},
// 			};
// 		});
// 	}

// 	public async updateHeroBGContent(req: Request) {
// 		return this.db.transaction(async (trx) => {
// 			const body = req.body as IUpdateHeroBGContentReqBody;
// 			const { hotel_code, id: user_id } = req.hotel_admin;
// 			const configModel = this.Model.b2cConfigurationModel(trx);

// 			const id = Number(req.params.id);

// 			const check = await configModel.checkHeroBGContent({
// 				hotel_code,
// 				id,
// 			});

// 			if (!check.length) {
// 				return {
// 					success: false,
// 					code: this.StatusCode.HTTP_NOT_FOUND,
// 					message: this.ResMsg.HTTP_NOT_FOUND,
// 				};
// 			}

// 			const files = (req.files as Express.Multer.File[]) || [];

// 			const payload: IUpdateAgencyB2CHeroBgContentPayload = body;

// 			if (files.length) {
// 				payload.content = files[0].filename;
// 			}

// 			if (!Object.keys(payload).length) {
// 				return {
// 					success: false,
// 					code: this.StatusCode.HTTP_BAD_REQUEST,
// 					message: this.ResMsg.HTTP_BAD_REQUEST,
// 				};
// 			}

// 			await configModel.updateHeroBGContent(payload, { hotel_code, id });

// 			if (payload.content && check[0].content) {
// 				const heroContent = heroBG(hotel_code);

// 				const found = heroContent.find(
// 					(item) => item.content === check[0].content
// 				);

// 				if (!found) {
// 					await this.manageFile.deleteFromCloud([check[0].content]);
// 				}
// 			}

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_OK,
// 				message: this.ResMsg.HTTP_OK,
// 				data: { content: payload.content },
// 			};
// 		});
// 	}

// 	public async deleteHeroBGContent(req: Request) {
// 		return this.db.transaction(async (trx) => {
// 			const { hotel_code, id: deleted_by } = req.hotel_admin;
// 			const configModel = this.Model.b2cConfigurationModel(trx);

// 			const id = Number(req.params.id);

// 			const check = await configModel.checkHeroBGContent({
// 				hotel_code,
// 				id,
// 			});

// 			if (!check.length) {
// 				return {
// 					success: false,
// 					code: this.StatusCode.HTTP_NOT_FOUND,
// 					message: this.ResMsg.HTTP_NOT_FOUND,
// 				};
// 			}

// 			await configModel.deleteHeroBGContent({ hotel_code, id });

// 			if (check[0].content) {
// 				const heroContent = heroBG(hotel_code);

// 				const found = heroContent.find(
// 					(item) => item.content === check[0].content
// 				);

// 				if (!found) {
// 					await this.manageFile.deleteFromCloud([check[0].content]);
// 				}
// 			}

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_OK,
// 				message: this.ResMsg.HTTP_OK,
// 			};
// 		});
// 	}

// 	public async updateHotDeals(req: Request) {
// 		return await this.db.transaction(async (trx) => {
// 			const hotel_code = req.hotel_admin.hotel_code;
// 			const { id, order_number, ...rest_hot_deals } = req.body;
// 			const files = (req.files as Express.Multer.File[]) || [];
// 			const configurationModel = this.Model.b2cConfigurationModel();
// 			// const data = await configurationModel.getHotDeals({
// 			//   hotel_code,
// 			//   id: Number(id),
// 			// });

// 			const isOrderExists = await configurationModel.getHotDeals({
// 				hotel_code,
// 				order_number,
// 			});

// 			if (isOrderExists && isOrderExists.length > 0) {
// 				return {
// 					success: false,
// 					message:
// 						"An entry with the same order number already exists!",
// 					code: this.StatusCode.HTTP_CONFLICT,
// 				};
// 			}

// 			let thumbnail;
// 			for (const { fieldname, filename } of files) {
// 				switch (fieldname) {
// 					case "thumbnail":
// 						thumbnail = filename;
// 						break;
// 					default:
// 						break;
// 				}
// 			}

// 			const newHotDeals = {
// 				thumbnail,
// 				...rest_hot_deals,
// 			};

// 			await configurationModel.updateHotDeals({
// 				hotel_code,
// 				id,
// 				payload: newHotDeals,
// 			});

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_OK,
// 				message: "Hotel configuration updated successfully",
// 			};
// 		});
// 	}

// 	public async updateSocialLinks(req: Request) {
// 		return await this.db.transaction(async (trx) => {
// 			const hotel_code = req.hotel_admin.hotel_code;
// 			const { id, order_number, ...rest_social_links } = req.body;
// 			const files = (req.files as Express.Multer.File[]) || [];

// 			const configurationModel = this.Model.b2cConfigurationModel();
// 			const data = await configurationModel.getHotDeals({
// 				hotel_code,
// 				id: Number(id),
// 			});
// 			if (data && data.length < 1) {
// 				return {
// 					success: false,
// 					message: "No social links found!",
// 					code: this.StatusCode.HTTP_NOT_FOUND,
// 				};
// 			}

// 			const isOrderExists = await configurationModel.getHotDeals({
// 				hotel_code,
// 				order_number,
// 			});

// 			if (isOrderExists && isOrderExists.length > 0) {
// 				return {
// 					success: false,
// 					message:
// 						"An entry with the same order number already exists!",
// 					code: this.StatusCode.HTTP_CONFLICT,
// 				};
// 			}

// 			let icon;
// 			for (const { fieldname, filename } of files) {
// 				switch (fieldname) {
// 					case "icon":
// 						icon = filename;
// 						break;
// 					default:
// 						break;
// 				}
// 			}

// 			const newSocialLinks = {
// 				icon,
// 				order_number,
// 				...rest_social_links,
// 			};

// 			console.log({
// 				newSocialLinks,
// 			});

// 			await configurationModel.updateSocialLinks({
// 				hotel_code,
// 				id,
// 				payload: newSocialLinks,
// 			});

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_OK,
// 				message: "Hotel configuration updated successfully",
// 			};
// 		});
// 	}

// 	public async updatePopularRoomTypes(req: Request) {
// 		return await this.db.transaction(async (trx) => {
// 			const hotel_code = req.hotel_admin.hotel_code;
// 			const { id, order_number, ...rest_popular_room_types } = req.body;
// 			const files = (req.files as Express.Multer.File[]) || [];

// 			const configurationModel = this.Model.b2cConfigurationModel();
// 			const data = await configurationModel.getPopularRoomTypes({
// 				hotel_code,
// 				id: Number(id),
// 			});
// 			if (data && data.length < 1) {
// 				return {
// 					success: false,
// 					message: "No room type found!",
// 					code: this.StatusCode.HTTP_NOT_FOUND,
// 				};
// 			}
// 			console.log(order_number);
// 			const isOrderExists = await configurationModel.getPopularRoomTypes({
// 				hotel_code,
// 				order_number,
// 			});

// 			if (isOrderExists && isOrderExists.length > 0) {
// 				return {
// 					success: false,
// 					message:
// 						"An entry with the same order number already exists!",
// 					code: this.StatusCode.HTTP_CONFLICT,
// 				};
// 			}

// 			let thumbnail;
// 			for (const { fieldname, filename } of files) {
// 				switch (fieldname) {
// 					case "thumbnail":
// 						thumbnail = filename;
// 						break;
// 					default:
// 						break;
// 				}
// 			}

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_OK,
// 				message: "Hotel configuration updated successfully",
// 			};
// 		});
// 	}

// 	// ======================== Service Content ================================ //
// 	public async createHotelServiceContent(req: Request) {
// 		return await this.db.transaction(async (trx) => {
// 			const { hotel_code } = req.hotel_admin;
// 			const b2cConfigurationModel = this.Model.b2cConfigurationModel(trx);

// 			const serviceContent =
// 				await b2cConfigurationModel.getSingleServiceContent({
// 					hotel_code,
// 				});

// 			if (serviceContent) {
// 				return {
// 					success: false,
// 					code: this.StatusCode.HTTP_CONFLICT,
// 					message: "Service content already exists",
// 				};
// 			}

// 			await b2cConfigurationModel.createHotelServiceContent({
// 				hotel_code,
// 				title: req.body.title,
// 				description: req.body.description,
// 			});

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_SUCCESSFUL,
// 				message: "Service content created successfully.",
// 			};
// 		});
// 	}

// 	public async updateHotelServiceContent(req: Request) {
// 		return await this.db.transaction(async (trx) => {
// 			const { hotel_code } = req.hotel_admin;
// 			const b2cConfigurationModel = this.Model.b2cConfigurationModel(trx);

// 			const serviceContent =
// 				await b2cConfigurationModel.getSingleServiceContent({
// 					hotel_code,
// 				});
// 			console.log({ hotel_code });
// 			if (!serviceContent) {
// 				return {
// 					success: false,
// 					code: this.StatusCode.HTTP_CONFLICT,
// 					message: "Service content not found",
// 				};
// 			}

// 			await b2cConfigurationModel.updateServiceContent(
// 				{ title: req.body.title, description: req.body.description },
// 				{ hotel_code }
// 			);

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_SUCCESSFUL,
// 				message: "Service content updated successfully.",
// 			};
// 		});
// 	}

// 	public async getHotelContentService(req: Request) {
// 		return await this.db.transaction(async (trx) => {
// 			const { hotel_code } = req.hotel_admin;
// 			const { search, limit, skip } = req.query;
// 			const b2cConfigurationModel = this.Model.b2cConfigurationModel(trx);

// 			const serviceContent =
// 				await b2cConfigurationModel.getHotelServiceContentWithServices({
// 					hotel_code,
// 					search: search as string,
// 					limit: Number(limit),
// 					skip: Number(skip),
// 				});

// 			if (!serviceContent) {
// 				return {
// 					success: false,
// 					code: this.StatusCode.HTTP_CONFLICT,
// 					message: "Service content not found",
// 				};
// 			}

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_SUCCESSFUL,
// 				message: "Service content fetched successfully.",
// 				data: serviceContent,
// 			};
// 		});
// 	}

// 	// ======================== Services ================================ //
// 	public async createHotelService(req: Request) {
// 		return await this.db.transaction(async (trx) => {
// 			const { hotel_code } = req.hotel_admin;
// 			const files = (req.files as Express.Multer.File[]) || [];

// 			if (Array.isArray(files) && files.length > 0) {
// 				req.body["icon"] = files[0].filename;
// 			}

// 			const b2cConfigurationModel = this.Model.b2cConfigurationModel(trx);

// 			const service = await b2cConfigurationModel.getSingleService({
// 				title: req.body.title,
// 			});

// 			if (service) {
// 				return {
// 					success: false,
// 					code: this.StatusCode.HTTP_CONFLICT,
// 					message: "Service already exists",
// 				};
// 			}

// 			await b2cConfigurationModel.createHotelService({
// 				...req.body,
// 				hotel_code,
// 			});

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_SUCCESSFUL,
// 				message: "Service created successfully.",
// 			};
// 		});
// 	}

// 	public async getAllServices(req: Request) {
// 		const { title, limit, skip } = req.query;
// 		const b2cConfigurationModel = this.Model.b2cConfigurationModel();

// 		const data = await b2cConfigurationModel.getAllServices({
// 			title: title as string,
// 			limit: Number(limit),
// 			skip: Number(skip),
// 		});

// 		return {
// 			success: true,
// 			code: this.StatusCode.HTTP_SUCCESSFUL,
// 			message: "Services retrieved successfully.",
// 			...data,
// 		};
// 	}

// 	public async getSingleService(req: Request) {
// 		const id = Number(req.params.id);
// 		const b2cConfigurationModel = this.Model.b2cConfigurationModel();

// 		const data = await b2cConfigurationModel.getSingleService({ id });

// 		if (!data) {
// 			throw new CustomError(
// 				"Hotel Service not found",
// 				this.StatusCode.HTTP_NOT_FOUND
// 			);
// 		}

// 		return {
// 			success: true,
// 			code: this.StatusCode.HTTP_SUCCESSFUL,
// 			message: "Service retrieved successfully.",
// 			data,
// 		};
// 	}

// 	public async updateService(req: Request) {
// 		return await this.db.transaction(async (trx) => {
// 			const id = Number(req.params.id);
// 			const files = (req.files as Express.Multer.File[]) || [];

// 			if (Array.isArray(files) && files.length > 0) {
// 				req.body["icon"] = files[0].filename;
// 			}

// 			const b2cConfigurationModel = this.Model.b2cConfigurationModel(trx);

// 			const service = await b2cConfigurationModel.getSingleService({
// 				id,
// 			});

// 			if (!service) {
// 				return {
// 					success: false,
// 					code: this.StatusCode.HTTP_CONFLICT,
// 					message: "Service not found",
// 				};
// 			}

// 			const isServicTitleExists =
// 				await b2cConfigurationModel.getSingleService({
// 					title: req.body.title,
// 				});

// 			if (isServicTitleExists) {
// 				return {
// 					success: false,
// 					code: this.StatusCode.HTTP_CONFLICT,
// 					message: "Service title already exists",
// 				};
// 			}

// 			await b2cConfigurationModel.updateHotelService(req.body, { id });

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_SUCCESSFUL,
// 				message: "Service update successfully.",
// 			};
// 		});
// 	}

// 	public async deleteService(req: Request) {
// 		return await this.db.transaction(async (trx) => {
// 			const id = Number(req.params.id);

// 			const b2cConfigurationModel = this.Model.b2cConfigurationModel(trx);

// 			const service = await b2cConfigurationModel.getSingleService({
// 				id,
// 			});

// 			if (!service) {
// 				return {
// 					success: false,
// 					code: this.StatusCode.HTTP_CONFLICT,
// 					message: "Service not found",
// 				};
// 			}

// 			await b2cConfigurationModel.updateHotelService(req.body, { id });

// 			return {
// 				success: true,
// 				code: this.StatusCode.HTTP_SUCCESSFUL,
// 				message: "Service deleted successfully.",
// 			};
// 		});
// 	}
// }

// export default AdminBtocHandlerService;
