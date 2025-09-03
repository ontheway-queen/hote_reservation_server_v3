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
const axios_1 = __importDefault(require("axios"));
const google_auth_library_1 = require("google-auth-library");
const config_1 = __importDefault(require("../../config/config"));
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
class ThirdPartyAuth {
    constructor() {
        this.client = new google_auth_library_1.OAuth2Client(config_1.default.GOOGLE_CLIENT_ID);
    }
    verifyGoogleAccessToken(access_token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenInfo = yield this.client.getTokenInfo(access_token);
                const userInfoRes = yield axios_1.default.get("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });
                const profile = userInfoRes.data;
                return Object.assign(Object.assign({}, tokenInfo), profile);
            }
            catch (error) {
                console.error("Access token verification failed:", error.message);
                throw new customEror_1.default("Invalid access token", 401);
            }
        });
    }
}
exports.default = ThirdPartyAuth;
//# sourceMappingURL=thirdPartyAuth.js.map