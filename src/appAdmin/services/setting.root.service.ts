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
import {
  IGetPaymentGatewayQuery,
  IPaymentGatewaySettingPayload,
  IUpdatePaymentGatewaySetting,
  PAYMENT_TYPE,
} from "../utlis/interfaces/payment.gateway.interface";
import PaymentSettingHelper from "../utlis/library/paymentSettingHelper";
import {
  requiredFieldForBracBank,
  requiredFieldForMamoPay,
  requiredFieldForNgenius,
  requiredFieldForPaypal,
} from "../utlis/library/paymentGateway.constant";

export class SettingRootService extends AbstractServices {
  private paymentSettingHelper = new PaymentSettingHelper();
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

      const getAccomodation = await this.Model.settingModel().getAccomodation(
        hotel_code
      );

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
      const { add_child_age_policies, remove_child_age_policies, ...rest } =
        req.body as IAccomodationUpdateReqBodyPayload;

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

      const data = await this.Model.settingModel().getAllCancellationPolicy({
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

      const data = await this.Model.settingModel().getSingleCancellationPolicy(
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

      const data = await this.Model.settingModel().getSingleCancellationPolicy(
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

  public async createPaymentGatewaySetting(req: Request) {
    const { id, hotel_code } = req.hotel_admin;
    const body = req.body as IPaymentGatewaySettingPayload;
    return await this.db.transaction(async (trx) => {
      const paymentModel = this.Model.paymentModel(trx);

      const checkExists = await paymentModel.getPaymentGateway({
        type: body.type,
        hotel_code,
      });

      if (checkExists.length) {
        return {
          success: false,
          message: this.ResMsg.HTTP_CONFLICT,
          code: this.StatusCode.HTTP_CONFLICT,
        };
      }

      let logo = "";
      const files = req.files as Express.Multer.File[];
      if (!files.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Please upload a logo",
        };
      }
      logo = files[0].filename;

      if (body.type === PAYMENT_TYPE.BRAC_BANK) {
        this.paymentSettingHelper.validateRequiredFields(
          body,
          requiredFieldForBracBank
        );
      } else if (body.type === PAYMENT_TYPE.PAYPAL) {
        this.paymentSettingHelper.validateRequiredFields(
          body,
          requiredFieldForPaypal
        );
      } else if (body.type === PAYMENT_TYPE.NGENIUS) {
        this.paymentSettingHelper.validateRequiredFields(
          body,
          requiredFieldForNgenius
        );
      } else if (body.type === PAYMENT_TYPE.MAMO_PAY) {
        this.paymentSettingHelper.validateRequiredFields(
          body,
          requiredFieldForMamoPay
        );
      }

      const res = await paymentModel.createPaymentGateway({
        hotel_code,
        created_by: id,
        details: body.details,
        title: body.title,
        bank_charge: body.bank_charge,
        bank_charge_type: body.bank_charge_type,
        is_default: body.is_default || 0,
        logo,
        type: body.type,
      });

      if (body.is_default) {
        await paymentModel.updatePaymentGateway({
          payload: { is_default: 0 },
          whereNotId: res[0].id,
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  //   get payment gateway info
  public async getAllPaymentGatewaySetting(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const model = this.Model.paymentModel();
    const data = await model.getPaymentGateway({
      ...req.query,
      hotel_code,
    } as unknown as IGetPaymentGatewayQuery);
    return {
      success: true,
      message: this.ResMsg.HTTP_OK,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  //   update payment gateway info
  public async updatePaymentGatewaySetting(req: Request) {
    const { id: created_by, hotel_code } = req.hotel_admin;
    const { id } = req.params;
    const body = req.body as IUpdatePaymentGatewaySetting;
    return await this.db.transaction(async (trx) => {
      const model = this.Model.paymentModel(trx);
      const check = await model.getPaymentGateway({
        hotel_code,
        id: Number(id),
      });

      if (!check.length) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }

      if (check[0].title === PAYMENT_TYPE.MFS) {
        const allowedFields = ["is_default", "status"];
        const filteredBody = Object.keys(body).filter(
          (key) => !allowedFields.includes(key)
        );

        if (filteredBody.length > 0) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: `Only 'is_default' and 'status' fields are allowed for ${PAYMENT_TYPE.MFS}`,
          };
        }
      }

      const files = req.files as Express.Multer.File[];
      if (files.length) {
        body.logo = files[0].filename;
      }

      await model.updatePaymentGateway({ payload: body, id: Number(id) });
      if (body.is_default) {
        await model.updatePaymentGateway({
          payload: { is_default: 0 },
          whereNotId: Number(id),
        });
      }
      const checkMinimumOneActiveAndDefault = await model.getPaymentGateway({
        hotel_code,
        is_default: 1,
        status: 1,
      });

      if (!checkMinimumOneActiveAndDefault.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Minium One Payment Gateway should Active and Default",
        };
      }
      if (check[0].title !== PAYMENT_TYPE.MFS) {
        const checkAfterUpdate = await model.getPaymentGateway({
          hotel_code,
          id: Number(id),
        });

        if (checkAfterUpdate[0].title === PAYMENT_TYPE.BRAC_BANK) {
          this.paymentSettingHelper.validateRequiredFields(
            checkAfterUpdate[0],
            requiredFieldForBracBank
          );
        }
        if (checkAfterUpdate[0].title === PAYMENT_TYPE.PAYPAL) {
          this.paymentSettingHelper.validateRequiredFields(
            checkAfterUpdate[0],
            requiredFieldForPaypal
          );
        }
        if (checkAfterUpdate[0].title === PAYMENT_TYPE.NGENIUS) {
          this.paymentSettingHelper.validateRequiredFields(
            checkAfterUpdate[0],
            requiredFieldForNgenius
          );
        }
        if (checkAfterUpdate[0].title === PAYMENT_TYPE.MAMO_PAY) {
          this.paymentSettingHelper.validateRequiredFields(
            checkAfterUpdate[0],
            requiredFieldForMamoPay
          );
        }
      }
      if (check[0].logo && files.length) {
        await this.manageFile.deleteFromCloud([check[0].logo]);
      }

      return {
        success: true,
        message: "Payment Gateway setting successfully updated",
        code: this.StatusCode.HTTP_OK,
      };
    });
  }
}
