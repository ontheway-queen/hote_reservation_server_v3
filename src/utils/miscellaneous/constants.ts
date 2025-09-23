import config from "../../config/config";

export const origin: string[] = [
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
];

export const allStrings = [
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
export const ASSET_GROUP = "1000";
export const LIABILITY_GROUP = "2000";
export const CAPITAL_GROUP = "3000";
export const INCOME_GROUP = "4000";
export const EXPENSE_GROUP = "5000";
export const DIVIDEND_GROUP = "6000";

// OTP types constants
export const OTP_TYPE_FORGET_M_ADMIN = "forget_m_admin";
export const OTP_TYPE_FORGET_HOTEL_ADMIN = "forget_h_admin";

export const OTP_TYPE_FORGET_BTOC_USER = "forget_btoc_user";

export const OTP_TYPE_FORGET_RES_ADMIN = "forget_res_admin";

// Send OTP Email subject
export const OTP_EMAIL_SUBJECT =
  "Your One Time Password For Reservation Verification";

// OTP for
export const OTP_FOR = "Verification";

// send credentials subject
export const OTP_FOR_CREDENTIALS = "Credential";

//error logs level
export const ERROR_LEVEL_DEBUG = "DEBUG";
export const ERROR_LEVEL_INFO = "INFO";
export const ERROR_LEVEL_WARNING = "WARNING";
export const ERROR_LEVEL_ERROR = "ERROR";
export const ERROR_LEVEL_CRITICAL = "CRITICAL";

// Account head config type
export const ACC_HEAD_CONFIG = {
  PAYROLL_HEAD_ID: "PAYROLL_HEAD_ID",
  CASH_HEAD_ID: "CASH_HEAD_ID",
  RECEIVABLE_HEAD_ID: "RECEIVABLE_HEAD_ID",
  BANK_HEAD_ID: "BANK_HEAD_ID",
  MFS_HEAD_ID: "MFS_HEAD_ID",
  HOTEL_EXPENSE_HEAD_ID: "HOTEL_EXPENSE_HEAD_ID",
  HOTEL_REVENUE_HEAD_ID: "HOTEL_REVENUE_HEAD_ID",
} as const;

export type IAccountConfigHeads = keyof typeof ACC_HEAD_CONFIG;

export const CONTENT_TYPE_PHOTO = "PHOTO";
export const CONTENT_TYPE_VIDEO = "VIDEO";

// functions type
export const FUNCTION_TYPE_HOTEL = "HOTEL";

// room types availability days when creating a room
export const ROOM_TYPE_AVAILABILITY_DAYS = 365;

// ------------------------------- surjo payment ----------------------------//

export const SURJO_BASE_URL = config.SURJO_BASE_URL;

export const RETURN_DOMAIN = config.RETURN_DOMAIN;

export const CLIENT_DOMAIN = config.CLIENT_DOMAIN;

export const BTOC_CLIENT_DOMAIN = config.BTOC_CLIENT_DOMAIN;

export const GET_TOKEN_URL = `${SURJO_BASE_URL}/get_token`;
export const PAYMENT_PAY_URL = `${SURJO_BASE_URL}/secret-pay`;
export const PAYMENT_VERIFY_URL = `${SURJO_BASE_URL}/verification`;

//btob
export const PAYMENT_SUCCESS_RETURN_URL = `${RETURN_DOMAIN}/common/payment/by-gateway/success`;
export const PAYMENT_CANCELLED_URL = `${RETURN_DOMAIN}/common/payment/by-gateway/canceled`;

//btoc
export const SERVER_SRJ_PAYMENT_SUCCESS_RETURN_URL = `${RETURN_DOMAIN}/payment/btoc/srj/success`;
export const SERVER_SRJ_PAYMENT_CANCELLED_URL = `${RETURN_DOMAIN}/payment/btoc/srj/cancelled`;
