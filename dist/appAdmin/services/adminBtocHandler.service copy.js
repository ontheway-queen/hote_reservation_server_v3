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
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class AdminBtocHandlerService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // get Site Configuration
    getSiteConfiguration(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
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
            const { hotel_code } = req.hotel_admin;
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
            const { hotel_code } = req.hotel_admin;
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
            const { hotel_code } = req.hotel_admin;
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
            const { hotel_code } = req.hotel_admin;
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
            const { hotel_code } = req.hotel_admin;
            const configurationModel = this.Model.b2cConfigurationModel();
            const data = yield configurationModel.getPopularRoomTypes({
                hotel_code,
            });
            if (data && data.length < 1) {
                return {
                    success: false,
                    message: "No popular room types found!",
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return {
                success: false,
                message: "Popular room types fetched successfully!",
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    // update site config
    updateSiteConfig(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = req.hotel_admin.hotel_code;
                let _a = req.body, { id, main_logo, contact_us_thumbnail, about_us_thumbnail, favicon, site_thumbnail } = _a, rest_site_config = __rest(_a, ["id", "main_logo", "contact_us_thumbnail", "about_us_thumbnail", "favicon", "site_thumbnail"]);
                const files = req.files || [];
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
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "main_logo":
                            main_logo = filename;
                            break;
                        case "contact_us_thumbnail":
                            contact_us_thumbnail = filename;
                            break;
                        case "about_us_thumbnail":
                            about_us_thumbnail = filename;
                            break;
                        case "favicon":
                            favicon = filename;
                            break;
                        case "site_thumbnail":
                            site_thumbnail = filename;
                            break;
                        default:
                            break;
                    }
                }
                const newSiteConfig = Object.assign({ main_logo,
                    contact_us_thumbnail,
                    about_us_thumbnail,
                    favicon,
                    site_thumbnail }, rest_site_config);
                yield configurationModel.updateSiteConfig({
                    hotel_code,
                    payload: newSiteConfig,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Hotel configuration updated successfully",
                };
            }));
        });
    }
    // update site pop up banner
    updatePopUpBanner(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = req.hotel_admin.hotel_code;
                let _a = req.body, { thumbnail: pop_up_banner_thumbnail } = _a, rest_pop_up_banner = __rest(_a, ["thumbnail"]);
                const files = req.files || [];
                const configurationModel = this.Model.b2cConfigurationModel();
                const data = yield configurationModel.getSiteConfig({
                    hotel_code,
                });
                if (!data) {
                    return {
                        success: false,
                        message: "No pop up banner found!",
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "thumbnail":
                            pop_up_banner_thumbnail = filename;
                            break;
                        default:
                            break;
                    }
                }
                const newPopUpBannerThumbnail = Object.assign({ thumbnail: pop_up_banner_thumbnail }, rest_pop_up_banner);
                yield configurationModel.updatePopUpBanner({
                    hotel_code,
                    payload: newPopUpBannerThumbnail,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Pop up banner updated successfully",
                };
            }));
        });
    }
    // update hero bg content
    updateHeroBgContent(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = req.hotel_admin.hotel_code;
                let _a = req.body, { id, order_number } = _a, rest_hero_bg_content = __rest(_a, ["id", "order_number"]);
                const files = req.files || [];
                const configurationModel = this.Model.b2cConfigurationModel();
                const data = yield configurationModel.getHeroBgContent({
                    hotel_code,
                    id: Number(id),
                });
                if (data && data.length < 1) {
                    return {
                        success: false,
                        message: "No pop up banner found!",
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                const isOrderExists = yield configurationModel.getHeroBgContent({
                    hotel_code,
                    order_number,
                });
                if (isOrderExists && isOrderExists.length > 0) {
                    return {
                        success: false,
                        message: "An entry with the same order number already exists!",
                        code: this.StatusCode.HTTP_CONFLICT,
                    };
                }
                let content;
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "content":
                            content = filename;
                            break;
                        default:
                            break;
                    }
                }
                const newHeroBgContent = Object.assign({ content }, rest_hero_bg_content);
                yield configurationModel.updateHeroBgContent({
                    hotel_code,
                    id,
                    payload: newHeroBgContent,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Hotel configuration updated successfully",
                };
            }));
        });
    }
    updateHotDeals(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = req.hotel_admin.hotel_code;
                const _a = req.body, { id, order_number } = _a, rest_hot_deals = __rest(_a, ["id", "order_number"]);
                const files = req.files || [];
                const configurationModel = this.Model.b2cConfigurationModel();
                const data = yield configurationModel.getHotDeals({
                    hotel_code,
                    id: Number(id),
                });
                if (data && data.length < 1) {
                    return {
                        success: false,
                        message: "No hot deals found!",
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                const isOrderExists = yield configurationModel.getHotDeals({
                    hotel_code,
                    order_number,
                });
                if (isOrderExists && isOrderExists.length > 0) {
                    return {
                        success: false,
                        message: "An entry with the same order number already exists!",
                        code: this.StatusCode.HTTP_CONFLICT,
                    };
                }
                let thumbnail;
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "thumbnail":
                            thumbnail = filename;
                            break;
                        default:
                            break;
                    }
                }
                const newHotDeals = Object.assign({ thumbnail }, rest_hot_deals);
                yield configurationModel.updateHotDeals({
                    hotel_code,
                    id,
                    payload: newHotDeals,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Hotel configuration updated successfully",
                };
            }));
        });
    }
    updateSocialLinks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = req.hotel_admin.hotel_code;
                const _a = req.body, { id, order_number } = _a, rest_social_links = __rest(_a, ["id", "order_number"]);
                const files = req.files || [];
                const configurationModel = this.Model.b2cConfigurationModel();
                const data = yield configurationModel.getHotDeals({
                    hotel_code,
                    id: Number(id),
                });
                if (data && data.length < 1) {
                    return {
                        success: false,
                        message: "No social links found!",
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                const isOrderExists = yield configurationModel.getHotDeals({
                    hotel_code,
                    order_number,
                });
                if (isOrderExists && isOrderExists.length > 0) {
                    return {
                        success: false,
                        message: "An entry with the same order number already exists!",
                        code: this.StatusCode.HTTP_CONFLICT,
                    };
                }
                let icon;
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "icon":
                            icon = filename;
                            break;
                        default:
                            break;
                    }
                }
                const newSocialLinks = Object.assign({ icon,
                    order_number }, rest_social_links);
                console.log({
                    newSocialLinks,
                });
                yield configurationModel.updateSocialLinks({
                    hotel_code,
                    id,
                    payload: newSocialLinks,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Hotel configuration updated successfully",
                };
            }));
        });
    }
    updatePopularRoomTypes(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = req.hotel_admin.hotel_code;
                const _a = req.body, { id, order_number } = _a, rest_popular_room_types = __rest(_a, ["id", "order_number"]);
                const files = req.files || [];
                const configurationModel = this.Model.b2cConfigurationModel();
                const data = yield configurationModel.getPopularRoomTypes({
                    hotel_code,
                    id: Number(id),
                });
                if (data && data.length < 1) {
                    return {
                        success: false,
                        message: "No room type found!",
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                console.log(order_number);
                const isOrderExists = yield configurationModel.getPopularRoomTypes({
                    hotel_code,
                    order_number,
                });
                if (isOrderExists && isOrderExists.length > 0) {
                    return {
                        success: false,
                        message: "An entry with the same order number already exists!",
                        code: this.StatusCode.HTTP_CONFLICT,
                    };
                }
                let thumbnail;
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "thumbnail":
                            thumbnail = filename;
                            break;
                        default:
                            break;
                    }
                }
                const newRoomTypes = Object.assign({ thumbnail,
                    order_number }, rest_popular_room_types);
                yield configurationModel.updatePopularRoomTypes({
                    hotel_code,
                    id,
                    payload: newRoomTypes,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Hotel configuration updated successfully",
                };
            }));
        });
    }
}
exports.default = AdminBtocHandlerService;
//# sourceMappingURL=adminBtocHandler.service%20copy.js.map