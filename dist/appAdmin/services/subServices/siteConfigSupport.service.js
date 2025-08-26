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
exports.SiteConfigSupportService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstarcts/abstract.service"));
const pagesContent_1 = require("../../../utils/miscellaneous/siteConfig/pagesContent");
class SiteConfigSupportService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
    }
    insertSiteConfigData({ hotel_code, address, email, phone, site_name, logo, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const SiteConfigModel = this.Model.b2cConfigurationModel(this.trx);
            const payload = {
                hotel_code,
                about_us_content: (0, pagesContent_1.aboutUsContent)(site_name, address),
                emails: JSON.stringify([{ email }]),
                numbers: JSON.stringify([{ number: phone }]),
                address: JSON.stringify([{ title: "Main Office", address }]),
                contact_us_content: (0, pagesContent_1.contactUsContent)(address, phone, email),
                privacy_policy_content: (0, pagesContent_1.privacyAndPolicy)(site_name),
                terms_and_conditions_content: (0, pagesContent_1.privacyAndPolicy)(site_name),
                site_name,
                hero_quote: `Welcome to ${site_name}!`,
                hero_sub_quote: "Find Flights, Hotels, Visa & Holidays",
                main_logo: logo,
                site_thumbnail: "",
                about_us_thumbnail: "",
                contact_us_thumbnail: "",
                favicon: "",
                meta_description: `Welcome to ${site_name}`,
                meta_title: ` ${site_name}`,
                notice: `Welcome to ${site_name}`,
            };
            yield SiteConfigModel.insertSiteConfig(payload);
            const heroBGPayload = (0, pagesContent_1.heroBG)(hotel_code);
            yield SiteConfigModel.insertHeroBGContent(heroBGPayload);
        });
    }
}
exports.SiteConfigSupportService = SiteConfigSupportService;
//# sourceMappingURL=siteConfigSupport.service.js.map