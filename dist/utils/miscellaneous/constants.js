"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_SRJ_PAYMENT_CANCELLED_URL = exports.SERVER_SRJ_PAYMENT_SUCCESS_RETURN_URL = exports.PAYMENT_CANCELLED_URL = exports.PAYMENT_SUCCESS_RETURN_URL = exports.PAYMENT_VERIFY_URL = exports.PAYMENT_PAY_URL = exports.GET_TOKEN_URL = exports.BTOC_CLIENT_DOMAIN = exports.CLIENT_DOMAIN = exports.RETURN_DOMAIN = exports.SURJO_BASE_URL = exports.ROOM_TYPE_AVAILABILITY_DAYS = exports.FUNCTION_TYPE_HOTEL = exports.CONTENT_TYPE_VIDEO = exports.CONTENT_TYPE_PHOTO = exports.ACC_HEAD_CONFIG = exports.ERROR_LEVEL_CRITICAL = exports.ERROR_LEVEL_ERROR = exports.ERROR_LEVEL_WARNING = exports.ERROR_LEVEL_INFO = exports.ERROR_LEVEL_DEBUG = exports.OTP_FOR_CREDENTIALS = exports.OTP_FOR = exports.OTP_EMAIL_SUBJECT = exports.OTP_TYPE_FORGET_RES_ADMIN = exports.OTP_TYPE_FORGET_BTOC_USER = exports.OTP_TYPE_FORGET_HOTEL_ADMIN = exports.OTP_TYPE_FORGET_M_ADMIN = exports.DIVIDEND_GROUP = exports.EXPENSE_GROUP = exports.INCOME_GROUP = exports.CAPITAL_GROUP = exports.LIABILITY_GROUP = exports.ASSET_GROUP = exports.allStrings = exports.origin = void 0;
const config_1 = __importDefault(require("../../config/config"));
exports.origin = [
    "http://localhost:3000",
    "http://10.10.220.47:3030",
    "http://10.10.220.47:3000",
    "http://10.10.220.147:3000",
    "http://localhost:4050",
    "http://10.10.220.147:4050",
    "https://admin-v3.hotel360.world",
    "https://www.admin-v3.hotel360.world",
    "https://v3.hotel360.world",
    "https://www.v3.hotel360.world",
    "https://admin-v3.hotel360.world",
    "https://www.admin-v3.hotel360.world",
    "https://thehotel360.com",
    "https://www.thehotel360.com",
    "https://thehotel360.com",
    "https://admin.thehotel360.com",
    "https://www.admin.thehotel360.com",
    "http://10.10.220.49:3000",
    "http://10.10.220.147:4050",
];
exports.allStrings = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
];
// Account Groups id
exports.ASSET_GROUP = "1000";
exports.LIABILITY_GROUP = "2000";
exports.CAPITAL_GROUP = "3000";
exports.INCOME_GROUP = "4000";
exports.EXPENSE_GROUP = "5000";
exports.DIVIDEND_GROUP = "6000";
// OTP types constants
exports.OTP_TYPE_FORGET_M_ADMIN = "forget_m_admin";
exports.OTP_TYPE_FORGET_HOTEL_ADMIN = "forget_h_admin";
exports.OTP_TYPE_FORGET_BTOC_USER = "forget_btoc_user";
exports.OTP_TYPE_FORGET_RES_ADMIN = "forget_res_admin";
// Send OTP Email subject
exports.OTP_EMAIL_SUBJECT = "Your One Time Password For Reservation Verification";
// OTP for
exports.OTP_FOR = "Verification";
// send credentials subject
exports.OTP_FOR_CREDENTIALS = "Credential";
//error logs level
exports.ERROR_LEVEL_DEBUG = "DEBUG";
exports.ERROR_LEVEL_INFO = "INFO";
exports.ERROR_LEVEL_WARNING = "WARNING";
exports.ERROR_LEVEL_ERROR = "ERROR";
exports.ERROR_LEVEL_CRITICAL = "CRITICAL";
// Account head config type
exports.ACC_HEAD_CONFIG = {
    PAYROLL_HEAD_ID: "PAYROLL_HEAD_ID",
    CASH_HEAD_ID: "CASH_HEAD_ID",
    RECEIVABLE_HEAD_ID: "RECEIVABLE_HEAD_ID",
    BANK_HEAD_ID: "BANK_HEAD_ID",
    MFS_HEAD_ID: "MFS_HEAD_ID",
    HOTEL_EXPENSE_HEAD_ID: "HOTEL_EXPENSE_HEAD_ID",
    HOTEL_REVENUE_HEAD_ID: "HOTEL_REVENUE_HEAD_ID",
};
exports.CONTENT_TYPE_PHOTO = "PHOTO";
exports.CONTENT_TYPE_VIDEO = "VIDEO";
// functions type
exports.FUNCTION_TYPE_HOTEL = "HOTEL";
// room types availability days when creating a room
exports.ROOM_TYPE_AVAILABILITY_DAYS = 365;
// ------------------------------- surjo payment ----------------------------//
exports.SURJO_BASE_URL = config_1.default.SURJO_BASE_URL;
exports.RETURN_DOMAIN = config_1.default.RETURN_DOMAIN;
exports.CLIENT_DOMAIN = config_1.default.CLIENT_DOMAIN;
exports.BTOC_CLIENT_DOMAIN = config_1.default.BTOC_CLIENT_DOMAIN;
exports.GET_TOKEN_URL = `${exports.SURJO_BASE_URL}/get_token`;
exports.PAYMENT_PAY_URL = `${exports.SURJO_BASE_URL}/secret-pay`;
exports.PAYMENT_VERIFY_URL = `${exports.SURJO_BASE_URL}/verification`;
//btob
exports.PAYMENT_SUCCESS_RETURN_URL = `${exports.RETURN_DOMAIN}/common/payment/by-gateway/success`;
exports.PAYMENT_CANCELLED_URL = `${exports.RETURN_DOMAIN}/common/payment/by-gateway/canceled`;
//btoc
exports.SERVER_SRJ_PAYMENT_SUCCESS_RETURN_URL = `${exports.RETURN_DOMAIN}/payment/btoc/srj/success`;
exports.SERVER_SRJ_PAYMENT_CANCELLED_URL = `${exports.RETURN_DOMAIN}/payment/btoc/srj/cancelled`;
//# sourceMappingURL=constants.js.map