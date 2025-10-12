import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import CustomError from "../../utils/lib/customEror";
import Lib from "../../utils/lib/lib";
import {
  IOrderRequest,
  IUpdateOrderRequest,
} from "../utils/interface/order.interface";
import { body } from "express-validator";
import { IGetFoods } from "../utils/interface/food.interface";

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
      const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);

      const { data } = await restaurantTableModel.getTables({
        id: rest.table_id,
        hotel_code,
        restaurant_id,
      });

      if (data.length > 0 && data[0].status === "booked") {
        // throw new CustomError(
        //   "Table is already booked",
        //   this.StatusCode.HTTP_CONFLICT
        // );

        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Table is already booked",
        };
      } else if (data.length === 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Table not found",
        };
      }

      const orderNo = await Lib.generateOrderNo(trx, hotel_code, restaurant_id);

      let sub_total = 0;

      // food validation

      const foodIds = order_items.map((item) => item.food_id);
      const uniqueFoodIds = Array.from(new Set(foodIds));

      if (uniqueFoodIds.length !== order_items.length) {
        throw new CustomError(
          "Duplicate food items found in the order.",
          this.StatusCode.HTTP_BAD_REQUEST
        );
      }

      // get food and calculate sub_total
      const foodItems = await restaurantFoodModel.getFoods({
        hotel_code,
        restaurant_id,
        food_ids: uniqueFoodIds,
      });

      if (foodItems.data.length !== uniqueFoodIds.length) {
        throw new CustomError(
          "One or more food items not found.",
          this.StatusCode.HTTP_NOT_FOUND
        );
      }

      // calculate sub_total and grand total
      foodItems.data.forEach((food) => {
        const item = order_items.find((i) => i.food_id === food.id);
        if (item) {
          sub_total += Number(item.quantity) * Number(food.retail_price);
        }
      });

      const discountAmount = Lib.calculatePercentageToAmount(
        sub_total,
        rest.discount,
        rest.discount_type
      );

      let gross_amount = sub_total - discountAmount;

      const serviceChargeAmount = Lib.calculatePercentageToAmount(
        gross_amount,
        rest.service_charge,
        rest.service_charge_type
      );

      gross_amount += serviceChargeAmount;

      const vatAmount = Lib.calculatePercentageToAmount(
        gross_amount,
        rest.vat,
        rest.vat_type
      );

      gross_amount += vatAmount;

      const grand_total = gross_amount - discountAmount;

      const [newOrder] = await restaurantOrderModel.createOrder({
        hotel_code,
        restaurant_id,
        order_no: orderNo,
        created_by: id,
        table_id: rest.table_id,
        order_type: rest.order_type,
        guest_name: rest.guest_name,
        sub_total: sub_total,
        discount: rest.discount,
        discount_type: rest.discount_type,
        service_charge: rest.service_charge,
        service_charge_type: rest.service_charge_type,
        vat: rest.vat,
        vat_type: rest.vat_type,
        grand_total: grand_total,
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
            total: Number(item.quantity) * Number(food.data[0].retail_price),
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

    const data = await this.restaurantModel.restaurantOrderModel().getOrders({
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
        code: this.StatusCode.HTTP_OK,
        data: {},
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
          message: "Invalid amount. Please provide a valid payment amount.",
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

      if (Number(isOrderExists.grand_total) > Number(body.payable_amount)) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Insufficient payment. Please provide the full amount.",
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
        message: "Your order has been cooked to perfection and is ready!",
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

      const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);

      const existingOrder = await restaurantOrderModel.getOrderById({
        id: Number(order_id),
        hotel_code,
        restaurant_id,
      });
      if (!existingOrder) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Order not found",
        };
      }

      // again caluculate sub_total, grand_total
      let sub_total = 0;

      let foodItemsCopy: IGetFoods[] = [];
      if (order_items && order_items.length > 0) {
        const foodIds = order_items.map((item) => item.food_id);
        const uniqueFoodIds = Array.from(new Set(foodIds));
        if (uniqueFoodIds.length !== order_items.length) {
          throw new CustomError(
            "Duplicate food items found in the order.",
            this.StatusCode.HTTP_BAD_REQUEST
          );
        }

        // get food and calculate sub_total
        const foodItems = await restaurantFoodModel.getFoods({
          hotel_code,
          restaurant_id,
          food_ids: uniqueFoodIds,
        });

        if (foodItems.data.length !== uniqueFoodIds.length) {
          throw new CustomError(
            "One or more food items not found.",
            this.StatusCode.HTTP_NOT_FOUND
          );
        }
        foodItemsCopy = foodItems.data;
        // calculate sub_total and grand total
        foodItems.data.forEach((food) => {
          const item = order_items.find((i) => i.food_id === food.id);
          if (item) {
            sub_total += Number(item.quantity) * Number(food.retail_price);
          }
        });
      }
      const discountAmount = Lib.calculatePercentageToAmount(
        sub_total,
        rest.discount ?? Number(existingOrder.discount),
        rest.discount_type ??
          (existingOrder.discount_type as "percentage" | "fixed")
      );
      let gross_amount = sub_total - discountAmount;

      const serviceChargeAmount = Lib.calculatePercentageToAmount(
        gross_amount,
        rest.service_charge ?? Number(existingOrder.service_charge),
        rest.service_charge_type ??
          (existingOrder.service_charge_type as "percentage" | "fixed")
      );
      gross_amount += serviceChargeAmount;

      const vatAmount = Lib.calculatePercentageToAmount(
        gross_amount,
        rest.vat ?? Number(existingOrder.vat),
        rest.vat_type ?? (existingOrder.vat_type as "percentage" | "fixed")
      );
      gross_amount += vatAmount;
      const grand_total = gross_amount - discountAmount;

      // delete order items\
      await restaurantOrderModel.deleteOrderItems({
        order_id: Number(order_id),
      });

      await restaurantOrderModel.updateOrder({
        id: Number(order_id),
        payload: {
          staff_id: rest.staff_id,
          order_type: rest.order_type,
          guest_name: rest.guest_name,
          table_id: rest.table_id,
          sub_total: sub_total,
          discount: rest.discount ?? Number(existingOrder.discount),
          discount_type:
            rest.discount_type ??
            (existingOrder.discount_type as "percentage" | "fixed"),
          service_charge:
            rest.service_charge ?? Number(existingOrder.service_charge),
          grand_total: grand_total,
          service_charge_type:
            rest.service_charge_type ??
            (existingOrder.service_charge_type as "percentage" | "fixed"),
          vat: rest.vat ?? Number(existingOrder.vat),
          vat_type:
            rest.vat_type ?? (existingOrder.vat_type as "percentage" | "fixed"),
          room_no: rest.room_no,
          kitchen_status: rest.kitchen_status,
          updated_by: id,
        },
      });

      // delete existing order items
      if (order_items && order_items.length > 0) {
        //  await Promise.all(
        //    order_items.map(async (item) => {
        //      const food = await restaurantFoodModel.getFoods({
        //        id: item.food_id,
        //        hotel_code,
        //        restaurant_id,
        //      });

        //      await restaurantOrderModel.createOrderItems({
        //        order_id: Number(order_id),
        //        food_id: item.food_id,
        //        name: food.data[0].name,
        //        rate: Number(food.data[0].retail_price),
        //        quantity: Number(item.quantity),
        //        total:
        //          Number(item.quantity) * Number(food.data[0].retail_price),
        //      });
        //    })
        //  );

        // order items payload then insert
        const order_items_payload = order_items.map((item) => {
          const food = foodItemsCopy.find((f) => f.id === item.food_id);
          return {
            order_id: Number(order_id),
            food_id: item.food_id,
            name: food?.name as string,
            rate: Number(food?.retail_price) || 0,
            quantity: Number(item.quantity),
            total: Number(item.quantity) * (Number(food?.retail_price) || 0),
          };
        });

        await restaurantOrderModel.createOrderItems(order_items_payload);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Order updated successfully.",
      };
    });
  }
}

export default RestaurantOrderService;
