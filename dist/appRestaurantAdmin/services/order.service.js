"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
const lib_1 = __importDefault(require("../../utils/lib/lib"));
class RestaurantOrderService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, restaurant_id, hotel_code } = req.restaurant_admin;
                const _a = req.body, { order_items, customer_name, customer_phone, order_type, booking_id } = _a, rest = __rest(_a, ["order_items", "customer_name", "customer_phone", "order_type", "booking_id"]);
                const restaurantTableModel = this.restaurantModel.restaurantTableModel(trx);
                const restaurantOrderModel = this.restaurantModel.restaurantOrderModel(trx);
                const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
                const hotelInventoryModel = this.Model.inventoryModel(trx);
                const { data } = yield restaurantTableModel.getTables({
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
                }
                else if (data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Table not found",
                    };
                }
                const orderNo = yield lib_1.default.generateOrderNo(trx, hotel_code, restaurant_id);
                let sub_total = 0;
                // food validation
                const foodIds = order_items.map((item) => item.food_id);
                const uniqueFoodIds = Array.from(new Set(foodIds));
                if (uniqueFoodIds.length !== order_items.length) {
                    throw new customEror_1.default("Duplicate food items found in the order.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                // get food and calculate sub_total
                const foodItems = yield restaurantFoodModel.getFoods({
                    hotel_code,
                    restaurant_id,
                    food_ids: uniqueFoodIds,
                });
                if (foodItems.data.length !== uniqueFoodIds.length) {
                    throw new customEror_1.default("One or more food items not found.", this.StatusCode.HTTP_NOT_FOUND);
                }
                // check and update ingredient stock
                for (const item of order_items) {
                    const food = foodItems.data.find((f) => f.id === item.food_id);
                    if (!food) {
                        throw new customEror_1.default(`Food item with ID ${item.food_id} not found.`, this.StatusCode.HTTP_NOT_FOUND);
                    }
                    if (food.recipe_type === "ingredients") {
                        const foodReceipe = yield restaurantFoodModel.getFoodIngredients({
                            food_id: item.food_id,
                        });
                        for (const recipe of foodReceipe) {
                            const requiredQuantity = Number(recipe.quantity_per_unit) * Number(item.quantity);
                            console.log(requiredQuantity, "rq");
                            const inventoryItem = yield hotelInventoryModel.getSingleInventoryDetails({
                                hotel_code,
                                product_id: recipe.product_id,
                            });
                            console.log({ inventoryItem });
                            // if (!inventoryItem) {
                            //   throw new CustomError(
                            //     `Inventory item with ID ${recipe.id} not found for food ID ${item.food_id}.`,
                            //     this.StatusCode.HTTP_NOT_FOUND
                            //   );
                            // }
                            // if (Number(inventoryItem.available_quantity) < requiredQuantity) {
                            //   throw new CustomError(
                            //     `Insufficient stock for inventory item ID ${recipe.id} required for food ID ${item.food_id}.`,
                            //     this.StatusCode.HTTP_CONFLICT
                            //   );
                            // }
                            // update inventory stock
                            const newUsedQuantity = Number((inventoryItem === null || inventoryItem === void 0 ? void 0 : inventoryItem.quantity_used) || 0) + requiredQuantity;
                            if (!inventoryItem) {
                                // insert inventory if not found
                                yield hotelInventoryModel.insertInInventory([
                                    {
                                        hotel_code,
                                        product_id: recipe.product_id,
                                        quantity_used: 0,
                                        quantity: 0,
                                    },
                                ]);
                            }
                            yield hotelInventoryModel.updateInInventory({
                                quantity_used: newUsedQuantity,
                            }, {
                                product_id: recipe.product_id,
                            });
                        }
                    }
                    else if (food.recipe_type === "non-ingredients") {
                        // stock deduction for non-ingredients type
                        const inventoryItem = yield restaurantFoodModel.getSingleStockWithFoodAndDate({
                            hotel_code,
                            restaurant_id,
                            food_id: item.food_id,
                            stock_date: new Date().toISOString().split("T")[0],
                        });
                        if (!inventoryItem) {
                            throw new customEror_1.default(`Inventory item not found for food ID ${item.food_id}.`, this.StatusCode.HTTP_NOT_FOUND);
                        }
                        if (Number(inventoryItem.quantity) < Number(item.quantity)) {
                            throw new customEror_1.default(`Insufficient stock for food ID ${item.food_id}.`, this.StatusCode.HTTP_CONFLICT);
                        }
                        const newQuantity = Number(inventoryItem.sold_quantity) + Number(item.quantity);
                        yield restaurantFoodModel.updateStocks({
                            where: {
                                food_id: inventoryItem.food_id,
                                stock_date: new Date().toISOString().split("T")[0],
                            },
                            payload: { sold_quantity: newQuantity },
                        });
                    }
                }
                // await Lib.checkAndUpdateIngredientStock({
                //   trx,
                //   hotel_code,
                //   restaurant_id,
                //   type: "create",
                //   order_items,
                // });
                // calculate sub_total and grand total
                foodItems.data.forEach((food) => {
                    const item = order_items.find((i) => i.food_id === food.id);
                    if (item) {
                        sub_total += Number(item.quantity) * Number(food.retail_price);
                    }
                });
                const discountAmount = lib_1.default.calculatePercentageToAmount(sub_total, rest.discount, rest.discount_type);
                let gross_amount = sub_total - discountAmount;
                const serviceChargeAmount = lib_1.default.calculatePercentageToAmount(gross_amount, rest.service_charge, rest.service_charge_type);
                gross_amount += serviceChargeAmount;
                const vatAmount = lib_1.default.calculatePercentageToAmount(gross_amount, rest.vat, rest.vat_type);
                gross_amount += vatAmount;
                const grand_total = gross_amount;
                // -------------- Double Entry Accounting -----------------
                // const helper = new HelperFunction();
                // const hotelModel = this.Model.HotelModel(trx);
                // const accountModel = this.Model.accountModel(trx);
                // const today = new Date().toISOString();
                // const heads = await hotelModel.getHotelAccConfig(hotel_code, [
                //   "RECEIVABLE_HEAD_ID",
                //   "RESTAURANT_REVENUE_HEAD_ID",
                // ]);
                // console.log({ heads, hotel_code });
                // const receivable_head = heads.find(
                //   (h) => h.config === "RECEIVABLE_HEAD_ID"
                // );
                // if (!receivable_head) {
                //   throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
                // }
                // const sales_head = heads.find(
                //   (h) => h.config === "RESTAURANT_REVENUE_HEAD_ID"
                // );
                // if (!sales_head) {
                //   throw new Error(
                //     "RESTAURANT_REVENUE_HEAD_ID not configured for this hotel"
                //   );
                // }
                // const voucher_no1 = await helper.generateVoucherNo("JV", trx);
                // const voucherRes = await accountModel.insertAccVoucher([
                //   {
                //     acc_head_id: receivable_head.head_id,
                //     created_by: id,
                //     debit: grand_total,
                //     credit: 0,
                //     description: `Receivable for order ${orderNo}`,
                //     voucher_date: today,
                //     voucher_no: voucher_no1,
                //     hotel_code,
                //   },
                //   {
                //     acc_head_id: sales_head.head_id,
                //     created_by: id,
                //     debit: 0,
                //     credit: grand_total,
                //     description: `Sales for order ${orderNo}`,
                //     voucher_date: today,
                //     voucher_no: voucher_no1,
                //     hotel_code,
                //   },
                // ]);
                // ------------------ End ---------------------//
                let orderId;
                if (order_type === "walk-in") {
                    let customerId;
                    if ((customer_name || customer_phone) &&
                        customer_name &&
                        customer_phone) {
                        const { data: checkCusomer } = yield this.restaurantModel
                            .restaurantModel()
                            .getAllCustomer({
                            contact_no: customer_phone,
                            hotel_code,
                        });
                        if (checkCusomer.length === 0) {
                            const [cus] = yield this.restaurantModel
                                .restaurantModel(trx)
                                .createCustomer({
                                name: customer_name,
                                contact_no: customer_phone,
                                hotel_code,
                            });
                            customerId = cus.id;
                        }
                    }
                    const [newOrder] = yield restaurantOrderModel.createOrder({
                        hotel_code,
                        restaurant_id,
                        order_no: orderNo,
                        created_by: id,
                        table_id: rest.table_id,
                        order_type: order_type,
                        guest_name: customer_name,
                        customer_id: customerId,
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
                        //  credit_voucher_id: voucherRes[0].id + 1,
                    });
                    orderId = newOrder.id;
                    yield Promise.all(order_items.map((item) => __awaiter(this, void 0, void 0, function* () {
                        const food = yield restaurantFoodModel.getFoods({
                            id: item.food_id,
                            hotel_code,
                            restaurant_id,
                        });
                        if (!food.data.length) {
                            throw new customEror_1.default("Food not found", this.StatusCode.HTTP_NOT_FOUND);
                        }
                        yield restaurantOrderModel.createOrderItems({
                            order_id: newOrder.id,
                            food_id: item.food_id,
                            name: food.data[0].name,
                            rate: Number(food.data[0].retail_price),
                            quantity: Number(item.quantity),
                            total: Number(item.quantity) * Number(food.data[0].retail_price),
                            //  debit_voucher_id: voucherRes[0].id,
                        });
                    })));
                }
                else if (order_type === "reservation") {
                    // if (!booking_id) {
                    //   return {
                    //     success: false,
                    //     code: this.StatusCode.HTTP_NOT_FOUND,
                    //     message: "Please give booking ID",
                    //   };
                    // }
                    const [newOrder] = yield restaurantOrderModel.createOrder({
                        hotel_code,
                        booking_id: booking_id,
                        restaurant_id,
                        order_no: orderNo,
                        created_by: id,
                        table_id: rest.table_id,
                        order_type: order_type,
                        guest_name: customer_name,
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
                        //  credit_voucher_id: voucherRes[0].id + 1,
                    });
                    orderId = newOrder.id;
                    yield Promise.all(order_items.map((item) => __awaiter(this, void 0, void 0, function* () {
                        const food = yield restaurantFoodModel.getFoods({
                            id: item.food_id,
                            hotel_code,
                            restaurant_id,
                        });
                        if (!food.data.length) {
                            throw new customEror_1.default("Food not found", this.StatusCode.HTTP_NOT_FOUND);
                        }
                        yield restaurantOrderModel.createOrderItems({
                            order_id: newOrder.id,
                            food_id: item.food_id,
                            name: food.data[0].name,
                            rate: Number(food.data[0].retail_price),
                            quantity: Number(item.quantity),
                            total: Number(item.quantity) * Number(food.data[0].retail_price),
                            //  debit_voucher_id: voucherRes[0].id,
                        });
                    })));
                }
                yield restaurantTableModel.updateTable({
                    id: rest.table_id,
                    payload: {
                        status: "booked",
                    },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Order Confirmed Successfully.",
                    data: { id: orderId },
                };
            }));
        });
    }
    getOrders(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { limit, skip, table_id, from_date, to_date, order_type, kitchen_status, status, } = req.query;
            const data = yield this.restaurantModel.restaurantOrderModel().getOrders({
                limit: Number(limit),
                skip: Number(skip),
                hotel_code,
                restaurant_id,
                table_id: Number(table_id),
                from_date: from_date,
                to_date: to_date,
                order_type: order_type,
                kitchen_status: kitchen_status,
                status: status,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_SUCCESSFUL }, data);
        });
    }
    getOrderById(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const data = yield this.restaurantModel
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
        });
    }
    getOrdersByTableId(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { table_id } = req.params;
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const data = yield this.restaurantModel
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
        });
    }
    cancelOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const restaurantOrderModel = this.restaurantModel.restaurantOrderModel(trx);
                const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
                const restaurantTableModel = this.restaurantModel.restaurantTableModel(trx);
                const hotelInventoryModel = this.Model.inventoryModel(trx);
                //  existing order
                const existingOrder = yield restaurantOrderModel.getOrderById({
                    id: parseInt(id),
                    hotel_code,
                    restaurant_id,
                });
                if (!existingOrder) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Order not found.",
                    };
                }
                const { order_items } = existingOrder;
                // Restore stock/ingredients
                for (const item of order_items) {
                    const food = yield restaurantFoodModel.getFoods({
                        id: item.food_id,
                        hotel_code,
                        restaurant_id,
                    });
                    const f = food.data[0];
                    if (!f)
                        continue;
                    if (f.recipe_type === "ingredients") {
                        const recipes = yield restaurantFoodModel.getFoodIngredients({
                            food_id: item.food_id,
                        });
                        for (const r of recipes) {
                            const restoreQty = Number(r.quantity_per_unit) * Number(item.quantity);
                            const inv = yield hotelInventoryModel.getSingleInventoryDetails({
                                hotel_code,
                                product_id: r.product_id,
                            });
                            if (inv) {
                                const restoredUsed = Number(inv.quantity_used) - restoreQty;
                                yield hotelInventoryModel.updateInInventory({ quantity_used: restoredUsed }, { product_id: r.product_id });
                            }
                        }
                    }
                    else if (f.recipe_type === "non-ingredients") {
                        const stock = yield restaurantFoodModel.getSingleStockWithFoodAndDate({
                            hotel_code,
                            restaurant_id,
                            food_id: f.id,
                            stock_date: new Date().toISOString().split("T")[0],
                        });
                        if (stock) {
                            const restoredQty = Number(stock.sold_quantity) - Number(item.quantity);
                            yield restaurantFoodModel.updateStocks({
                                where: { food_id: stock.food_id, stock_date: stock.stock_date },
                                payload: { sold_quantity: restoredQty },
                            });
                        }
                    }
                }
                // Cancel order in database
                yield restaurantOrderModel.cancelOrder({ id: parseInt(id) });
                // Update table status
                if (existingOrder.table_id) {
                    yield restaurantTableModel.updateTable({
                        id: existingOrder.table_id,
                        payload: { status: "available" },
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Order canceled successfully.",
                };
            }));
        });
    }
    completeOrderPayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const { payable_amount, acc_id, room_id, pay_with, booking_id } = req.body;
                if (payable_amount <= 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid amount. Please provide a valid payment amount.",
                    };
                }
                const restaurantOrderModel = this.restaurantModel.restaurantOrderModel(trx);
                const restaurantTableModel = this.restaurantModel.restaurantTableModel(trx);
                const accModel = this.Model.accountModel(trx);
                const reservationModel = this.Model.reservationModel(trx);
                const hotelInvModel = this.Model.hotelInvoiceModel(trx);
                const isOrderExists = yield restaurantOrderModel.getOrderById({
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
                const changeable_amount = Number(payable_amount) - Number(isOrderExists.grand_total);
                if (pay_with === "reservation") {
                    if (!booking_id) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Please give booking ID",
                        };
                    }
                    const getSingleBooking = yield reservationModel.getSingleBooking(hotel_code, booking_id);
                    if (!getSingleBooking) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Invalid booking",
                        };
                    }
                    const { status: booking_status, guest_id, is_individual_booking, } = getSingleBooking;
                    if (booking_status !== "checked_in") {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "You cannot pay with the booking ID because the guest has not checked in yet.",
                        };
                    }
                    if (room_id) {
                        const [singleRoom] = yield this.Model.RoomModel().getSingleRoom(hotel_code, room_id);
                        if (!singleRoom) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: "Room ID is invalid",
                            };
                        }
                        if (!is_individual_booking) {
                            const roomFolio = yield hotelInvModel.getFolioWithEntriesbySingleBookingAndRoomID({
                                booking_id: booking_id,
                                hotel_code,
                                room_ids: [room_id],
                            });
                            if (!roomFolio.length) {
                                return {
                                    success: false,
                                    code: 404,
                                    message: "Rooms folio not found.",
                                };
                            }
                            yield hotelInvModel.insertInFolioEntries([
                                {
                                    folio_id: roomFolio[0].id,
                                    posting_type: "RESTAURANT_CHARGE",
                                    debit: payable_amount,
                                    description: "Charges for restaurant orders",
                                },
                            ]);
                        }
                        else {
                            const primaryFolio = yield hotelInvModel.getFoliosbySingleBooking({
                                booking_id,
                                hotel_code,
                                type: "Primary",
                            });
                            if (!primaryFolio.length) {
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_NOT_FOUND,
                                    message: "Primary folio not found.",
                                };
                            }
                            yield hotelInvModel.insertInFolioEntries([
                                {
                                    folio_id: primaryFolio[0].id,
                                    posting_type: "RESTAURANT_CHARGE",
                                    debit: payable_amount,
                                    description: "Charges for restaurant orders",
                                },
                            ]);
                        }
                        yield restaurantOrderModel.completeOrderPayment({
                            id: parseInt(id),
                        }, {
                            payable_amount,
                            changeable_amount,
                            is_paid: true,
                            ac_tr_ac_id: acc_id,
                            status: "completed",
                            include_with_hotel_booking: true,
                            booking_id: booking_id,
                            room_id: room_id,
                            booking_ref: getSingleBooking.booking_reference,
                            room_no: singleRoom.room_name,
                        });
                    }
                    else {
                        // create new folio
                        const folioNo = `FR-${order_no}`;
                        const [folio] = yield hotelInvModel.insertInFolio({
                            booking_id,
                            folio_number: folioNo,
                            guest_id,
                            hotel_code,
                            name: `Restaurant-${order_no}`,
                            status: "open",
                            type: "restaurant",
                        });
                        yield hotelInvModel.insertInFolioEntries([
                            {
                                folio_id: folio.id,
                                posting_type: "RESTAURANT_CHARGE",
                                debit: payable_amount,
                                description: "Charges for restaurant orders",
                            },
                        ]);
                        yield restaurantOrderModel.completeOrderPayment({
                            id: parseInt(id),
                        }, {
                            payable_amount,
                            changeable_amount,
                            is_paid: true,
                            ac_tr_ac_id: acc_id,
                            status: "completed",
                            include_with_hotel_booking: true,
                            booking_id: booking_id,
                            room_id: room_id,
                            booking_ref: getSingleBooking.booking_reference,
                        });
                    }
                }
                else {
                    if (!acc_id) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "You have not give account",
                        };
                    }
                    //check single account
                    const [acc] = yield accModel.getSingleAccount({
                        hotel_code,
                        id: acc_id,
                    });
                    if (!acc) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Invalid Account",
                        };
                    }
                    yield restaurantOrderModel.completeOrderPayment({
                        id: parseInt(id),
                    }, {
                        payable_amount,
                        changeable_amount,
                        is_paid: true,
                        ac_tr_ac_id: acc_id,
                        status: "completed",
                    });
                }
                yield restaurantTableModel.updateTable({
                    id: isOrderExists.table_id,
                    payload: {
                        status: "available",
                    },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Order paid successfully.",
                    // changeable_amount,
                };
            }));
        });
    }
    getKitchenOrders(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { limit, skip, order_no } = req.query;
            const data = yield this.restaurantModel
                .restaurantOrderModel()
                .getKitchenOrders({
                limit: Number(limit),
                skip: Number(skip),
                hotel_code,
                restaurant_id,
                order_no: order_no,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_SUCCESSFUL }, data);
        });
    }
    updateKitchenOrders(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const restaurantOrderModel = this.restaurantModel.restaurantOrderModel(trx);
                const isOrderExists = yield restaurantOrderModel.getOrderById({
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
                yield restaurantOrderModel.updateOrder({
                    id: parseInt(id),
                    payload: { kitchen_status: "completed" },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Your order has been cooked to perfection and is ready!",
                };
            }));
        });
    }
    updateOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
                const { id, restaurant_id, hotel_code } = req.restaurant_admin;
                const { id: order_id } = req.params;
                const _r = req.body, { order_items, customer_name, customer_phone, order_type, booking_id } = _r, rest = __rest(_r, ["order_items", "customer_name", "customer_phone", "order_type", "booking_id"]);
                const restaurantOrderModel = this.restaurantModel.restaurantOrderModel(trx);
                const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
                const restaurantTableModel = this.restaurantModel.restaurantTableModel(trx);
                const hotelInventoryModel = this.Model.inventoryModel(trx);
                // fetch existing order
                const existingOrder = yield restaurantOrderModel.getOrderById({
                    id: Number(order_id),
                    hotel_code,
                    restaurant_id,
                });
                console.log({ existingOrder });
                if (!existingOrder) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Order not found",
                    };
                }
                // validate table change
                if (rest.table_id && rest.table_id !== existingOrder.table_id) {
                    const { data } = yield restaurantTableModel.getTables({
                        id: rest.table_id,
                        hotel_code,
                        restaurant_id,
                    });
                    if (data.length === 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Table not found",
                        };
                    }
                    else if (data[0].status === "booked") {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Table is already booked",
                        };
                    }
                }
                // Validate & fetch foods
                const foodIds = order_items === null || order_items === void 0 ? void 0 : order_items.map((item) => item.food_id);
                const uniqueFoodIds = Array.from(new Set(foodIds));
                if (uniqueFoodIds.length !== (order_items === null || order_items === void 0 ? void 0 : order_items.length)) {
                    throw new customEror_1.default("Duplicate food items found in the order.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const foodItems = yield restaurantFoodModel.getFoods({
                    hotel_code,
                    restaurant_id,
                    food_ids: uniqueFoodIds,
                });
                if (foodItems.data.length !== uniqueFoodIds.length) {
                    throw new customEror_1.default("One or more food items not found.", this.StatusCode.HTTP_NOT_FOUND);
                }
                // Restore old stock
                const { order_items: oldOrderItems } = existingOrder;
                console.log({ oldOrderItems });
                for (const old of oldOrderItems) {
                    const oldFood = yield restaurantFoodModel.getFoods({
                        id: old.food_id,
                        hotel_code,
                        restaurant_id,
                    });
                    const food = oldFood.data[0];
                    if (!food)
                        continue;
                    if (food.recipe_type === "ingredients") {
                        const recipes = yield restaurantFoodModel.getFoodIngredients({
                            food_id: old.food_id,
                        });
                        for (const r of recipes) {
                            const restoreQty = Number(r.quantity_per_unit) * Number(old.quantity);
                            const inv = yield hotelInventoryModel.getSingleInventoryDetails({
                                hotel_code,
                                product_id: r.product_id,
                            });
                            if (inv) {
                                const restoredUsed = Number(inv.quantity_used) - restoreQty;
                                yield hotelInventoryModel.updateInInventory({ quantity_used: restoredUsed }, { product_id: r.product_id });
                            }
                        }
                    }
                    else if (food.recipe_type === "non-ingredients") {
                        const stock = yield restaurantFoodModel.getSingleStockWithFoodAndDate({
                            hotel_code,
                            restaurant_id,
                            food_id: food.id,
                            stock_date: new Date().toISOString().split("T")[0],
                        });
                        console.log({ stock });
                        if (stock) {
                            const restoredQty = Number(stock.sold_quantity) - Number(old.quantity);
                            yield restaurantFoodModel.updateStocks({
                                where: { food_id: stock.food_id, stock_date: stock.stock_date },
                                payload: { sold_quantity: restoredQty },
                            });
                        }
                    }
                }
                console.log({ order_items }, "end");
                // Deduct new stock
                for (const item of order_items) {
                    const food = foodItems.data.find((f) => f.id === item.food_id);
                    if (!food)
                        continue;
                    if (food.recipe_type === "ingredients") {
                        const recipes = yield restaurantFoodModel.getFoodIngredients({
                            food_id: item.food_id,
                        });
                        for (const r of recipes) {
                            const requiredQty = Number(r.quantity_per_unit) * Number(item.quantity);
                            const inv = yield hotelInventoryModel.getSingleInventoryDetails({
                                hotel_code,
                                product_id: r.product_id,
                            });
                            if (!inv) {
                                throw new customEror_1.default(`Inventory item ${r.product_id} not found.`, this.StatusCode.HTTP_NOT_FOUND);
                            }
                            // if (Number(inv.available_quantity) < requiredQty) {
                            //   throw new CustomError(
                            //     `Insufficient stock for product ${r.product_id}.`,
                            //     this.StatusCode.HTTP_CONFLICT
                            //   );
                            // }
                            const updatedUsed = Number(inv.quantity_used) + requiredQty;
                            console.log({ updatedUsed }, { product_id: r.product_id });
                            yield hotelInventoryModel.updateInInventory({ quantity_used: updatedUsed }, { product_id: r.product_id });
                        }
                    }
                    else if (food.recipe_type === "non-ingredients") {
                        const stock = yield restaurantFoodModel.getSingleStockWithFoodAndDate({
                            hotel_code,
                            restaurant_id,
                            food_id: item.food_id,
                            stock_date: new Date().toISOString().split("T")[0],
                        });
                        console.log({ stock });
                        if (!stock) {
                            throw new customEror_1.default(`Stock not found for food ID ${item.food_id}.`, this.StatusCode.HTTP_NOT_FOUND);
                        }
                        if (Number(stock.quantity) < Number(item.quantity)) {
                            throw new customEror_1.default(`Insufficient stock for food ID ${item.food_id}.`, this.StatusCode.HTTP_CONFLICT);
                        }
                        const newQty = Number(stock.sold_quantity) + Number(item.quantity);
                        console.log(stock.sold_quantity, item.quantity, "adsf");
                        yield restaurantFoodModel.updateStocks({
                            where: { food_id: stock.food_id, stock_date: stock.stock_date },
                            payload: { sold_quantity: newQty },
                        });
                    }
                }
                // Recalculate totals
                let sub_total = 0;
                foodItems.data.forEach((food) => {
                    const item = order_items.find((i) => i.food_id === food.id);
                    if (item) {
                        sub_total += Number(item.quantity) * Number(food.retail_price);
                    }
                });
                const discountAmount = lib_1.default.calculatePercentageToAmount(sub_total, (_a = rest.discount) !== null && _a !== void 0 ? _a : Number(existingOrder.discount), (_b = rest.discount_type) !== null && _b !== void 0 ? _b : existingOrder.discount_type);
                let gross_amount = sub_total - discountAmount;
                const serviceChargeAmount = lib_1.default.calculatePercentageToAmount(gross_amount, (_c = rest.service_charge) !== null && _c !== void 0 ? _c : Number(existingOrder.service_charge), (_d = rest.service_charge_type) !== null && _d !== void 0 ? _d : existingOrder.service_charge_type);
                gross_amount += serviceChargeAmount;
                const vatAmount = lib_1.default.calculatePercentageToAmount(gross_amount, (_e = rest.vat) !== null && _e !== void 0 ? _e : Number(existingOrder.vat), (_f = rest.vat_type) !== null && _f !== void 0 ? _f : existingOrder.vat_type);
                const grand_total = gross_amount + vatAmount;
                // order_type logic (walk-in / reservation)
                let finalGuestName = existingOrder.guest_name;
                let finalBookingId = existingOrder.booking_id;
                let customerId;
                if (order_type === "walk-in") {
                    if ((customer_name || customer_phone) &&
                        customer_name &&
                        customer_phone) {
                        const { data: existingCustomer } = yield this.restaurantModel
                            .restaurantModel()
                            .getAllCustomer({
                            contact_no: customer_phone,
                            hotel_code,
                        });
                        if (existingCustomer.length === 0) {
                            const [newCustomer] = yield this.restaurantModel
                                .restaurantModel(trx)
                                .createCustomer({
                                name: customer_name,
                                contact_no: customer_phone,
                                hotel_code,
                            });
                            customerId = newCustomer.id;
                        }
                        else {
                            customerId = existingCustomer[0].id;
                        }
                    }
                    finalGuestName = customer_name !== null && customer_name !== void 0 ? customer_name : existingOrder.guest_name;
                    finalBookingId = undefined;
                }
                else if (order_type === "reservation") {
                    finalGuestName = customer_name !== null && customer_name !== void 0 ? customer_name : existingOrder.guest_name;
                    finalBookingId = booking_id;
                }
                // Update main order
                yield restaurantOrderModel.updateOrder({
                    id: Number(order_id),
                    payload: {
                        staff_id: (_g = rest.staff_id) !== null && _g !== void 0 ? _g : existingOrder.staff_id,
                        table_id: (_h = rest.table_id) !== null && _h !== void 0 ? _h : existingOrder.table_id,
                        order_type: order_type !== null && order_type !== void 0 ? order_type : existingOrder.order_type,
                        guest_name: finalGuestName,
                        booking_id: finalBookingId,
                        room_no: (_j = rest.room_no) !== null && _j !== void 0 ? _j : existingOrder.room_no,
                        sub_total,
                        discount: (_k = rest.discount) !== null && _k !== void 0 ? _k : Number(existingOrder.discount),
                        discount_type: (_l = rest.discount_type) !== null && _l !== void 0 ? _l : existingOrder.discount_type,
                        service_charge: (_m = rest.service_charge) !== null && _m !== void 0 ? _m : Number(existingOrder.service_charge),
                        service_charge_type: (_o = rest.service_charge_type) !== null && _o !== void 0 ? _o : existingOrder.service_charge_type,
                        vat: (_p = rest.vat) !== null && _p !== void 0 ? _p : Number(existingOrder.vat),
                        vat_type: (_q = rest.vat_type) !== null && _q !== void 0 ? _q : existingOrder.vat_type,
                        grand_total,
                        updated_by: id,
                        discount_amount: discountAmount,
                        service_charge_amount: serviceChargeAmount,
                        vat_amount: vatAmount,
                    },
                });
                // Replace order items
                yield restaurantOrderModel.deleteOrderItems({
                    order_id: Number(order_id),
                });
                yield Promise.all(order_items.map((item) => __awaiter(this, void 0, void 0, function* () {
                    var _s;
                    const food = foodItems.data.find((f) => f.id === item.food_id);
                    yield restaurantOrderModel.createOrderItems({
                        order_id: Number(order_id),
                        food_id: item.food_id,
                        name: (_s = food === null || food === void 0 ? void 0 : food.name) !== null && _s !== void 0 ? _s : "",
                        rate: Number(food === null || food === void 0 ? void 0 : food.retail_price) || 0,
                        quantity: Number(item.quantity),
                        total: Number(item.quantity) * (Number(food === null || food === void 0 ? void 0 : food.retail_price) || 0),
                    });
                })));
                // Table status update
                if (rest.table_id && rest.table_id !== existingOrder.table_id) {
                    yield restaurantTableModel.updateTable({
                        id: rest.table_id,
                        payload: { status: "booked" },
                    });
                    yield restaurantTableModel.updateTable({
                        id: existingOrder.table_id,
                        payload: { status: "available" },
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Order updated successfully.",
                };
            }));
        });
    }
}
exports.default = RestaurantOrderService;
//# sourceMappingURL=order.service.js.map