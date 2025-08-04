import { allStrings } from "../miscellaneous/constants";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../../config/config";
import nodemailer from "nodemailer";
import * as crypto from "crypto";
import { TDB } from "../../common/types/commontypes";
import {
  defaultChartOfAcc,
  IDefaultChartOfAcc,
} from "../miscellaneous/chartOfAcc";
import AccountModel from "../../models/reservationPanel/accountModel/accountModel";
import HotelModel from "../../models/reservationPanel/hotel.model";
import { IAccHeadDb } from "../../appAdmin/utlis/interfaces/doubleEntry.interface";

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
}
export default Lib;
