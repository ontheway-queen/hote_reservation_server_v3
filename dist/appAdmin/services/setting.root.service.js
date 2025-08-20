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
exports.SettingRootService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const payment_gateway_interface_1 = require("../utlis/interfaces/payment.gateway.interface");
const paymentSettingHelper_1 = __importDefault(require("../utlis/library/paymentSettingHelper"));
const paymentGateway_constant_1 = require("../utlis/library/paymentGateway.constant");
class SettingRootService extends abstract_service_1.default {
    constructor() {
        super();
        this.paymentSettingHelper = new paymentSettingHelper_1.default();
    }
    insertAccomodation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const _a = req.body, { child_age_policies } = _a, rest = __rest(_a, ["child_age_policies"]);
                const model = this.Model.settingModel(trx);
                // get accomodation
                const getAccomodation = yield model.getAccomodation(hotel_code);
                if (getAccomodation.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.HTTP_CONFLICT,
                    };
                }
                // insert in accomodation
                const res = yield model.insertAccomodationSetting(Object.assign(Object.assign({}, rest), { hotel_code }));
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
                    yield model.insertChildAgePolicies(payload);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    getAccomodation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const getAccomodation = yield this.Model.settingModel().getAccomodation(hotel_code);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: getAccomodation.length ? getAccomodation[0] : {},
                };
            }));
        });
    }
    updateAccomodation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const _a = req.body, { add_child_age_policies, remove_child_age_policies } = _a, rest = __rest(_a, ["add_child_age_policies", "remove_child_age_policies"]);
                const model = this.Model.settingModel(trx);
                // get accomodation
                const getAccomodation = yield model.getAccomodation(hotel_code);
                if (!getAccomodation.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (rest.check_in_time || rest.check_out_time) {
                    yield model.updateAccomodationSetting(hotel_code, Object.assign({}, rest));
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
                    yield model.insertChildAgePolicies(payload);
                }
                if (remove_child_age_policies) {
                    yield model.deleteChildAgePolicies(hotel_code, remove_child_age_policies);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    insertCancellationPolicy(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { policy_name, description, rules } = req.body;
                const model = this.Model.settingModel(trx);
                // get cancellation policy
                const getCancellationPolicy = yield model.getAllCancellationPolicy({
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
                const res = yield model.insertCancellationPolicy({
                    policy_name,
                    hotel_code,
                    description,
                });
                const payload = rules.map((item) => {
                    return Object.assign({ cancellation_policy_id: res[0].id }, item);
                });
                yield model.insertCancellationPolicyRules(payload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    getAllCancellationPolicy(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const data = yield this.Model.settingModel().getAllCancellationPolicy({
                    hotel_code,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    data: data,
                };
            }));
        });
    }
    getSingleCancellationPolicy(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const data = yield this.Model.settingModel().getSingleCancellationPolicy(hotel_code, parseInt(req.params.id));
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
            }));
        });
    }
    updateCancellationPolicy(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { policy_name, description, add_rules, remove_rules } = req.body;
                const model = this.Model.settingModel(trx);
                if (policy_name) {
                    // get cancellation policy
                    const getCancellationPolicy = yield model.getAllCancellationPolicy({
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
                    yield model.updateCancellationPolicy(hotel_code, parseInt(req.params.id), {
                        policy_name,
                        description,
                    });
                }
                if (add_rules) {
                    const payload = add_rules.map((item) => {
                        return Object.assign({ cancellation_policy_id: parseInt(req.params.id) }, item);
                    });
                    yield model.insertCancellationPolicyRules(payload);
                }
                if (remove_rules === null || remove_rules === void 0 ? void 0 : remove_rules.length) {
                    yield model.deleteCancellationPolicyRules(parseInt(req.params.id), remove_rules);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    deleteSingleCancellationPolicy(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const data = yield this.Model.settingModel().getSingleCancellationPolicy(hotel_code, parseInt(req.params.id));
                if (!data.length) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield this.Model.settingModel().updateCancellationPolicy(hotel_code, parseInt(req.params.id), {
                    is_deleted: true,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: data[0],
                };
            }));
        });
    }
    getAllMealPlan(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.settingModel().getAllMealPlan({});
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getAllSources(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const data = yield this.Model.settingModel().getAllSources({});
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    data,
                };
            }));
        });
    }
    getChildAgePolicies(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.settingModel().getChildAgePolicies(req.hotel_admin.hotel_code);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data ? data : {},
            };
        });
    }
    createPaymentGatewaySetting(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, hotel_code } = req.hotel_admin;
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const paymentModel = this.Model.paymentModel(trx);
                const checkExists = yield paymentModel.getPaymentGateway({
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
                const files = req.files;
                if (!files.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Please upload a logo",
                    };
                }
                logo = files[0].filename;
                if (body.type === payment_gateway_interface_1.PAYMENT_TYPE.BRAC_BANK) {
                    this.paymentSettingHelper.validateRequiredFields(body, paymentGateway_constant_1.requiredFieldForBracBank);
                }
                else if (body.type === payment_gateway_interface_1.PAYMENT_TYPE.PAYPAL) {
                    this.paymentSettingHelper.validateRequiredFields(body, paymentGateway_constant_1.requiredFieldForPaypal);
                }
                else if (body.type === payment_gateway_interface_1.PAYMENT_TYPE.NGENIUS) {
                    this.paymentSettingHelper.validateRequiredFields(body, paymentGateway_constant_1.requiredFieldForNgenius);
                }
                else if (body.type === payment_gateway_interface_1.PAYMENT_TYPE.MAMO_PAY) {
                    this.paymentSettingHelper.validateRequiredFields(body, paymentGateway_constant_1.requiredFieldForMamoPay);
                }
                const res = yield paymentModel.createPaymentGateway({
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
                    yield paymentModel.updatePaymentGateway({
                        payload: { is_default: 0 },
                        whereNotId: res[0].id,
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    //   get payment gateway info
    getAllPaymentGatewaySetting(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const model = this.Model.paymentModel();
            const data = yield model.getPaymentGateway(Object.assign(Object.assign({}, req.query), { hotel_code }));
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    //   update payment gateway info
    updatePaymentGatewaySetting(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: created_by, hotel_code } = req.hotel_admin;
            const { id } = req.params;
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.paymentModel(trx);
                const check = yield model.getPaymentGateway({
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
                if (check[0].title === payment_gateway_interface_1.PAYMENT_TYPE.MFS) {
                    const allowedFields = ["is_default", "status"];
                    const filteredBody = Object.keys(body).filter((key) => !allowedFields.includes(key));
                    if (filteredBody.length > 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: `Only 'is_default' and 'status' fields are allowed for ${payment_gateway_interface_1.PAYMENT_TYPE.MFS}`,
                        };
                    }
                }
                const files = req.files;
                if (files.length) {
                    body.logo = files[0].filename;
                }
                yield model.updatePaymentGateway({ payload: body, id: Number(id) });
                if (body.is_default) {
                    yield model.updatePaymentGateway({
                        payload: { is_default: 0 },
                        whereNotId: Number(id),
                    });
                }
                const checkMinimumOneActiveAndDefault = yield model.getPaymentGateway({
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
                if (check[0].title !== payment_gateway_interface_1.PAYMENT_TYPE.MFS) {
                    const checkAfterUpdate = yield model.getPaymentGateway({
                        hotel_code,
                        id: Number(id),
                    });
                    if (checkAfterUpdate[0].title === payment_gateway_interface_1.PAYMENT_TYPE.BRAC_BANK) {
                        this.paymentSettingHelper.validateRequiredFields(checkAfterUpdate[0], paymentGateway_constant_1.requiredFieldForBracBank);
                    }
                    if (checkAfterUpdate[0].title === payment_gateway_interface_1.PAYMENT_TYPE.PAYPAL) {
                        this.paymentSettingHelper.validateRequiredFields(checkAfterUpdate[0], paymentGateway_constant_1.requiredFieldForPaypal);
                    }
                    if (checkAfterUpdate[0].title === payment_gateway_interface_1.PAYMENT_TYPE.NGENIUS) {
                        this.paymentSettingHelper.validateRequiredFields(checkAfterUpdate[0], paymentGateway_constant_1.requiredFieldForNgenius);
                    }
                    if (checkAfterUpdate[0].title === payment_gateway_interface_1.PAYMENT_TYPE.MAMO_PAY) {
                        this.paymentSettingHelper.validateRequiredFields(checkAfterUpdate[0], paymentGateway_constant_1.requiredFieldForMamoPay);
                    }
                }
                if (check[0].logo && files.length) {
                    yield this.manageFile.deleteFromCloud([check[0].logo]);
                }
                return {
                    success: true,
                    message: "Payment Gateway setting successfully updated",
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
}
exports.SettingRootService = SettingRootService;
//# sourceMappingURL=setting.root.service.js.map