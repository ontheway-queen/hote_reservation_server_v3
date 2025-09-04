"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Parsing the env file.
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
// Loading process.env as  ENV interface
const getConfig = () => {
    return {
        PORT: process.env.PORT ? Number(process.env.PORT) : 9005,
        DB_NAME: process.env.DB_NAME,
        DB_USER: process.env.DB_USER,
        DB_PASS: process.env.DB_PASS,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        JWT_SECRET_HOTEL_ADMIN: process.env.JWT_SECRET_HOTEL_ADMIN,
        JWT_SECRET_M_ADMIN: process.env.JWT_SECRET_M_ADMIN,
        JWT_SECRET_H_USER: process.env.JWT_SECRET_H_USER,
        JWT_WEBSITE_SECRET_TOKEN: process.env.JWT_SECRET_H_USER,
        JWT_SECRET_H_RESTURANT: process.env.JWT_SECRET_H_RESTURANT,
        EMAIL_SEND_EMAIL_ID: process.env.EMAIL_SEND_EMAIL_ID,
        EMAIL_SEND_PASSWORD: process.env.EMAIL_SEND_PASSWORD,
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
        AWS_S3_ACCESS_KEY: process.env.AWS_S3_ACCESS_KEY,
        AWS_S3_SECRET_KEY: process.env.AWS_S3_SECRET_KEY,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        SJ_PREFIX: process.env.SJ_PREFIX,
        SJ_USERNAME: process.env.SJ_USERNAME,
        SJ_PASSWORD: process.env.SJ_PASSWORD,
        SURJO_BASE_URL: process.env.SURJO_BASE_URL,
        RETURN_DOMAIN: process.env.RETURN_DOMAIN,
        CLIENT_DOMAIN: process.env.CLIENT_DOMAIN,
        BTOC_CLIENT_DOMAIN: process.env.BTOC_CLIENT_DOMAIN,
    };
};
const getSanitzedConfig = (config) => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in .env`);
        }
    }
    return config;
};
exports.default = getSanitzedConfig(getConfig());
//# sourceMappingURL=config.js.map