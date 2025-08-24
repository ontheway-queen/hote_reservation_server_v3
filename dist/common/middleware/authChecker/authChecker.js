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
const abstract_service_1 = __importDefault(require("../../../abstarcts/abstract.service"));
const config_1 = __importDefault(require("../../../config/config"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const responseMessage_1 = __importDefault(require("../../../utils/miscellaneous/responseMessage"));
const statusCode_1 = __importDefault(require("../../../utils/miscellaneous/statusCode"));
class AuthChecker extends abstract_service_1.default {
    constructor() {
        super();
        // admin auth checker
        this.mAdminAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            const authSplit = authorization.split(" ");
            if (authSplit.length !== 2) {
                return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_M_ADMIN);
            if (!verify) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            else {
                if (verify.type !== "admin" || verify.status === 0) {
                    return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                        success: false,
                        message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                    });
                }
                else {
                    req.admin = verify;
                    next();
                }
            }
        });
        // hotel admin auth checker
        this.hotelAdminAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            const authSplit = authorization.split(" ");
            if (authSplit.length !== 2) {
                return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_HOTEL_ADMIN);
            if (!verify) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            else {
                if (verify.type !== "admin" || verify.status === 0) {
                    return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                        success: false,
                        message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                    });
                }
                else {
                    req.hotel_admin = verify;
                    next();
                }
            }
        });
        // hotel user auth checker
        this.btocUserAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            const authSplit = authorization.split(" ");
            if (authSplit.length !== 2) {
                return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_H_USER);
            console.log({ verify });
            if (!verify) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            else {
                if (verify.status === "blocked" || verify.status === "expired") {
                    return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                        success: false,
                        message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                    });
                }
                else {
                    req.btoc_user = verify;
                    next();
                }
            }
        });
        // hotel user auth checker
        this.hotelRestAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            const authSplit = authorization.split(" ");
            if (authSplit.length !== 2) {
                return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_H_RESTURANT);
            if (!verify) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            else {
                if (verify.status === "blocked" || verify.status === "inactive") {
                    return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                        success: false,
                        message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                    });
                }
                else {
                    req.rest_user = verify;
                    next();
                }
            }
        });
        // white label token verify
        this.whiteLabelTokenVerfiy = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const wl_token = req.headers.wl_token;
                console.log({ wl_token });
                if (!wl_token) {
                    return res
                        .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                        .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                }
                // get hotel by web token
                const hotel = yield this.Model.HotelModel().getSingleHotel({ wl_token });
                if (!hotel) {
                    return res
                        .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                        .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                }
                else {
                    req.web_token = {
                        hotel_code: hotel.hotel_code,
                        hotel_name: hotel.hotel_name,
                    };
                    next();
                }
            }
            catch (err) {
                res.status(statusCode_1.default.HTTP_BAD_REQUEST).json({
                    success: false,
                    message: err.reason ? err.reason : responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
            }
        });
    }
}
exports.default = AuthChecker;
//# sourceMappingURL=authChecker.js.map