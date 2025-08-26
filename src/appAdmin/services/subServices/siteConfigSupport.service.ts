import { Knex } from "knex";
import AbstractServices from "../../../abstarcts/abstract.service";
import {
  aboutUsContent,
  contactUsContent,
  heroBG,
  privacyAndPolicy,
} from "../../../utils/miscellaneous/siteConfig/pagesContent";

export class SiteConfigSupportService extends AbstractServices {
  private trx: Knex.Transaction;
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
  }

  public async insertSiteConfigData({
    agency_id,
    address,
    email,
    phone,
    site_name,
    logo,
  }: {
    agency_id: number;
    site_name: string;
    address: string;
    phone: string;
    email: string;
    logo: string;
  }) {
    const SiteConfigModel = this.Model.b2cConfigurationModel(this.trx);

    const payload: ICreateAgencyB2CSiteConfig = {
      agency_id,
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
      site_thumbnail: "agent/b2c/site-config/site-thumbnail.jpg",
      about_us_thumbnail: "agent/b2c/site-config/about-us.png",
      contact_us_thumbnail: "agent/b2c/site-config/contact-us.jpg",
      favicon: "agent/b2c/site-config/favicon.png",
      meta_description: `Welcome to ${site_name}, The ultimate online platform for ota services! Book air tickets, hotels, visa, tour package without hassle at the most competitive rates.`,
      meta_tags: `${site_name}, flight booking, cheap hotels, tour packages, visa services, travel deals, online travel agency`,
      meta_title: ` ${site_name} | Book Flights, Hotel, Tour, Visa Online`,
      notice: `Welcome to ${site_name}`,
    };

    await SiteConfigModel.insertSiteConfig(payload);

    const heroBGPayload: ICreateB2CHeroBgContentPayload[] = heroBG(agency_id);

    await SiteConfigModel.insertHeroBGContent(heroBGPayload);
  }
}
