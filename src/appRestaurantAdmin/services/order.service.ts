import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import CustomError from "../../utils/lib/customEror";
import Lib from "../../utils/lib/lib";
import {
	IOrderRequest,
	IUpdateOrderRequest,
} from "../utils/interface/order.interface";

class RestaurantOrderService extends AbstractServices {
	constructor() {
		super();
	}

	public async createOrder(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id, restaurant_id, hotel_code } = req.restaurant_admin;
			const { order_items, ...rest } = req.body as IOrderRequest;

			const restaurantTableModel =
				this.restaurantModel.restaurantTableModel(trx);
			const restaurantOrderModel =
				this.restaurantModel.restaurantOrderModel(trx);
			const restaurantFoodModel =
				this.restaurantModel.restaurantFoodModel(trx);

			const { data } = await restaurantTableModel.getTables({
				id: rest.table_id,
				hotel_code,
				restaurant_id,
			});
			if (data.length > 0 && data[0].status === "booked") {
				throw new CustomError(
					"Table is already booked",
					this.StatusCode.HTTP_CONFLICT
				);
			} else if (data.length === 0) {
				throw new CustomError(
					"Table not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const orderNo = await Lib.generateOrderNo(
				trx,
				hotel_code,
				restaurant_id
			);

			let sub_total = 0;
			let grand_Total = 0;
			let vat_amount = 0;
			let net_total = 0;

			for (const item of order_items) {
				const food = await restaurantFoodModel.getFoods({
					id: item.food_id,
					hotel_code,
					restaurant_id,
				});

				if (!food.data.length) {
					throw new CustomError(
						"Food not found",
						this.StatusCode.HTTP_NOT_FOUND
					);
				}

				sub_total +=
					Number(item.quantity) * Number(food.data[0].retail_price);
			}

			net_total = Lib.adjustPercentageOrFixedAmount(
				sub_total,
				rest.discount,
				rest.discount_type,
				true
			);

			grand_Total = Lib.adjustPercentageOrFixedAmount(
				net_total,
				rest.service_charge,
				rest.service_charge_type
			);

			if (rest?.vat_rate > 0) {
				vat_amount = (net_total * rest.vat_rate) / 100;
				grand_Total = grand_Total + vat_amount;
			}

			const [newOrder] = await restaurantOrderModel.createOrder({
				hotel_code,
				restaurant_id,
				order_no: orderNo,
				created_by: id,
				table_id: rest.table_id,
				order_type: rest.order_type,
				guest: rest.guest,
				sub_total: sub_total,
				discount: rest.discount,
				discount_type: rest.discount_type,
				net_total: net_total,
				service_charge: rest.service_charge,
				service_charge_type: rest.service_charge_type,
				vat_rate: rest.vat_rate,
				vat_amount: vat_amount,
				grand_total: grand_Total,
				staff_id: rest.staff_id,
				room_no: rest.room_no,
			});

			await Promise.all(
				order_items.map(async (item) => {
					const food = await restaurantFoodModel.getFoods({
						id: item.food_id,
						hotel_code,
						restaurant_id,
					});
					if (!food.data.length) {
						throw new CustomError(
							"Food not found",
							this.StatusCode.HTTP_NOT_FOUND
						);
					}

					await restaurantOrderModel.createOrderItems({
						order_id: newOrder.id,
						food_id: item.food_id,
						name: food.data[0].name,
						rate: Number(food.data[0].retail_price),
						quantity: Number(item.quantity),
						total:
							Number(item.quantity) *
							Number(food.data[0].retail_price),
					});
				})
			);

			await restaurantTableModel.updateTable({
				id: rest.table_id,
				payload: {
					status: "booked",
				},
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Order Confirmed Successfully.",
				data: { id: newOrder.id },
			};
		});
	}

	public async getOrders(req: Request) {
		const { restaurant_id, hotel_code } = req.restaurant_admin;

		const {
			limit,
			skip,
			table_id,
			from_date,
			to_date,
			order_type,
			kitchen_status,
			status,
		} = req.query;

		const data = await this.restaurantModel
			.restaurantOrderModel()
			.getOrders({
				limit: Number(limit),
				skip: Number(skip),
				hotel_code,
				restaurant_id,
				table_id: Number(table_id),
				from_date: from_date as string,
				to_date: to_date as string,
				order_type: order_type as string,
				kitchen_status: kitchen_status as string,
				status: status as string,
			});

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			...data,
		};
	}

	public async getOrderById(req: Request) {
		const { id } = req.params;
		const { restaurant_id, hotel_code } = req.restaurant_admin;

		const data = await this.restaurantModel
			.restaurantOrderModel()
			.getOrderById({
				hotel_code,
				restaurant_id,
				id: Number(id),
			});

		if (!data) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: "Order not found.",
			};
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			data,
		};
	}

	public async getOrdersByTableId(req: Request) {
		const { table_id } = req.params;
		const { restaurant_id, hotel_code } = req.restaurant_admin;

		const data = await this.restaurantModel
			.restaurantOrderModel()
			.getOrderById({
				hotel_code,
				restaurant_id,
				table_id: Number(table_id),
			});

		if (!data) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: "Order not found.",
			};
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			data,
		};
	}

	public async cancelOrder(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;

			const restaurantOrderModel =
				this.restaurantModel.restaurantOrderModel(trx);

			const restaurantTableModel =
				this.restaurantModel.restaurantTableModel(trx);

			const isOrderExists = await restaurantOrderModel.getOrderById({
				hotel_code,
				restaurant_id,
				id: parseInt(id),
			});

			if (!isOrderExists) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Order not found.",
				};
			}

			await restaurantOrderModel.cancelOrder({
				id: parseInt(id),
			});

			await restaurantTableModel.updateTable({
				id: isOrderExists.table_id,
				payload: {
					status: "available",
				},
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Order canceled successfully.",
			};
		});
	}

	public async completeOrderPayment(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;
			const body = req.body as unknown as { payable_amount: number };

			if (body.payable_amount <= 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message:
						"Invalid amount. Please provide a valid payment amount.",
				};
			}

			const restaurantOrderModel =
				this.restaurantModel.restaurantOrderModel(trx);

			const restaurantTableModel =
				this.restaurantModel.restaurantTableModel(trx);

			const isOrderExists = await restaurantOrderModel.getOrderById({
				hotel_code,
				restaurant_id,
				id: parseInt(id),
			});

			if (!isOrderExists) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Order not found.",
				};
			}

			if (isOrderExists.is_paid === true) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Order already paid.",
				};
			}

			if (
				Number(isOrderExists.grand_total) > Number(body.payable_amount)
			) {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message:
						"Insufficient payment. Please provide the full amount.",
				};
			}

			const changeable_amount =
				Number(body.payable_amount) - Number(isOrderExists.grand_total);

			await restaurantOrderModel.completeOrderPayment(
				{
					id: parseInt(id),
				},
				{
					payable_amount: body.payable_amount,
					changeable_amount,
					is_paid: true,
					status: "completed",
				}
			);

			await restaurantTableModel.updateTable({
				id: isOrderExists.table_id,
				payload: {
					status: "available",
				},
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Order paid successfully.",
			};
		});
	}

	public async getKitchenOrders(req: Request) {
		const { restaurant_id, hotel_code } = req.restaurant_admin;
		const { limit, skip, order_no } = req.query;

		const data = await this.restaurantModel
			.restaurantOrderModel()
			.getKitchenOrders({
				limit: Number(limit),
				skip: Number(skip),
				hotel_code,
				restaurant_id,
				order_no: order_no as string,
			});

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			...data,
		};
	}

	public async updateKitchenOrders(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;

			const restaurantOrderModel =
				this.restaurantModel.restaurantOrderModel(trx);

			const isOrderExists = await restaurantOrderModel.getOrderById({
				hotel_code,
				restaurant_id,
				id: parseInt(id),
			});

			if (!isOrderExists) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Order not found.",
				};
			}

			if (isOrderExists.kitchen_status === "completed") {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Order already completed.",
				};
			}

			await restaurantOrderModel.updateOrder({
				id: parseInt(id),
				payload: { kitchen_status: "completed" },
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message:
					"Your order has been cooked to perfection and is ready!",
			};
		});
	}

	public async updateOrder(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id, restaurant_id, hotel_code } = req.restaurant_admin;
			const { id: order_id } = req.params;
			const { order_items, ...rest } = req.body as IUpdateOrderRequest;

			const restaurantOrderModel =
				this.restaurantModel.restaurantOrderModel(trx);

			const restaurantFoodModel =
				this.restaurantModel.restaurantFoodModel(trx);

			const existingOrder = await restaurantOrderModel.getOrderById({
				id: Number(order_id),
				hotel_code,
				restaurant_id,
			});
			if (!existingOrder) {
				throw new CustomError(
					"Order not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			let sub_total = 0;
			let grand_Total = 0;
			let vat_amount = 0;
			let net_total = 0;

			if (order_items?.length) {
				for (const item of order_items) {
					const food = await restaurantFoodModel.getFoods({
						id: item.food_id,
						hotel_code,
						restaurant_id,
					});

					if (!food.data.length) {
						throw new CustomError(
							`Food with ID ${item.food_id} not found`,
							this.StatusCode.HTTP_NOT_FOUND
						);
					}

					sub_total +=
						Number(item.quantity) *
						Number(food.data[0].retail_price);
				}

				net_total = Lib.adjustPercentageOrFixedAmount(
					sub_total,
					rest.discount,
					rest.discount_type,
					true
				);

				grand_Total = Lib.adjustPercentageOrFixedAmount(
					net_total,
					rest.service_charge,
					rest.service_charge_type
				);

				if (rest.vat_rate && rest?.vat_rate > 0) {
					vat_amount = (net_total * rest.vat_rate) / 100;
					grand_Total = net_total + vat_amount;
				}
			} else {
				net_total = Number(existingOrder.net_total);
				sub_total = Number(existingOrder.sub_total);
				vat_amount = Number(existingOrder.vat_amount);
				grand_Total = Number(existingOrder.grand_total);
			}

			const updatedOrder = await restaurantOrderModel.updateOrder({
				id: Number(order_id),
				payload: {
					order_type: rest.order_type ?? existingOrder.order_type,
					guest: rest.guest ?? existingOrder.guest,
					table_id: rest.table_id ?? existingOrder.table_id,
					staff_id: rest.staff_id ?? existingOrder.staff_id,
					room_no: rest.room_no ?? existingOrder.room_no,
					discount: rest.discount ?? Number(existingOrder.discount),
					discount_type:
						rest.discount_type ?? existingOrder.discount_type,
					service_charge:
						rest.service_charge ??
						Number(existingOrder.service_charge),
					service_charge_type:
						rest.service_charge_type ??
						existingOrder.service_charge_type,
					vat_rate: rest.vat_rate ?? Number(existingOrder.vat_rate),
					vat_amount,
					net_total: net_total,
					sub_total,
					grand_total: grand_Total,
					updated_by: id,
				},
			});

			if (order_items?.length) {
				await restaurantOrderModel.deleteOrderItems({
					order_id: Number(order_id),
				});

				await Promise.all(
					order_items.map(async (item) => {
						const food = await restaurantFoodModel.getFoods({
							id: item.food_id,
							hotel_code,
							restaurant_id,
						});
						if (!food.data.length) {
							throw new CustomError(
								`Food with ID ${item.food_id} not found`,
								this.StatusCode.HTTP_NOT_FOUND
							);
						}

						await restaurantOrderModel.createOrderItems({
							order_id: Number(order_id),
							food_id: item.food_id,
							name: food.data[0].name,
							rate: Number(food.data[0].retail_price),
							quantity: Number(item.quantity),
							total:
								Number(item.quantity) *
								Number(food.data[0].retail_price),
						});
					})
				);
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Order updated successfully.",
				data: { id: updatedOrder[0].id },
			};
		});
	}
}

export default RestaurantOrderService;
