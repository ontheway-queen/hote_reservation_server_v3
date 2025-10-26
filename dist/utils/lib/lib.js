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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const database_1 = require("../../app/database");
const config_1 = __importDefault(require("../../config/config"));
const accountModel_1 = __importDefault(require("../../models/reservationPanel/accountModel/accountModel"));
const expenseModel_1 = __importDefault(require("../../models/reservationPanel/expenseModel"));
const hotel_model_1 = __importDefault(require("../../models/reservationPanel/hotel.model"));
const restaurant_order_model_1 = __importDefault(require("../../models/restaurantModels/restaurant.order.model"));
const chartOfAcc_1 = require("../miscellaneous/chartOfAcc");
const constants_1 = require("../miscellaneous/constants");
const restaurant_food_table_1 = __importDefault(require("../../models/restaurantModels/restaurant.food.table"));
const inventory_model_1 = __importDefault(require("../../models/reservationPanel/inventoryModel/inventory.model"));
const customEror_1 = __importDefault(require("./customEror"));
class Lib {
    // make hashed password
    static hashPass(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcryptjs_1.default.genSalt(10);
            return yield bcryptjs_1.default.hash(password, salt);
        });
    }
    /**
     * verify password
     */
    static compare(password, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcryptjs_1.default.compare(password, hashedPassword);
        });
    }
    static calculateNights(check_in, check_out) {
        return Math.ceil((new Date(check_out).getTime() - new Date(check_in).getTime()) /
            (1000 * 60 * 60 * 24));
    }
    static generateBookingReferenceWithId(hotelPrefix, lastBookingId) {
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
        const idPart = String(lastBookingId + 1).padStart(6, "0");
        return `${hotelPrefix}-${datePart}-${idPart}`;
    }
    // create token
    static createToken(creds, secret, maxAge) {
        return jsonwebtoken_1.default.sign(creds, secret, { expiresIn: maxAge });
    }
    // verify token
    static verifyToken(token, secret) {
        try {
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }
    // generate random Number
    static otpGenNumber(length) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
        let otp = "";
        for (let i = 0; i < length; i++) {
            const randomNumber = Math.floor(Math.random() * 10);
            otp += numbers[randomNumber];
        }
        return otp;
    }
    // generate random Number and alphabet
    static otpGenNumberAndAlphabet(length) {
        let otp = "";
        for (let i = 0; i < length; i++) {
            const randomNumber = Math.floor(Math.random() * 10);
            otp += constants_1.allStrings[randomNumber];
        }
        return otp;
    }
    // send email by nodemailer
    static sendEmail(email, emailSub, emailBody) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transporter = nodemailer_1.default.createTransport({
                    service: "gmail",
                    auth: {
                        user: config_1.default.EMAIL_SEND_EMAIL_ID,
                        pass: config_1.default.EMAIL_SEND_PASSWORD,
                    },
                });
                const info = yield transporter.sendMail({
                    from: config_1.default.EMAIL_SEND_EMAIL_ID,
                    to: email,
                    subject: emailSub,
                    html: emailBody,
                });
                console.log("Message send: %s", info);
                return true;
            }
            catch (err) {
                console.log({ err });
                return false;
            }
        });
    }
    // insert account heads
    static insertHotelCOA(trx, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const accModel = new accountModel_1.default(trx);
            const hotelModel = new hotel_model_1.default(trx);
            function insetFunc(payload, parent_head) {
                return __awaiter(this, void 0, void 0, function* () {
                    const promises = payload.map((item) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        // insert head
                        const accPayload = {
                            code: item.code,
                            hotel_code,
                            created_by: 1,
                            group_code: item.group_code,
                            name: item.name,
                        };
                        if (parent_head) {
                            accPayload.parent_id = parent_head;
                        }
                        const head_id = yield accModel.insertAccHead(accPayload);
                        if (item.config) {
                            yield hotelModel.insertHotelAccConfig({
                                config: item.config,
                                head_id: head_id[0].id,
                                hotel_code,
                            });
                        }
                        if ((_a = item.child) === null || _a === void 0 ? void 0 : _a.length) {
                            yield insetFunc(item.child, head_id[0].id);
                        }
                    }));
                    yield Promise.all(promises);
                });
            }
            yield insetFunc(chartOfAcc_1.defaultChartOfAcc);
        });
    }
    static createAccountHeads({ trx, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const accModel = new accountModel_1.default(trx);
            const { group_code, hotel_code, parent_id, name } = payload;
            const insertedHeadIds = [];
            for (const head of name) {
                let newHeadCode = "";
                if (parent_id) {
                    //Get parent head
                    const parentHead = yield accModel.getAccountHead({
                        hotel_code,
                        group_code,
                        id: parent_id,
                    });
                    if (!parentHead.length) {
                        throw new Error("Parent head not found!");
                    }
                    const { code: parent_head_code } = parentHead[0];
                    //Find last child head under this parent
                    const heads = yield accModel.getAccountHead({
                        hotel_code,
                        group_code,
                        parent_id,
                        order_by: "ah.code",
                        order_to: "desc",
                    });
                    console.log({ heads });
                    if (heads.length) {
                        const { code: child_code } = heads[0];
                        const lastHeadCodeNum = child_code.split(".");
                        const newNum = Number(lastHeadCodeNum.pop()) + 1;
                        newHeadCode = lastHeadCodeNum.join(".");
                        if (newNum < 10) {
                            newHeadCode += `.00${newNum}`;
                        }
                        else if (newNum < 100) {
                            newHeadCode += `.0${newNum}`;
                        }
                        else {
                            newHeadCode += `.${newNum}`;
                        }
                    }
                    else {
                        newHeadCode = `${parent_head_code}.001`;
                    }
                }
                else {
                    // Root level head
                    const checkHead = yield accModel.getAccountHead({
                        hotel_code,
                        group_code,
                        parent_id: null,
                        order_by: "ah.id",
                        order_to: "desc",
                    });
                    if (checkHead.length) {
                        newHeadCode = (Number(checkHead[0].code) + 1).toString();
                    }
                    else {
                        newHeadCode = (Number(group_code) + 1).toString();
                    }
                }
                // Insert new head
                const insertAhRes = yield accModel.insertAccHead({
                    code: newHeadCode,
                    group_code,
                    hotel_code,
                    name: head,
                    parent_id,
                });
                insertedHeadIds.push(insertAhRes[0].id);
            }
            return insertedHeadIds;
        });
    }
    //get adjusted amount from the payment gateways
    static calculateAdjustedAmount(totalAmount, percentage, operation) {
        const factor = percentage / 100;
        const result = operation === "add"
            ? totalAmount * (1 + factor)
            : totalAmount * (1 - factor);
        return parseFloat(result.toFixed(2));
    }
    static buildURL(base, params) {
        return `${base}?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => {
            if (v !== undefined && v !== null)
                acc[k] = String(v);
            return acc;
        }, {})).toString()}`;
    }
    static generateExpenseNo(trx) {
        return __awaiter(this, void 0, void 0, function* () {
            const prefix = "EXP";
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            const datePart = `${yyyy}${mm}${dd}`;
            let nextSeq = 1;
            const lastRow = yield new expenseModel_1.default(trx).getLastExpenseNo();
            const lastExpenseNo = lastRow === null || lastRow === void 0 ? void 0 : lastRow.expense_no;
            if (lastExpenseNo && lastExpenseNo.startsWith(`${prefix}-${datePart}`)) {
                // Extract last sequence number
                const lastSeq = parseInt(lastExpenseNo.split("-").pop() || "0", 10);
                nextSeq = lastSeq + 1;
            }
            const seqPart = String(nextSeq).padStart(4, "0");
            return `${prefix}-${datePart}-${seqPart}`;
        });
    }
    static generateCategoryCode(hotel_code, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const prefix = "SC";
            const words = name.trim().split(/\s+/);
            let code = words
                .map((word) => word[0].toUpperCase())
                .filter((c) => /[A-Z]/.test(c))
                .join("");
            code = code.substring(0, 6);
            const lastCategory = yield (0, database_1.db)("service_categories")
                .withSchema("hotel_service")
                .select("category_code")
                .where("hotel_code", hotel_code)
                .orderBy("id", "desc")
                .first();
            let newSerial = 1;
            if (lastCategory && lastCategory.category_code) {
                const parts = lastCategory.category_code.split("-");
                const lastSerial = parseInt(parts[2], 10);
                if (!isNaN(lastSerial)) {
                    newSerial = lastSerial + 1;
                }
            }
            const serial = String(newSerial).padStart(3, "0");
            return `${prefix}-${code}-${serial}`;
        });
    }
    static generateOrderNo(trx, hotel_code, restaurant_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            const datePart = `${yyyy}${mm}${dd}`;
            let nextSeq = 1;
            // Get the last order for today
            const lastRow = yield new restaurant_order_model_1.default(trx).getLastOrder({
                hotel_code,
                restaurant_id,
            });
            const lastOrderNo = lastRow === null || lastRow === void 0 ? void 0 : lastRow.order_no;
            if (lastOrderNo && lastOrderNo.startsWith(datePart)) {
                const lastSeq = parseInt(lastOrderNo.slice(-2), 10);
                nextSeq = lastSeq + 1;
            }
            const seqPart = String(nextSeq).padStart(3, "0");
            return `${datePart}${seqPart}`;
        });
    }
    static adjustPercentageOrFixedAmount(baseAmount, value = 0, type, isSubtract = false) {
        if (!value || value <= 0)
            return baseAmount;
        let adjustment = 0;
        if (type === "percentage") {
            adjustment = (baseAmount * value) / 100;
        }
        else if (type === "fixed") {
            adjustment = value;
        }
        return isSubtract ? baseAmount - adjustment : baseAmount + adjustment;
    }
    static calculatePercentageToAmount(totalAmount, percentage, type) {
        if (!percentage || percentage <= 0)
            return 0;
        if (type === "fixed")
            return percentage;
        const amount = (totalAmount * percentage) / 100;
        return parseFloat(amount.toFixed(2));
    }
    static checkAndUpdateIngredientStock({ trx, hotel_code, restaurant_id, type, order_items, previous_order_items, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const restaurantFoodModel = new restaurant_food_table_1.default(trx);
            const hotelInventoryModel = new inventory_model_1.default(trx);
            for (const item of order_items) {
                const food = yield restaurantFoodModel.getFood({
                    id: item.food_id,
                    hotel_code,
                    restaurant_id,
                });
                if (!food.ingredients || food.ingredients.length === 0) {
                    throw new customEror_1.default(`Some ingredients are missing for food ${food.name}.`, 404);
                }
                const { ingredients } = food;
                const product_ids = ingredients.map((i) => i.product_id);
                const inventoryList = yield hotelInventoryModel.getAllInventory({
                    hotel_code,
                    product_id: product_ids,
                });
                const inventoryMap = new Map(inventoryList.map((inv) => [inv.product_id, Object.assign({}, inv)]));
                console.log({ inventoryMap });
                for (const ing of ingredients) {
                    const inventory = inventoryMap.get(ing.product_id);
                    if (!inventory) {
                        throw new customEror_1.default(`Product not found in inventory`, 404);
                    }
                    const requiredQty = item.quantity * ing.quantity_per_unit;
                    if (type === "create") {
                        const newAvailable = inventory.quantity - requiredQty;
                        const newUsed = inventory.quantity_used + requiredQty;
                        yield hotelInventoryModel.updateInInventory({
                            quantity: newAvailable,
                            quantity_used: newUsed,
                        }, { product_id: ing.product_id, id: inventory.id });
                        inventory.quantity = newAvailable;
                        inventory.quantity_used = newUsed;
                    }
                    if (type === "cancel") {
                        const newAvailable = inventory.quantity + requiredQty;
                        const newUsed = inventory.quantity_used - requiredQty;
                        yield hotelInventoryModel.updateInInventory({
                            quantity: newAvailable,
                            quantity_used: newUsed,
                        }, { product_id: ing.product_id, id: inventory.id });
                        inventory.quantity = newAvailable;
                        inventory.quantity_used = newUsed;
                    }
                    if (type === "update" && previous_order_items) {
                        const prevOrderMap = new Map();
                        for (const prev of previous_order_items) {
                            prevOrderMap.set(prev.food_id, prev.quantity);
                        }
                        const prevQty = prevOrderMap.get(item.food_id) || 0;
                        if (prevQty === item.quantity)
                            continue;
                        const newRequiredQty = item.quantity * ing.quantity_per_unit;
                        const prevRequiredQty = prevQty * ing.quantity_per_unit;
                        const qtyDiff = newRequiredQty - prevRequiredQty;
                        const finalAvailable = inventory.quantity - qtyDiff;
                        const finalUsed = inventory.quantity_used + qtyDiff;
                        yield hotelInventoryModel.updateInInventory({
                            quantity: finalAvailable,
                            quantity_used: finalUsed,
                        }, { product_id: ing.product_id, id: inventory.id });
                        inventory.quantity = finalAvailable;
                        inventory.quantity_used = finalUsed;
                    }
                }
            }
        });
    }
}
exports.default = Lib;
//# sourceMappingURL=lib.js.map