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
exports.BtocConfigService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class BtocConfigService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // get Site Configuration
    getSiteConfiguration(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const configurationModel = this.Model.b2cConfigurationModel();
            const data = yield configurationModel.getSiteConfig({
                hotel_code,
            });
            if (!data) {
                return {
                    success: false,
                    message: "No site configuration found!",
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return {
                success: false,
                message: "Site configuration fetched successfully!",
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    // get pop up banner
    getPopUpBannerConfiguration(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const configurationModel = this.Model.b2cConfigurationModel();
            const data = yield configurationModel.getPopUpBanner({
                hotel_code,
            });
            if (!data) {
                return {
                    success: false,
                    message: "No pop up banner found!",
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return {
                success: false,
                message: "Pop up banner fetched successfully!",
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    // get hero bg content
    getHeroBgContent(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const configurationModel = this.Model.b2cConfigurationModel();
            const data = yield configurationModel.getHeroBgContent({
                hotel_code,
            });
            if (data && data.length < 1) {
                return {
                    success: false,
                    message: "No hero bg content found!",
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return {
                success: false,
                message: "Hero BG content fetched successfully!",
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getHotDeals(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const configurationModel = this.Model.b2cConfigurationModel();
            const data = yield configurationModel.getHotDeals({
                hotel_code,
            });
            if (data && data.length < 1) {
                return {
                    success: false,
                    message: "No Hot deals found!",
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return {
                success: false,
                message: "Hot Deals fetched successfully!",
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getSocialLinks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const configurationModel = this.Model.b2cConfigurationModel();
            const data = yield configurationModel.getSocialLinks({
                hotel_code,
            });
            if (data && data.length < 1) {
                return {
                    success: false,
                    message: "No social links found!",
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return {
                success: false,
                message: "Social Links fetched successfully!",
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getPopularRoomTypes(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const configurationModel = this.Model.b2cConfigurationModel();
            const data = yield configurationModel.getPopularRoomTypes({
                hotel_code,
            });
            if (data && data.length < 1) {
                return {
                    success: false,
                    message: "No social links found!",
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return {
                success: false,
                message: "Social Links fetched successfully!",
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
}
exports.BtocConfigService = BtocConfigService;
//# sourceMappingURL=btocConfig.service.js.map