import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { newResutaurantUserAccount } from "../../templates/restaurantCredential.template";
import Lib from "../../utils/lib/lib";
import { OTP_FOR_CREDENTIALS } from "../../utils/miscellaneous/constants";
import {
	ICreateRestaurantRequest,
	IUpdateRestaurantPayload,
	IUpdateRestaurantUserAdminPayload,
} from "../utlis/interfaces/restaurant.hotel.interface";

class HotelRestaurantService extends AbstractServices {
	constructor() {
		super();
	}

	public async createRestaurant(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id: admin_id } = req.hotel_admin;
			const { user, restaurant } = req.body as ICreateRestaurantRequest;

			const files = req.files as Express.Multer.File[];

			for (const { fieldname, filename } of files) {
				switch (fieldname) {
					case "restaurant_photo":
						restaurant.photo = filename;
						break;
					case "user_photo":
						user.photo = filename;
						break;
					default:
						break;
				}
			}

			const restaurantModel = this.restaurantModel.restaurantModel(trx);
			const restaurantAdminModel =
				this.restaurantModel.restaurantAdminModel(trx);

			const checkRestaurant = await restaurantModel.getAllRestaurant({
				hotel_code,
			});

			let emailExists = false;
			let nameExists = false;

			if (checkRestaurant && checkRestaurant.data) {
				emailExists = checkRestaurant.data.some(
					(res: any) => res.email === restaurant.email
				);
				nameExists = checkRestaurant.data.some(
					(res: any) => res.name === restaurant.name
				);

				if (emailExists) {
					return {
						success: false,
						code: this.StatusCode.HTTP_CONFLICT,
						message:
							"Restaurant Email already exists with this hotel.",
					};
				}

				if (nameExists) {
					return {
						success: false,
						code: this.StatusCode.HTTP_CONFLICT,
						message:
							"Restaurant name already exists with this hotel.",
					};
				}
			}

			const adminEmailExists =
				await restaurantAdminModel.getAllRestaurantAdminEmail({
					email: user.email,
					hotel_code,
				});

			if (adminEmailExists) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message:
						"Restaurant Admin's email already exists with this hotel.",
				};
			}
			const hashPass = await Lib.hashPass(user.password);

			const [newRestaurant] = await restaurantModel.createRestaurant({
				...restaurant,
				hotel_code,
				created_by: admin_id,
			});

			//! Need to check the role and permission before creating the admin user & restaurant.

			await restaurantAdminModel.createRestaurantAdmin({
				restaurant_id: newRestaurant.id,
				hotel_code,
				email: user.email,
				name: user.name,
				photo: user.photo,
				phone: user.phone,
				role_id: user.role,
				password: hashPass,
				created_by: admin_id,
				owner: true,
			});

			await Lib.sendEmail(
				user.email,
				OTP_FOR_CREDENTIALS,
				newResutaurantUserAccount(user.email, user.password, user.name)
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Restaurant created successfully.",
			};
		});
	}

	public async getAllRestaurant(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const { limit, skip, key } = req.query;

			const { data, total } = await this.restaurantModel
				.restaurantModel(trx)
				.getAllRestaurant({
					key: key as string,
					limit: limit as string,
					skip: skip as string,
					hotel_code,
				});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				total,
				data,
			};
		});
	}

	public async getRestaurantWithAdmin(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { id } = req.params;

		const data = await this.restaurantModel
			.restaurantModel()
			.getRestaurantWithAdmin({
				restaurant_id: parseInt(id),
				hotel_code,
			});

		if (!data) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: "Restaurant not found",
			};
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async updateHotelRestaurantAndAdmin(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const { id } = req.params;

			let {
				user = {} as IUpdateRestaurantUserAdminPayload,
				restaurant = {} as IUpdateRestaurantPayload,
			} = req.body;

			const restaurantModel = this.restaurantModel.restaurantModel(trx);
			const restaurantAdminModel =
				this.restaurantModel.restaurantAdminModel(trx);

			const files = (req.files as Express.Multer.File[]) || [];
			for (const { fieldname, filename } of files) {
				if (fieldname === "restaurant_photo")
					restaurant.photo = filename;
				if (fieldname === "user_photo") user.photo = filename;
			}

			const checkRestaurant =
				await restaurantModel.getRestaurantWithAdmin({
					restaurant_id: Number(id),
					hotel_code,
				});

			if (!checkRestaurant) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Restaurant not found",
				};
			}

			if (user?.email && user.email !== checkRestaurant.admin_email) {
				const emailExists =
					await restaurantAdminModel.getAllRestaurantAdminEmail({
						email: user.email,
						hotel_code,
					});
				if (emailExists) {
					return {
						success: false,
						code: this.StatusCode.HTTP_CONFLICT,
						message:
							"Restaurant Admin's email already exists with this hotel.",
					};
				}
			}

			const keep = <T>(val: T | undefined, fallback: T) =>
				val ?? fallback;

			const updatedRestaurant = {
				name: keep(restaurant?.name, checkRestaurant.name),
				email: keep(restaurant?.email, checkRestaurant.email),
				phone: keep(restaurant?.phone, checkRestaurant.phone),
				photo: keep(restaurant?.photo, checkRestaurant.photo),
				address: keep(restaurant?.address, checkRestaurant.address),
				city: keep(restaurant?.city, checkRestaurant.city),
				country: keep(restaurant?.country, checkRestaurant.country),
				bin_no: keep(restaurant?.bin_no, checkRestaurant.bin_no),
				status: keep(restaurant?.status, checkRestaurant.status),
			};

			const updatedAdmin = {
				name: keep(user?.name, checkRestaurant.name),
				email: keep(user?.email, checkRestaurant.email),
				phone: keep(user?.phone, checkRestaurant.phone),
				photo: keep(user?.photo, checkRestaurant.photo),
			};

			await restaurantModel.updateRestaurant({
				id: Number(id),
				payload: updatedRestaurant,
			});

			await restaurantAdminModel.updateRestaurantAdmin({
				id: checkRestaurant.admin_id,
				payload: updatedAdmin,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Restaurant updated successfully",
			};
		});
	}
}
export default HotelRestaurantService;
