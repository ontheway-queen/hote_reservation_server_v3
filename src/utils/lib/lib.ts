import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { db } from "../../app/database";
import {
  IAccHeadDb,
  IinsertAccHeadReqBodyForMpanel,
} from "../../appAdmin/utlis/interfaces/doubleEntry.interface";
import { TDB } from "../../common/types/commontypes";
import config from "../../config/config";
import AccountModel from "../../models/reservationPanel/accountModel/accountModel";
import ExpenseModel from "../../models/reservationPanel/expenseModel";
import HotelModel from "../../models/reservationPanel/hotel.model";
import RestaurantOrderModel from "../../models/restaurantModels/restaurant.order.model";
import {
  defaultChartOfAcc,
  IDefaultChartOfAcc,
} from "../miscellaneous/chartOfAcc";
import { allStrings } from "../miscellaneous/constants";
import { Knex } from "knex";

class Lib {
  // make hashed password
  public static async hashPass(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * verify password
   */
  public static async compare(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  public static calculateNights(check_in: string, check_out: string): number {
    return Math.ceil(
      (new Date(check_out).getTime() - new Date(check_in).getTime()) /
        (1000 * 60 * 60 * 24)
    );
  }

  public static generateBookingReferenceWithId(
    hotelPrefix: string,
    lastBookingId: number
  ): string {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const idPart = String(lastBookingId + 1).padStart(6, "0");
    return `${hotelPrefix}-${datePart}-${idPart}`;
  }

  // create token
  public static createToken(
    creds: object,
    secret: string,
    maxAge: number | string
  ) {
    return jwt.sign(creds, secret, { expiresIn: maxAge });
  }

  // verify token
  public static verifyToken(token: string, secret: string) {
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  // generate random Number
  public static otpGenNumber(length: number) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    let otp = "";

    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * 10);

      otp += numbers[randomNumber];
    }

    return otp;
  }

  // generate random Number and alphabet
  public static otpGenNumberAndAlphabet(length: number) {
    let otp = "";

    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * 10);

      otp += allStrings[randomNumber];
    }

    return otp;
  }

  // send email by nodemailer
  public static async sendEmail(
    email: string,
    emailSub: string,
    emailBody: string
  ) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.EMAIL_SEND_EMAIL_ID,
          pass: config.EMAIL_SEND_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: config.EMAIL_SEND_EMAIL_ID,
        to: email,
        subject: emailSub,
        html: emailBody,
      });

      console.log("Message send: %s", info);

      return true;
    } catch (err: any) {
      console.log({ err });
      return false;
    }
  }

  // insert account heads
  public static async insertHotelCOA(trx: TDB, hotel_code: number) {
    const accModel = new AccountModel(trx);
    const hotelModel = new HotelModel(trx);
    async function insetFunc(
      payload: IDefaultChartOfAcc[],
      parent_head?: number
    ) {
      const promises = payload.map(async (item) => {
        // insert head
        const accPayload: IAccHeadDb = {
          code: item.code,
          hotel_code,
          created_by: 1,
          group_code: item.group_code,
          name: item.name,
        };

        if (parent_head) {
          accPayload.parent_id = parent_head;
        }

        const head_id = await accModel.insertAccHead(accPayload);

        if (item.config) {
          await hotelModel.insertHotelAccConfig({
            config: item.config,
            head_id: head_id[0].id,
            hotel_code,
          });
        }
        if (item.child?.length) {
          await insetFunc(item.child, head_id[0].id);
        }
      });

      await Promise.all(promises);
    }

    await insetFunc(defaultChartOfAcc);
  }

  public static async createAccountHeads({
    trx,
    payload,
  }: {
    trx: Knex.Transaction;
    payload: IinsertAccHeadReqBodyForMpanel;
  }): Promise<number[]> {
    const accModel = new AccountModel(trx);
    const { group_code, hotel_code, parent_id, name } = payload;

    const insertedHeadIds: number[] = [];

    for (const head of name) {
      let newHeadCode = "";

      if (parent_id) {
        //Get parent head
        const parentHead = await accModel.getAccountHead({
          hotel_code,
          group_code,
          id: parent_id,
        });

        if (!parentHead.length) {
          throw new Error("Parent head not found!");
        }

        const { code: parent_head_code } = parentHead[0];

        //Find last child head under this parent
        const heads = await accModel.getAccountHead({
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
          } else if (newNum < 100) {
            newHeadCode += `.0${newNum}`;
          } else {
            newHeadCode += `.${newNum}`;
          }
        } else {
          newHeadCode = `${parent_head_code}.001`;
        }
      } else {
        // Root level head
        const checkHead = await accModel.getAccountHead({
          hotel_code,
          group_code,
          parent_id: null,
          order_by: "ah.id",
          order_to: "desc",
        });

        if (checkHead.length) {
          newHeadCode = (Number(checkHead[0].code) + 1).toString();
        } else {
          newHeadCode = (Number(group_code) + 1).toString();
        }
      }

      // Insert new head
      const insertAhRes = await accModel.insertAccHead({
        code: newHeadCode,
        group_code,
        hotel_code,
        name: head,
        parent_id,
      });

      insertedHeadIds.push(insertAhRes[0].id);
    }

    return insertedHeadIds;
  }

  //get adjusted amount from the payment gateways
  public static calculateAdjustedAmount(
    totalAmount: number,
    percentage: number,
    operation: "add" | "subtract"
  ) {
    const factor = percentage / 100;
    const result =
      operation === "add"
        ? totalAmount * (1 + factor)
        : totalAmount * (1 - factor);
    return parseFloat(result.toFixed(2));
  }

  public static buildURL(base: string, params: Record<string, unknown>) {
    return `${base}?${new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {})
    ).toString()}`;
  }

  public static async generateExpenseNo(trx: TDB): Promise<string> {
    const prefix = "EXP";
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const datePart = `${yyyy}${mm}${dd}`;
    let nextSeq = 1;

    const lastRow = await new ExpenseModel(trx).getLastExpenseNo();
    const lastExpenseNo = lastRow?.expense_no;

    if (lastExpenseNo && lastExpenseNo.startsWith(`${prefix}-${datePart}`)) {
      // Extract last sequence number
      const lastSeq = parseInt(lastExpenseNo.split("-").pop() || "0", 10);
      nextSeq = lastSeq + 1;
    }

    const seqPart = String(nextSeq).padStart(4, "0");
    return `${prefix}-${datePart}-${seqPart}`;
  }

  public static async generateCategoryCode(
    hotel_code: number,
    name: string
  ): Promise<string> {
    const prefix = "SC";

    const words = name.trim().split(/\s+/);
    let code = words
      .map((word) => word[0].toUpperCase())
      .filter((c) => /[A-Z]/.test(c))
      .join("");

    code = code.substring(0, 6);

    const lastCategory = await db("service_categories")
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
  }

  public static async generateOrderNo(
    trx: TDB,
    hotel_code: number,
    restaurant_id: number
  ): Promise<string> {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const datePart = `${yyyy}${mm}${dd}`;
    let nextSeq = 1;

    // Get the last order for today
    const lastRow = await new RestaurantOrderModel(trx).getLastOrder({
      hotel_code,
      restaurant_id,
    });

    const lastOrderNo = lastRow?.order_no;

    if (lastOrderNo && lastOrderNo.startsWith(datePart)) {
      const lastSeq = parseInt(lastOrderNo.slice(-2), 10);
      nextSeq = lastSeq + 1;
    }

    const seqPart = String(nextSeq).padStart(3, "0");
    return `${datePart}${seqPart}`;
  }

  public static adjustPercentageOrFixedAmount(
    baseAmount: number,
    value: number = 0,
    type?: "percentage" | "fixed",
    isSubtract: boolean = false
  ): number {
    if (!value || value <= 0) return baseAmount;

    let adjustment = 0;
    if (type === "percentage") {
      adjustment = (baseAmount * value) / 100;
    } else if (type === "fixed") {
      adjustment = value;
    }

    return isSubtract ? baseAmount - adjustment : baseAmount + adjustment;
  }

  public static calculatePercentageToAmount(
    totalAmount: number,
    percentage: number,
    type?: "percentage" | "fixed"
  ): number {
    if (!percentage || percentage <= 0) return 0;
    if (type === "fixed") return percentage;

    const amount = (totalAmount * percentage) / 100;
    return parseFloat(amount.toFixed(2));
  }
}
export default Lib;
