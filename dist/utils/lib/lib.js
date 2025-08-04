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
const constants_1 = require("../miscellaneous/constants");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../../config/config"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const chartOfAcc_1 = require("../miscellaneous/chartOfAcc");
const accountModel_1 = __importDefault(require("../../models/reservationPanel/accountModel/accountModel"));
const hotel_model_1 = __importDefault(require("../../models/reservationPanel/hotel.model"));
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
                        // insert head
                        var _a;
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
                            insetFunc(item.child, head_id[0].id);
                        }
                    }));
                    yield Promise.all(promises);
                });
            }
            yield insetFunc(chartOfAcc_1.defaultChartOfAcc);
        });
    }
}
exports.default = Lib;
//# sourceMappingURL=lib.js.map