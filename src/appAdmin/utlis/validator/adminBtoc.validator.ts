import Joi from "joi";

export default class AdminBtocValidator {
	public updateBtocSiteConfig = Joi.object({
		site_config: Joi.object({
			// main_logo: Joi.string().optional(),
			hero_quote: Joi.string().optional(),
			hero_sub_quote: Joi.string().optional(),
			site_name: Joi.string().optional(),
			emails: Joi.array()
				.items(
					Joi.object({
						email: Joi.string().required(),
					})
				)
				.optional(),
			numbers: Joi.array()
				.items(
					Joi.object({
						number: Joi.string()
							.pattern(/^\+?\d+$/)
							.required(),
					})
				)
				.optional(),
			address: Joi.array()
				.items(
					Joi.object({
						title: Joi.string().optional(),
						address: Joi.string().optional(),
					})
				)
				.optional(),
			contact_us_content: Joi.string().optional(),
			// contact_us_thumbnail: Joi.string().optional(),
			about_us_content: Joi.string().optional(),
			// about_us_thumbnail: Joi.string().optional(),
			privacy_policy_content: Joi.string().optional(),
			term_and_conditions_content: Joi.string().optional(),
			meta_title: Joi.string().optional(),
			meta_description: Joi.string().optional(),
			meta_tags: Joi.string().optional(),
			notice: Joi.string().optional(),
			android_app_link: Joi.string().optional(),
			ios_app_link: Joi.string().optional(),
			// fav_icon: Joi.string().optional(),
			// site_thumbnail: Joi.string().optional()
		}).optional(),
		hero_bg_content: Joi.object({
			type: Joi.string().valid("image", "video").optional(),
			content: Joi.string().optional(),
			status: Joi.boolean().optional(),
			order_number: Joi.number().optional(),
			quote: Joi.string().optional(),
			sub_quote: Joi.string().optional(),
			tab: Joi.string().optional(),
		}).optional(),
		pop_up_banner: Joi.object({
			title: Joi.string().optional(),
			// thumbnail: Joi.string().optional(),
			description: Joi.string().optional(),
			status: Joi.boolean().optional(),
			link: Joi.string().optional(),
		}).optional(),
		hot_deals: Joi.object({
			title: Joi.string().optional(),
			// thumbnail: Joi.string().optional(),
			status: Joi.boolean().optional(),
			link: Joi.string().optional(),
			order_number: Joi.string().optional(),
		}).optional(),
		social_links: Joi.object({
			media: Joi.string().optional(),
			link: Joi.string().optional(),
			order_number: Joi.number().optional(),
			// icon: Joi.string()
			status: Joi.boolean().optional(),
		}).optional(),
	});
}
