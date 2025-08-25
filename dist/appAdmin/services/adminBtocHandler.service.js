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
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
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
    getPopUpBannerConfiguration(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const configurationModel = this.Model.b2cConfigurationModel();
            const data = yield configurationModel.getPopUpBanner({
                hotel_code,
            });
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
                var _a, _b, _c;
                const hotel_code = req.hotel_admin.hotel_code;
                let {} = req.body;
                const files = req.files || [];
                const configurationModel = this.Model.b2cConfigurationModel(trx);
                //   const data = await configurationModel.getSiteConfig({
                //     hotel_code,
                //   });
                //   if (!data) {
                //     return {
                //       success: false,
                //       message: "No site configuration found!",
                //       code: this.StatusCode.HTTP_NOT_FOUND,
                //     };
                //   }
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "main_logo":
                            req.body.main_logo = filename;
                            break;
                        case "contact_us_thumbnail":
                            req.body.contact_us_thumbnail = filename;
                            break;
                        case "about_us_thumbnail":
                            req.body.about_us_thumbnail = filename;
                            break;
                        case "favicon":
                            req.body.favicon = filename;
                            break;
                        case "site_thumbnail":
                            req.body.site_thumbnail = filename;
                            break;
                        default:
                            break;
                    }
                }
                const newSiteConfig = {
                    main_logo: req.body.main_logo,
                    contact_us_thumbnail: req.body.contact_us_thumbnail,
                    hotel_code: req.hotel_admin.hotel_code,
                    favicon: req.body.favicon,
                    site_thumbnail: req.body.site_thumbnail,
                    emails: JSON.stringify((_a = req.body.emails) !== null && _a !== void 0 ? _a : []),
                    numbers: JSON.stringify((_b = req.body.numbers) !== null && _b !== void 0 ? _b : []),
                    address: JSON.stringify((_c = req.body.address) !== null && _c !== void 0 ? _c : []),
                    hero_quote: req.body.hero_quote,
                    hero_sub_quote: req.body.hero_sub_quote,
                    site_name: req.body.site_name,
                    contact_us_content: req.body.contact_us_content,
                    about_us_content: req.body.about_us_content,
                    privacy_policy_content: req.body.privacy_policy_content,
                    terms_and_conditions_content: req.body.terms_and_conditions_content,
                    meta_title: req.body.meta_title,
                    meta_description: req.body.meta_description,
                    meta_tags: req.body.meta_tags,
                    notice: req.body.notice,
                    android_app_link: req.body.android_app_link,
                    ios_app_link: req.body.ios_app_link,
                };
                console.log(newSiteConfig);
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
                const newPopUpBannerThumbnail = Object.assign({ thumbnail: pop_up_banner_thumbnail, updated_at: new Date() }, rest_pop_up_banner);
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
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Hotel configuration updated successfully",
                };
            }));
        });
    }
    // ======================== Service Content ================================ //
    createHotelServiceContent(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const b2cConfigurationModel = this.Model.b2cConfigurationModel(trx);
                const serviceContent = yield b2cConfigurationModel.getSingleServiceContent({
                    hotel_code,
                });
                if (serviceContent) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Service content already exists",
                    };
                }
                yield b2cConfigurationModel.createHotelServiceContent({
                    hotel_code,
                    title: req.body.title,
                    description: req.body.description,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Service content created successfully.",
                };
            }));
        });
    }
    updateHotelServiceContent(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const b2cConfigurationModel = this.Model.b2cConfigurationModel(trx);
                const serviceContent = yield b2cConfigurationModel.getSingleServiceContent({
                    hotel_code,
                });
                console.log({ hotel_code });
                if (!serviceContent) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Service content not found",
                    };
                }
                yield b2cConfigurationModel.updateServiceContent({ title: req.body.title, description: req.body.description }, { hotel_code });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Service content updated successfully.",
                };
            }));
        });
    }
    getHotelContentService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { search, limit, skip } = req.query;
                const b2cConfigurationModel = this.Model.b2cConfigurationModel(trx);
                const serviceContent = yield b2cConfigurationModel.getHotelServiceContentWithServices({
                    hotel_code,
                    search: search,
                    limit: Number(limit),
                    skip: Number(skip),
                });
                if (!serviceContent) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Service content not found",
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Service content fetched successfully.",
                    data: serviceContent,
                };
            }));
        });
    }
    // ======================== Services ================================ //
    createHotelService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const files = req.files || [];
                if (Array.isArray(files) && files.length > 0) {
                    req.body["icon"] = files[0].filename;
                }
                const b2cConfigurationModel = this.Model.b2cConfigurationModel(trx);
                const service = yield b2cConfigurationModel.getSingleService({
                    title: req.body.title,
                });
                if (service) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Service already exists",
                    };
                }
                yield b2cConfigurationModel.createHotelService(Object.assign(Object.assign({}, req.body), { hotel_code }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Service created successfully.",
                };
            }));
        });
    }
    getAllServices(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, limit, skip } = req.query;
            const b2cConfigurationModel = this.Model.b2cConfigurationModel();
            const data = yield b2cConfigurationModel.getAllServices({
                title: title,
                limit: Number(limit),
                skip: Number(skip),
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_SUCCESSFUL, message: "Services retrieved successfully." }, data);
        });
    }
    getSingleService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const b2cConfigurationModel = this.Model.b2cConfigurationModel();
            const data = yield b2cConfigurationModel.getSingleService({ id });
            if (!data) {
                throw new customEror_1.default("Hotel Service not found", this.StatusCode.HTTP_NOT_FOUND);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Service retrieved successfully.",
                data,
            };
        });
    }
    updateService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const id = Number(req.params.id);
                const files = req.files || [];
                if (Array.isArray(files) && files.length > 0) {
                    req.body["icon"] = files[0].filename;
                }
                const b2cConfigurationModel = this.Model.b2cConfigurationModel(trx);
                const service = yield b2cConfigurationModel.getSingleService({
                    id,
                });
                if (!service) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Service not found",
                    };
                }
                const isServicTitleExists = yield b2cConfigurationModel.getSingleService({
                    title: req.body.title,
                });
                if (isServicTitleExists) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Service title already exists",
                    };
                }
                yield b2cConfigurationModel.updateHotelService(req.body, { id });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Service update successfully.",
                };
            }));
        });
    }
    deleteService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const id = Number(req.params.id);
                const b2cConfigurationModel = this.Model.b2cConfigurationModel(trx);
                const service = yield b2cConfigurationModel.getSingleService({
                    id,
                });
                if (!service) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Service not found",
                    };
                }
                yield b2cConfigurationModel.updateHotelService(req.body, { id });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Service deleted successfully.",
                };
            }));
        });
    }
}
exports.default = AdminBtocHandlerService;
//# sourceMappingURL=adminBtocHandler.service.js.map