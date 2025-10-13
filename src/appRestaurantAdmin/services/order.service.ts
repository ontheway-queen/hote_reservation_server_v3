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
import { HelperFunction } from "../../appAdmin/utlis/library/helperFunction";

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

      const grand_total = gross_amount;

      // -------------- Double Entry Accounting -----------------

      const helper = new HelperFunction();
      const hotelModel = this.Model.HotelModel(trx);
      const accountModel = this.Model.accountModel(trx);
      const today = new Date().toISOString();

      const heads = await hotelModel.getHotelAccConfig(hotel_code, [
        "RECEIVABLE_HEAD_ID",
        "RESTAURANT_REVENUE_HEAD_ID",
      ]);

      console.log({ heads, hotel_code });

      const receivable_head = heads.find(
        (h) => h.config === "RECEIVABLE_HEAD_ID"
      );

      if (!receivable_head) {
        throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
      }

      const sales_head = heads.find(
        (h) => h.config === "RESTAURANT_REVENUE_HEAD_ID"
      );
      if (!sales_head) {
        throw new Error(
          "RESTAURANT_REVENUE_HEAD_ID not configured for this hotel"
        );
      }
      const voucher_no1 = await helper.generateVoucherNo("JV", trx);

      const voucherRes = await accountModel.insertAccVoucher([
        {
          acc_head_id: receivable_head.head_id,
          created_by: id,
          debit: grand_total,
          credit: 0,
          description: `Receivable for order ${orderNo}`,
          voucher_date: today,
          voucher_no: voucher_no1,
          hotel_code,
        },
        {
          acc_head_id: sales_head.head_id,
          created_by: id,
          debit: 0,
          credit: grand_total,
          description: `Sales for order ${orderNo}`,
          voucher_date: today,
          voucher_no: voucher_no1,
          hotel_code,
        },
      ]);
      // ------------------ End ---------------------//

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
        discount_amount: discountAmount,
        service_charge_amount: serviceChargeAmount,
        vat_amount: vatAmount,
        credit_voucher_id: voucherRes[0].id + 1,
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
            debit_voucher_id: voucherRes[0].id,
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
      const { payable_amount, acc_id, room_id, pay_with, booking_id } =
        req.body as unknown as {
          payable_amount: number;
          acc_id?: number;
          booking_id?: number;
          room_id?: number;
          pay_with: "by_booking" | "by_room" | "instant";
        };

      if (payable_amount <= 0) {
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

      const accModel = this.Model.accountModel(trx);
      const reservationModel = this.Model.reservationModel(trx);

      const hotelInvModel = this.Model.hotelInvoiceModel(trx);

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

      if (Number(isOrderExists.grand_total) > Number(payable_amount)) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Insufficient payment. Please provide the full amount.",
        };
      }
      const { order_no } = isOrderExists;
      const changeable_amount =
        Number(payable_amount) - Number(isOrderExists.grand_total);

      if (pay_with === "instant") {
        if (!acc_id) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: "You have not give account",
          };
        }
        //check single account
        const [acc] = await accModel.getSingleAccount({
          hotel_code,
          id: acc_id as number,
        });

        if (!acc) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Invalid Account",
          };
        }

        await restaurantOrderModel.completeOrderPayment(
          {
            id: parseInt(id),
          },
          {
            payable_amount,
            changeable_amount,
            is_paid: true,
            ac_tr_ac_id: acc_id as number,
            status: "completed",
          }
        );

        await restaurantTableModel.updateTable({
          id: isOrderExists.table_id,
          payload: {
            status: "available",
          },
        });
      } else if (pay_with === "by_booking") {
        if (!booking_id) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: "Please give booking ID",
          };
        }

        const getSingleBooking = await reservationModel.getSingleBooking(
          hotel_code,
          booking_id
        );

        if (!getSingleBooking) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Invalid booking",
          };
        }

        const { status: booking_status, guest_id } = getSingleBooking;

        if (booking_status !== "checked_in") {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message:
              "You cannot pay with the booking ID because the guest has not checked in yet.",
          };
        }

        // create new folio
        const folioNo = `FR-${order_no}`;

        const [folio] = await hotelInvModel.insertInFolio({
          booking_id,
          folio_number: folioNo,
          guest_id,
          hotel_code,
          name: `Folio-${order_no}`,
          status: "open",
          type: "Primary",
        });

        await hotelInvModel.insertInFolioEntries([
          {
            folio_id: folio.id,
            posting_type: "RESTAURANT_CHARGE",
            debit: payable_amount,
            description: "Charged for restaurant order",
          },
        ]);

        await restaurantOrderModel.completeOrderPayment(
          {
            id: parseInt(id),
          },
          {
            payable_amount,
            changeable_amount,
            is_paid: true,
            ac_tr_ac_id: acc_id as number,
            status: "completed",
          }
        );

        await restaurantTableModel.updateTable({
          id: isOrderExists.table_id,
          payload: {
            status: "available",
          },
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Order paid successfully.",
        // changeable_amount,
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

      console.log({ sub_total, discountAmount });
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
      const grand_total = gross_amount;

      //_____________________ delete order items _______________________
      await restaurantOrderModel.deleteOrderItems({
        order_id: Number(order_id),
      });

      // ________________________ Accounting ___________________________

      const helper = new HelperFunction();
      const hotelModel = this.Model.HotelModel(trx);
      const accountModel = this.Model.accountModel(trx);
      const today = new Date().toISOString();

      const heads = await hotelModel.getHotelAccConfig(hotel_code, [
        "RECEIVABLE_HEAD_ID",
        "RESTAURANT_REVENUE_HEAD_ID",
      ]);

      console.log({ heads, hotel_code });

      const receivable_head = heads.find(
        (h) => h.config === "RECEIVABLE_HEAD_ID"
      );

      if (!receivable_head) {
        throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
      }

      const sales_head = heads.find(
        (h) => h.config === "RESTAURANT_REVENUE_HEAD_ID"
      );
      if (!sales_head) {
        throw new Error(
          "RESTAURANT_REVENUE_HEAD_ID not configured for this hotel"
        );
      }
      const voucher_no1 = await helper.generateVoucherNo("JV", trx);

      const voucherRes = await accountModel.insertAccVoucher([
        {
          acc_head_id: receivable_head.head_id,
          created_by: id,
          debit: grand_total,
          credit: 0,
          description: `Receivable for order ${existingOrder.order_no}`,
          voucher_date: today,
          voucher_no: voucher_no1,
          hotel_code,
        },
        {
          acc_head_id: sales_head.head_id,
          created_by: id,
          debit: 0,
          credit: grand_total,
          description: `Sales for order ${existingOrder.order_no}`,
          voucher_date: today,
          voucher_no: voucher_no1,
          hotel_code,
        },
      ]);

      // ________________________ Accounting END ___________________________
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
          discount_amount: discountAmount,
          service_charge_amount: serviceChargeAmount,
          vat_amount: vatAmount,
          credit_voucher_id: voucherRes[0].id,
        },
      });

      // delete existing order items
      if (order_items && order_items.length > 0) {
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
            debit_voucher_id: voucherRes[1].id,
          };
        });

        await restaurantOrderModel.createOrderItems(order_items_payload);
      }

      // update accounts voucher

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Order updated successfully.",
      };
    });
  }
}

export default RestaurantOrderService;
