import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import CustomError from "../../utils/lib/customEror";

export class ServiceService extends AbstractServices {
	constructor() {
		super();
	}

	public async createService(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id } = req.hotel_admin;
			const { services, service_pricing, service_schedule } = req.body;
			const files = req.files as Express.Multer.File[];

			const services_images = [];
			let hasThumbnail = false;

			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "thumbnail_url":
						services.thumbnail_url = filename;
						hasThumbnail = true;
						break;
					case "service_images":
						const data = {
							hotel_code,
							image_url: filename,
						};
						services_images.push(data);
						break;
					default:
						break;
				}
			}

			if (!hasThumbnail) {
				throw new CustomError(
					"Thumbnail is required",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			if (services && !services.is_always_open) {
				if (!service_schedule.length) {
					return {
						success: false,
						code: this.StatusCode.HTTP_BAD_REQUEST,
						message: "Service schedule is required",
					};
				}
			}

			const serviceModel = this.Model.serviceModel(trx);
			const serviceCategoryModel = this.Model.serviceCategoriesModel(trx);
			const serviceImageModel = this.Model.serviceImageModel(trx);
			// const servicePricingModel = this.Model.servicePricingModel(trx);
			const serviceScheduleModel = this.Model.serviceScheduleModel(trx);

			const isServiceExists =
				await serviceCategoryModel.getServiceCategory({
					hotel_code,
					id: services.category_id,
				});

			if (!isServiceExists) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Service Category does not exist",
				};
			}

			const check = await serviceModel.getSingleService({
				name: services.name,
				hotel_code,
				category_id: services.category_id,
			});

			if (check) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Same service with same category already exists",
				};
			}

			const lastServiceCode = await serviceModel.getLastServiceCode(
				hotel_code
			);
			const words = services.name.trim().split(/\s+/);
			let codeWord = words
				.map((word: string) => word[0].toUpperCase())
				.filter((c: string) => /[A-Z]/.test(c))
				.join("");

			codeWord = codeWord.substring(0, 10);

			const code = lastServiceCode?.service_code.split("-")[2] || "0000";
			const newServiceCode = (parseInt(code) + 1)
				.toString()
				.padStart(4, "0");

			const [newCategory] = await serviceModel.createService({
				hotel_code,
				created_by: id,
				service_code: `SER-${codeWord}-${newServiceCode}`,
				...services,
			});

			console.log({ newCategory });

			if (services_images && services_images.length) {
				await Promise.all(
					services_images.map((img) =>
						serviceImageModel.uploadServiceImage({
							...img,
							service_id: newCategory.id,
						})
					)
				);
			}

			if (service_pricing && service_pricing.length > 0) {
				await Promise.all(
					service_pricing.map((price: any) => {
						let mainPrice = price.price;
						let vatPrice = 0;
						let discount_price = 0;

						if (
							price.discount_percent &&
							price.discount_percent > 0
						) {
							discount_price =
								price.price -
								(price.price * price.discount_percent) / 100;
						}
						let total =
							discount_price > 0
								? discount_price + price.delivery_charge
								: price.price + price.delivery_charge;

						if (price.vat_percent && price.vat_percent > 0) {
							vatPrice = (total * price.vat_percent) / 100;
						}
						console.log({
							...price,
							hotel_code,
							service_id: newCategory.id,
							total_price:
								discount_price > 0
									? (discount_price || 0) +
									  (vatPrice || 0) +
									  (price.delivery_charge || 0)
									: mainPrice +
									  (vatPrice || 0) +
									  (price.delivery_charge || 0),
							discount_price,
						});
						// return servicePricingModel.createServicePricing({
						// 	...price,
						// 	hotel_code,
						// 	service_id: newCategory.id,
						// 	total_price:
						// 		discount_price > 0
						// 			? (discount_price || 0) +
						// 			  (vatPrice || 0) +
						// 			  (price.delivery_charge || 0)
						// 			: mainPrice +
						// 			  (vatPrice || 0) +
						// 			  (price.delivery_charge || 0),
						// 	discount_price,
						// });
					})
				);
			}

			if (service_schedule && service_schedule.length > 0) {
				await Promise.all(
					service_schedule.map((schedule: any) => {
						return serviceScheduleModel.addServiceSchedule({
							...schedule,
							hotel_code,
							service_id: newCategory.id,
						});
					})
				);
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Service has been created successfully!",
			};
		});
	}

	public async getAllServices(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { key, limit, skip, status } = req.query;
		const serviceModel = this.Model.serviceModel();

		const data = await serviceModel.getAllServices({
			key: key as string,
			status: status as string,
			limit: Number(limit),
			skip: Number(skip),
			hotel_code,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			message: "Services has been fetched successfully!",
			...data,
		};
	}

	public async getSingleService(req: Request) {
		const { id } = req.params;
		const { hotel_code } = req.hotel_admin;
		const serviceModel = this.Model.serviceModel();

		const data = await serviceModel.getSingleService({
			id: Number(id),
			hotel_code,
		});

		if (!data) {
			return {
				success: false,
				code: this.StatusCode.HTTP_BAD_REQUEST,
				message: "Service does not exist",
			};
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			message: "Service has been fetched successfully!",
			data,
		};
	}

	public async deleteService(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { hotel_code } = req.hotel_admin;
			const serviceModel = this.Model.serviceModel(trx);

			const isServiceExists = await serviceModel.getSingleService({
				id: Number(id),
				hotel_code,
			});

			if (!isServiceExists) {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message: "Service does not exist",
				};
			}

			const data = await serviceModel.deleteService({
				id: Number(id),
				hotel_code,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Service has been deleted successfully!",
				data,
			};
		});
	}

	public async updateService(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { hotel_code } = req.hotel_admin;
			const {
				services,
				delete_service_images_id,
				service_pricing,
				delete_service_pricing_id,
				service_schedule,
				delete_service_schedule_id,
			} = req.body;
			const files = req.files as Express.Multer.File[];

			const serviceModel = this.Model.serviceModel(trx);
			const categoryModel = this.Model.serviceCategoriesModel(trx);
			const serviceScheduleModel = this.Model.serviceScheduleModel(trx);
			const serviceImageModel = this.Model.serviceImageModel(trx);
			// const servicePricingModel = this.Model.servicePricingModel(trx);

			const isServiceExists = await serviceModel.getSingleService({
				id: Number(id),
				hotel_code,
			});

			if (!isServiceExists) {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message: "Service does not exist",
				};
			}

			const services_images = [];

			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "thumbnail_url":
						services.thumbnail_url = filename;
						break;
					case "service_image":
						const data = {
							hotel_code,
							image_url: filename,
						};
						services_images.push(data);
						break;
					default:
						break;
				}
			}

			if (services && services.category_id) {
				const category = await categoryModel.getServiceCategory({
					hotel_code,
					id: Number(services.category_id),
				});
				if (!category) {
					return {
						success: false,
						code: this.StatusCode.HTTP_BAD_REQUEST,
						message: "Category does not exist",
					};
				}
			}

			if (services && services.is_always_open) {
				console.log(1);
				await serviceScheduleModel.updateServiceSchedule({
					where: {
						service_id: Number(id),
						hotel_code,
					},
					payload: {
						is_deleted: true,
					},
				});
			}

			if (delete_service_images_id && delete_service_images_id.length) {
				for (const id of delete_service_images_id) {
					await serviceImageModel.updateServiceImage({
						where: {
							id,
							hotel_code,
						},
						payload: {
							is_deleted: true,
						},
					});
				}
			}

			if (services_images && services_images.length) {
				await Promise.all(
					services_images.map((img) =>
						serviceImageModel.uploadServiceImage({
							...img,
							service_id: Number(id),
						})
					)
				);
			}

			if (services && !services.is_always_open) {
				if (service_schedule && !service_schedule.length) {
					return {
						success: false,
						code: this.StatusCode.HTTP_BAD_REQUEST,
						message: "Service schedule is required",
					};
				}
			}

			if (service_schedule && service_schedule.length) {
				for (const schedule of service_schedule) {
					if (schedule.start_time > schedule.end_time) {
						return {
							success: false,
							code: this.StatusCode.HTTP_BAD_REQUEST,
							message: "Start time should be less than end time",
						};
					}
				}
			}

			if (service_pricing && service_pricing.length > 0) {
				const filteredPricing = service_pricing.filter(
					(price: any) => price.id === null
				);

				await Promise.all(
					filteredPricing.map((price: any) => {
						let mainPrice = price.price;
						let vatPrice = 0;
						let discount_price = 0;

						if (
							price.discount_percent &&
							price.discount_percent > 0
						) {
							discount_price =
								price.price -
								(price.price * price.discount_percent) / 100;
						}
						let total =
							discount_price > 0
								? discount_price + price.delivery_charge
								: price.price + price.delivery_charge;

						if (price.vat_percent && price.vat_percent > 0) {
							vatPrice = (total * price.vat_percent) / 100;
						}

						// return servicePricingModel.createServicePricing({
						// 	...price,
						// 	hotel_code,
						// 	service_id: id,
						// 	total_price:
						// 		discount_price > 0
						// 			? (discount_price || 0) +
						// 			  (vatPrice || 0) +
						// 			  (price.delivery_charge || 0)
						// 			: mainPrice +
						// 			  (vatPrice || 0) +
						// 			  (price.delivery_charge || 0),
						// 	discount_price,
						// });
					})
				);

				await Promise.all(
					service_pricing
						.filter((price: any) => price.id !== null)
						.map((price: any) => {
							// return servicePricingModel.updateServicePricing({
							// 	where: {
							// 		id: Number(price.id),
							// 		hotel_code,
							// 	},
							// 	payload: price,
							// });
						})
				);
			}

			if (delete_service_pricing_id && delete_service_pricing_id.length) {
				for (const id of delete_service_pricing_id) {
					// await servicePricingModel.updateServicePricing({
					// 	where: {
					// 		id,
					// 		hotel_code,
					// 	},
					// 	payload: {
					// 		is_deleted: true,
					// 	},
					// });
				}
			}

			if (
				delete_service_schedule_id &&
				delete_service_schedule_id.length
			) {
				for (const id of delete_service_schedule_id) {
					await serviceScheduleModel.updateServiceSchedule({
						where: {
							id,
							hotel_code,
						},
						payload: {
							is_deleted: true,
						},
					});
				}
			}

			if (service_schedule && service_schedule.length) {
				const filteredSchedule = service_schedule.filter(
					(schedule: any) => schedule.id === null
				);

				await Promise.all(
					filteredSchedule.map((schedule: any) => {
						return serviceScheduleModel.addServiceSchedule({
							...schedule,
							hotel_code,
							service_id: id,
						});
					})
				);
				await Promise.all(
					service_schedule
						.filter((schedule: any) => schedule.id !== null)
						.map((schedule: any) => {
							return serviceScheduleModel.updateServiceSchedule({
								where: {
									id: Number(schedule.id),
									hotel_code,
								},
								payload: schedule,
							});
						})
				);
			}

			if (services) {
				await serviceModel.updateService({
					payload: services,
					where: {
						id: Number(id),
						hotel_code,
					},
				});
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Service has been updated successfully!",
			};
		});
	}
}
export default ServiceService;
