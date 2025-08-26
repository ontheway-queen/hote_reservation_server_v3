import { Knex } from "knex";
import AbstractServices from "../../../abstarcts/abstract.service";
import {
  aboutUsContent,
  contactUsContent,
  heroBG,
  privacyAndPolicy,
} from "../../../utils/miscellaneous/siteConfig/pagesContent";
import {
  ICreateHotelB2CHeroBgContentPayload,
  ICreateHotelB2CSiteConfig,
} from "../../utlis/interfaces/configuration.interface";

export class SiteConfigSupportService extends AbstractServices {
  private trx: Knex.Transaction;
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
  }

  public async insertSiteConfigData({
    hotel_code,
    address,
    email,
    phone,
    site_name,
    logo,
  }: {
    hotel_code: number;
    site_name: string;
    address: string;
    phone: string;
    email: string;
    logo: string;
  }) {
    const SiteConfigModel = this.Model.b2cConfigurationModel(this.trx);

    const payload: ICreateHotelB2CSiteConfig = {
      hotel_code,
      about_us_content: aboutUsContent(site_name, address),
      emails: JSON.stringify([{ email }]),
      numbers: JSON.stringify([{ number: phone }]),
      address: JSON.stringify([{ title: "Main Office", address }]),
      contact_us_content: contactUsContent(address, phone, email),
      privacy_policy_content: privacyAndPolicy(site_name),
      terms_and_conditions_content: privacyAndPolicy(site_name),
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

    await SiteConfigModel.insertSiteConfig(payload);

    const heroBGPayload: ICreateHotelB2CHeroBgContentPayload[] =
      heroBG(hotel_code);

    await SiteConfigModel.insertHeroBGContent(heroBGPayload);
  }
}
