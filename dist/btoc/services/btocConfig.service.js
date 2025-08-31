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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
    GetHomePageData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.web_token;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const siteConfig = yield configModel.getSiteConfig({ hotel_code });
                if (!siteConfig) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                console.log({ siteConfig });
                const { hotel_code: no_need_agency_id, id, about_us_content, contact_us_content, about_us_thumbnail, contact_us_thumbnail, privacy_policy_content, updated_by, updated_by_name, terms_and_conditions_content, last_updated } = siteConfig, restData = __rest(siteConfig, ["hotel_code", "id", "about_us_content", "contact_us_content", "about_us_thumbnail", "contact_us_thumbnail", "privacy_policy_content", "updated_by", "updated_by_name", "terms_and_conditions_content", "last_updated"]);
                const hero_bg_data = yield configModel.getHeroBGContent({
                    hotel_code,
                    status: true,
                });
                const hot_deals = yield configModel.getHotDeals({
                    hotel_code,
                    status: true,
                });
                const social_links = yield configModel.getSocialLink({
                    hotel_code,
                    status: true,
                });
                console.log({ social_links });
                const popUpBanner = yield configModel.getPopUpBanner({
                    hotel_code,
                    status: true,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        site_data: restData,
                        hero_bg_data: hero_bg_data.data,
                        hot_deals: hot_deals.data,
                        social_links: social_links.data,
                        popup: {
                            allow: popUpBanner.length ? true : false,
                            pop_up_data: popUpBanner[0],
                        },
                    },
                };
            }));
        });
    }
    GetAboutUsPageData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.web_token;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const siteConfig = yield configModel.getSiteConfig({ hotel_code });
                if (!siteConfig) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { about_us_content, about_us_thumbnail } = siteConfig;
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        about_us_content,
                        about_us_thumbnail,
                    },
                };
            }));
        });
    }
    GetContactUsPageData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.web_token;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const siteConfig = yield configModel.getSiteConfig({ hotel_code });
                if (!siteConfig) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { contact_us_content, contact_us_thumbnail } = siteConfig;
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        contact_us_content,
                        contact_us_thumbnail,
                    },
                };
            }));
        });
    }
    GetPrivacyPolicyPageData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.web_token;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const siteConfig = yield configModel.getSiteConfig({ hotel_code });
                if (!siteConfig) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { privacy_policy_content } = siteConfig;
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        privacy_policy_content,
                    },
                };
            }));
        });
    }
    GetTermsAndConditionsPageData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.web_token;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const siteConfig = yield configModel.getSiteConfig({ hotel_code });
                if (!siteConfig) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { terms_and_conditions_content } = siteConfig;
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        terms_and_conditions_content,
                    },
                };
            }));
        });
    }
    getPopUpBanner(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const configModel = this.Model.b2cConfigurationModel();
            const { hotel_code } = req.web_token;
            const popUpBanners = yield configModel.getPopUpBanner({ hotel_code });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    b2c: popUpBanners,
                },
            };
        });
    }
    GetAccountsData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
}
exports.BtocConfigService = BtocConfigService;
//# sourceMappingURL=btocConfig.service.js.map