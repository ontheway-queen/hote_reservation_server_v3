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
exports.B2CSubSiteConfigService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
const pagesContent_1 = require("../../utils/miscellaneous/siteConfig/pagesContent");
class B2CSubSiteConfigService extends abstract_service_1.default {
    constructor() {
        super();
    }
    updateSiteConfig(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const _a = req.body, { emails, numbers, address } = _a, body = __rest(_a, ["emails", "numbers", "address"]);
                const files = req.files || [];
                const { hotel_code, id: user_id } = req.hotel_admin;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const checkConfig = yield configModel.getSiteConfig({
                    hotel_code,
                });
                const payload = Object.assign({ last_updated: new Date(), updated_by: user_id }, body);
                files.forEach((file) => {
                    if (file.fieldname === "main_logo") {
                        payload.main_logo = file.filename;
                    }
                    if (file.fieldname === "site_thumbnail") {
                        payload.site_thumbnail = file.filename;
                    }
                    if (file.fieldname === "favicon") {
                        payload.favicon = file.filename;
                    }
                });
                if (emails) {
                    payload.emails = JSON.stringify(emails);
                }
                if (numbers) {
                    payload.numbers = JSON.stringify(numbers);
                }
                if (address) {
                    console.log(address);
                    payload.address = JSON.stringify(address);
                }
                yield configModel.updateConfig(payload, { hotel_code });
                const deletedFiles = [];
                if ((checkConfig === null || checkConfig === void 0 ? void 0 : checkConfig.main_logo) && payload.main_logo) {
                    deletedFiles.push(checkConfig.main_logo);
                }
                if ((checkConfig === null || checkConfig === void 0 ? void 0 : checkConfig.favicon) && payload.favicon) {
                    deletedFiles.push(checkConfig.favicon);
                }
                if ((checkConfig === null || checkConfig === void 0 ? void 0 : checkConfig.site_thumbnail) && payload.site_thumbnail) {
                    deletedFiles.push(checkConfig.site_thumbnail);
                }
                if (deletedFiles.length) {
                    yield this.manageFile.deleteFromCloud(deletedFiles);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        main_logo: payload.main_logo,
                        favicon: payload.favicon,
                        site_thumbnail: payload.site_thumbnail,
                    },
                };
            }));
        });
    }
    getSiteConfigData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const configModel = this.Model.b2cConfigurationModel();
            const siteConfig = yield configModel.getSiteConfig({ hotel_code });
            if (!siteConfig) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const { hotel_code: no_need_agency_id, id, about_us_content, contact_us_content, about_us_thumbnail, contact_us_thumbnail, privacy_policy_content, updated_by, updated_by_name, terms_and_conditions_content, last_updated } = siteConfig, restData = __rest(siteConfig, ["hotel_code", "id", "about_us_content", "contact_us_content", "about_us_thumbnail", "contact_us_thumbnail", "privacy_policy_content", "updated_by", "updated_by_name", "terms_and_conditions_content", "last_updated"]);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: restData,
            };
        });
    }
    updateAboutUsData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const files = req.files || [];
            const { hotel_code, id: user_id } = req.hotel_admin;
            const configModel = this.Model.b2cConfigurationModel();
            const checkConfig = yield configModel.getSiteConfig({
                hotel_code,
            });
            const payload = {
                last_updated: new Date(),
                updated_by: user_id,
            };
            if (body.content) {
                payload.about_us_content = body.content;
            }
            files.forEach((file) => {
                if (file.fieldname === "thumbnail") {
                    payload.about_us_thumbnail = file.filename;
                }
            });
            yield configModel.updateConfig(payload, { hotel_code });
            if (payload.about_us_thumbnail && (checkConfig === null || checkConfig === void 0 ? void 0 : checkConfig.about_us_thumbnail)) {
                yield this.manageFile.deleteFromCloud([checkConfig.about_us_thumbnail]);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    thumbnail: payload.about_us_thumbnail,
                },
            };
        });
    }
    getAboutUsData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
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
                        content: about_us_content,
                        thumbnail: about_us_thumbnail,
                    },
                };
            }));
        });
    }
    updateContactUsData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const files = req.files || [];
            const { hotel_code, id: user_id } = req.hotel_admin;
            const configModel = this.Model.b2cConfigurationModel();
            const checkConfig = yield configModel.getSiteConfig({
                hotel_code,
            });
            const payload = {
                last_updated: new Date(),
                updated_by: user_id,
            };
            if (body.content) {
                payload.contact_us_content = body.content;
            }
            files.forEach((file) => {
                if (file.fieldname === "thumbnail") {
                    payload.contact_us_thumbnail = file.filename;
                }
            });
            yield configModel.updateConfig(payload, { hotel_code });
            if (payload.contact_us_content && (checkConfig === null || checkConfig === void 0 ? void 0 : checkConfig.contact_us_content)) {
                yield this.manageFile.deleteFromCloud([checkConfig.contact_us_content]);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    thumbnail: payload.contact_us_content,
                },
            };
        });
    }
    getContactUsData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
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
                        content: contact_us_content,
                        thumbnail: contact_us_thumbnail,
                    },
                };
            }));
        });
    }
    updatePrivacyPolicyData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const { hotel_code, id: user_id } = req.hotel_admin;
            const configModel = this.Model.b2cConfigurationModel();
            const payload = {
                last_updated: new Date(),
                updated_by: user_id,
            };
            if (body.content) {
                payload.privacy_policy_content = body.content;
            }
            yield configModel.updateConfig(payload, { hotel_code });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    getPrivacyPolicyData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
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
                        content: privacy_policy_content,
                    },
                };
            }));
        });
    }
    updateTermsAndConditions(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const { hotel_code, id: user_id } = req.hotel_admin;
            const configModel = this.Model.b2cConfigurationModel();
            const payload = {
                last_updated: new Date(),
                updated_by: user_id,
            };
            if (body.content) {
                payload.terms_and_conditions_content = body.content;
            }
            yield configModel.updateConfig(payload, { hotel_code });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    getTermsAndConditionsData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const configModel = this.Model.b2cConfigurationModel();
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
                    content: terms_and_conditions_content,
                },
            };
        });
    }
    getSocialLinks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const configModel = this.Model.b2cConfigurationModel();
            const { hotel_code } = req.hotel_admin;
            const { data, total } = yield configModel.getSocialLink({
                hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total,
                data,
            };
        });
    }
    deleteSocialLinks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.b2cConfigurationModel(trx);
                const { hotel_code, id: user_id } = req.hotel_admin;
                const id = Number(req.params.id);
                const check = yield configModel.checkSocialLink({ hotel_code, id });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield configModel.deleteSocialLink({ hotel_code, id });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    createSocialLinks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.b2cConfigurationModel(trx);
                const { hotel_code } = req.hotel_admin;
                const body = req.body;
                const socialMedia = yield configModel.checkSocialMedia(body.social_media_id);
                if (!socialMedia) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Social media not found",
                    };
                }
                const lastNo = yield configModel.getSocialLinkLastNo({
                    hotel_code,
                });
                const payload = {
                    hotel_code,
                    order_number: (lastNo === null || lastNo === void 0 ? void 0 : lastNo.order_number) ? lastNo.order_number + 1 : 1,
                    link: body.link,
                    social_media_id: body.social_media_id,
                };
                const newSocialMedia = yield configModel.insertSocialLink(payload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        id: newSocialMedia[0].id,
                    },
                };
            }));
        });
    }
    updateSocialLinks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.b2cConfigurationModel(trx);
                const { hotel_code, id: user_id } = req.hotel_admin;
                const id = Number(req.params.id);
                const check = yield configModel.checkSocialLink({ hotel_code, id });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const body = req.body;
                const payload = body;
                yield configModel.updateSocialLink(payload, { hotel_code, id });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    getPopUpBanner(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const configModel = this.Model.b2cConfigurationModel();
            const { hotel_code } = req.hotel_admin;
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
    upSertPopUpBanner(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.b2cConfigurationModel(trx);
                const { hotel_code, id: user_id } = req.hotel_admin;
                const _a = req.body, { pop_up_for } = _a, restBody = __rest(_a, ["pop_up_for"]);
                const files = req.files || [];
                const payload = restBody;
                if (files.length) {
                    payload.thumbnail = files[0].filename;
                }
                const checkPopUp = yield configModel.getPopUpBanner({
                    hotel_code,
                });
                let auditDesc = "";
                if (checkPopUp.length) {
                    yield configModel.updatePopUpBanner(payload, {
                        hotel_code,
                    });
                    auditDesc = "Created new pop up banner for " + pop_up_for;
                }
                else {
                    yield configModel.insertPopUpBanner(Object.assign(Object.assign({}, payload), { hotel_code }));
                    auditDesc = "Updated " + pop_up_for + " Pop up banner.";
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        thumbnail: payload.thumbnail,
                    },
                };
            }));
        });
    }
    getHeroBGContent(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const configModel = this.Model.b2cConfigurationModel();
            const { hotel_code, id: user_id } = req.hotel_admin;
            const { limit, skip } = req.query;
            const { data, total } = yield configModel.getHeroBGContent({
                hotel_code,
                limit,
                skip,
            }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    createHeroBGContent(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.b2cConfigurationModel(trx);
                const { hotel_code, id: user_id } = req.hotel_admin;
                const body = req.body;
                const files = req.files || [];
                if (!files.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Content is required",
                    };
                }
                const lastOrderNumber = yield configModel.getHeroBGContentLastNo({
                    hotel_code,
                });
                const heroBG = yield configModel.insertHeroBGContent(Object.assign(Object.assign({ hotel_code }, body), { content: files[0].filename, order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1 }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        content: files[0].filename,
                        id: heroBG[0].id,
                    },
                };
            }));
        });
    }
    updateHeroBGContent(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                const { hotel_code, id: user_id } = req.hotel_admin;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const id = Number(req.params.id);
                const check = yield configModel.checkHeroBGContent({ hotel_code, id });
                if (!check.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const files = req.files || [];
                const payload = body;
                if (files.length) {
                    payload.content = files[0].filename;
                }
                if (!Object.keys(payload).length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                yield configModel.updateHeroBGContent(payload, { hotel_code, id });
                if (payload.content && check[0].content) {
                    const heroContent = (0, pagesContent_1.heroBG)(hotel_code);
                    const found = heroContent.find((item) => item.content === check[0].content);
                    if (!found) {
                        yield this.manageFile.deleteFromCloud([check[0].content]);
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { content: payload.content },
                };
            }));
        });
    }
    deleteHeroBGContent(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: user_id } = req.hotel_admin;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const id = Number(req.params.id);
                const check = yield configModel.checkHeroBGContent({ hotel_code, id });
                if (!check.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield configModel.deleteHeroBGContent({ hotel_code, id });
                if (check[0].content) {
                    const heroContent = (0, pagesContent_1.heroBG)(hotel_code);
                    const found = heroContent.find((item) => item.content === check[0].content);
                    if (!found) {
                        yield this.manageFile.deleteFromCloud([check[0].content]);
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    // =========================== FAQ =========================== //
    createFaqHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const isHeadExists = yield configModel.getAllFaqHeads({
                    hotel_code,
                    order: req.body.order_number,
                });
                if (isHeadExists.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "FAQ Head with same order already exists",
                    };
                }
                yield configModel.createFaqHead({
                    hotel_code,
                    title: req.body.title,
                    order_number: req.body.order_number,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    getAllFaqHeads(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const heads = yield configModel.getAllFaqHeads({ hotel_code });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: heads,
                };
            }));
        });
    }
    updateFaqHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { id } = req.params;
                const { hotel_code } = req.hotel_admin;
                const configModel = this.Model.b2cConfigurationModel(trx);
                if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.order_number) {
                    const isHeadExists = yield configModel.getAllFaqHeads({
                        hotel_code,
                        order: req.body.order_number,
                    });
                    if (isHeadExists.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "FAQ Head with same order already exists",
                        };
                    }
                }
                yield configModel.updateFaqHead(req.body, { id: Number(id) });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    deleteFaqHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { hotel_code } = req.hotel_admin;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const isHeadExists = yield configModel.getSingleFaqHeads(Number(id), hotel_code);
                if (isHeadExists) {
                    throw new customEror_1.default("FAQ Head with does not exists", this.StatusCode.HTTP_BAD_REQUEST);
                }
                yield configModel.deleteFaqHead({ id: Number(id) });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    createFaq(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const isHeadExists = yield configModel.getSingleFaqHeads(Number(req.body.faq_head_id), hotel_code);
                if (isHeadExists) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "FAQ Head with id does not exists",
                    };
                }
                const faq = yield configModel.createFaq(Object.assign(Object.assign({}, req.body), { hotel_code }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    getFaqsByHeadId(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { hotel_code } = req.hotel_admin;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const head = yield configModel.getSingleFaqHeads(Number(id), hotel_code);
                if (!head) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "FAQ head not found",
                    };
                }
                const data = yield configModel.getFaqsByHeadId(Number(id), hotel_code);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data,
                };
            }));
        });
    }
    updateFaq(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const isHeadExists = yield configModel.getSingleFaq(Number(req.params.id), hotel_code);
                if (!isHeadExists.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Invalid faq ID",
                    };
                }
                yield configModel.updateFaq(req.body, {
                    hotel_code,
                    id: Number(req.params.id),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Successfully updated",
                };
            }));
        });
    }
    deleteFaq(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const isHeadExists = yield configModel.getSingleFaq(Number(req.params.id), hotel_code);
                if (!isHeadExists.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Invalid faq ID",
                    };
                }
                yield configModel.updateFaq({ is_deleted: true }, {
                    hotel_code,
                    id: Number(req.params.id),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Successfully deleted",
                };
            }));
        });
    }
    // =========================== Amenity Heads =========================== //
    getAllAmenityHeads(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { status, limit, skip, search } = req.query;
                const configModel = this.Model.mConfigurationModel(trx);
                const { data } = yield configModel.getAllAmenitiesHead({
                    status: status,
                    limit: limit,
                    skip: skip,
                    search: search,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data,
                };
            }));
        });
    }
    getAllAmenities(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const id = Number(req.params.id);
                const configModel = this.Model.mConfigurationModel(trx);
                const { data } = yield configModel.getAllAmenities({
                    head_id: id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data,
                };
            }));
        });
    }
    addHotelAmenities(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = req.hotel_admin.hotel_code;
                const { amenity_ids } = req.body;
                const rows = amenity_ids.map((id) => ({
                    hotel_code,
                    amenity_id: id,
                }));
                const configModel = this.Model.b2cConfigurationModel(trx);
                yield configModel.addHotelAmenities(rows);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    getAllHotelAmenities(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = req.hotel_admin.hotel_code;
                const configModel = this.Model.b2cConfigurationModel(trx);
                const data = yield configModel.getAllHotelAmenities(hotel_code);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data,
                };
            }));
        });
    }
}
exports.B2CSubSiteConfigService = B2CSubSiteConfigService;
//# sourceMappingURL=B2CSubSiteConfigService.js.map