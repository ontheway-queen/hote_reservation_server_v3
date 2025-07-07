import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

import {
	IAccomodationReqBodyPayload,
	IAccomodationUpdateReqBodyPayload,
	IcancellationPolicyReqBodyPayload,
	IRoomMealOption,
	IUpdatecancellationPolicyReqBodyPayload,
	IUpdateRoomMealOption,
} from "../utlis/interfaces/setting.interface";

export class SettingRootService extends AbstractServices {
	constructor() {
		super();
	}

	public async insertAccomodation(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const { child_age_policies, ...rest } =
				req.body as IAccomodationReqBodyPayload;

			const model = this.Model.settingModel(trx);

			// get accomodation
			const getAccomodation = await model.getAccomodation(hotel_code);

			if (getAccomodation.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: this.ResMsg.HTTP_CONFLICT,
				};
			}

			// insert in accomodation
			const res = await model.insertAccomodationSetting({
				...rest,
				hotel_code,
			});

			// insert in child age policies
			if (child_age_policies) {
				const payload = child_age_policies.map((item) => {
					return {
						hotel_code,
						age_from: item.age_from,
						age_to: item.age_to,
						charge_value: item.charge_value,
						charge_type: item.charge_type,
						acs_id: res[0].id,
					};
				});

				await model.insertChildAgePolicies(payload);
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}

	public async getAccomodation(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;

			const getAccomodation =
				await this.Model.settingModel().getAccomodation(hotel_code);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				data: getAccomodation.length ? getAccomodation[0] : {},
			};
		});
	}

	public async updateAccomodation(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const {
				add_child_age_policies,
				remove_child_age_policies,
				...rest
			} = req.body as IAccomodationUpdateReqBodyPayload;

			const model = this.Model.settingModel(trx);

			// get accomodation
			const getAccomodation = await model.getAccomodation(hotel_code);

			if (!getAccomodation.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			if (rest.check_in_time || rest.check_out_time) {
				await model.updateAccomodationSetting(hotel_code, {
					...rest,
				});
			}

			// insert in child age policies
			if (add_child_age_policies) {
				const payload = add_child_age_policies.map((item) => {
					return {
						hotel_code,
						age_from: item.age_from,
						age_to: item.age_to,
						charge_type: item.charge_type,
						charge_value: item.charge_value,
						acs_id: getAccomodation[0].id,
					};
				});

				await model.insertChildAgePolicies(payload);
			}

			if (remove_child_age_policies) {
				await model.deleteChildAgePolicies(
					hotel_code,
					remove_child_age_policies
				);
			}
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}

	public async insertCancellationPolicy(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const { policy_name, description, rules } =
				req.body as IcancellationPolicyReqBodyPayload;

			const model = this.Model.settingModel(trx);

			// get cancellation policy
			const getCancellationPolicy = await model.getAllCancellationPolicy({
				hotel_code,
				search: policy_name,
			});

			if (getCancellationPolicy.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: this.ResMsg.HTTP_CONFLICT,
				};
			}

			// insert in accomodation
			const res = await model.insertCancellationPolicy({
				policy_name,
				hotel_code,
				description,
			});

			const payload = rules.map((item) => {
				return {
					cancellation_policy_id: res[0].id,
					...item,
				};
			});

			await model.insertCancellationPolicyRules(payload);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}

	public async getAllCancellationPolicy(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;

			const data =
				await this.Model.settingModel().getAllCancellationPolicy({
					hotel_code,
				});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				data: data,
			};
		});
	}

	public async getSingleCancellationPolicy(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;

			const data =
				await this.Model.settingModel().getSingleCancellationPolicy(
					hotel_code,
					parseInt(req.params.id)
				);

			if (!data.length) {
				return {
					success: true,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				data: data[0],
			};
		});
	}

	public async updateCancellationPolicy(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const { policy_name, description, add_rules, remove_rules } =
				req.body as IUpdatecancellationPolicyReqBodyPayload;

			const model = this.Model.settingModel(trx);

			if (policy_name) {
				// get cancellation policy
				const getCancellationPolicy =
					await model.getAllCancellationPolicy({
						hotel_code,
						search: policy_name,
					});

				if (getCancellationPolicy.length) {
					return {
						success: false,
						code: this.StatusCode.HTTP_CONFLICT,
						message: this.ResMsg.HTTP_CONFLICT,
					};
				}
			}

			if (policy_name || description) {
				await model.updateCancellationPolicy(
					hotel_code,
					parseInt(req.params.id),
					{
						policy_name,
						description,
					}
				);
			}

			if (add_rules) {
				const payload = add_rules.map((item) => {
					return {
						cancellation_policy_id: parseInt(req.params.id),
						...item,
					};
				});

				await model.insertCancellationPolicyRules(payload);
			}

			if (remove_rules?.length) {
				await model.deleteCancellationPolicyRules(
					parseInt(req.params.id),
					remove_rules
				);
			}
			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}

	public async deleteSingleCancellationPolicy(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;

			const data =
				await this.Model.settingModel().getSingleCancellationPolicy(
					hotel_code,
					parseInt(req.params.id)
				);

			if (!data.length) {
				return {
					success: true,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			await this.Model.settingModel().updateCancellationPolicy(
				hotel_code,
				parseInt(req.params.id),
				{
					is_deleted: true,
				}
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				data: data[0],
			};
		});
	}

	public async getAllMealPlan(req: Request) {
		const data = await this.Model.settingModel().getAllMealPlan({});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async getAllSources(req: Request) {
		return await this.db.transaction(async (trx) => {
			const data = await this.Model.settingModel().getAllSources({});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				data,
			};
		});
	}

	public async getChildAgePolicies(req: Request) {
		const data = await this.Model.settingModel().getChildAgePolicies(
			req.hotel_admin.hotel_code
		);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data: data ? data : {},
		};
	}
}
