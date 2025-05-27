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
exports.AccomodationSettingService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class AccomodationSettingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    insertAccomodation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const _a = req.body, { child_age_policies, has_child_rates } = _a, rest = __rest(_a, ["child_age_policies", "has_child_rates"]);
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
                const res = yield model.insertAccomodationSetting(Object.assign(Object.assign({}, rest), { hotel_code,
                    has_child_rates }));
                // insert in child age policies
                if (has_child_rates && child_age_policies) {
                    const payload = child_age_policies.map((item) => {
                        return {
                            hotel_code,
                            age_from: item.age_from,
                            age_to: item.age_to,
                            charge_type: item.charge_type,
                            acs_id: res[0].id,
                        };
                    });
                    yield model.insertChildAgePolicies(payload);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.StatusCode.HTTP_OK,
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
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    data: getAccomodation.length ? getAccomodation[0] : {},
                };
            }));
        });
    }
    updateAccomodation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const _a = req.body, { child_age_policies, has_child_rates, remove_child_age_policies } = _a, rest = __rest(_a, ["child_age_policies", "has_child_rates", "remove_child_age_policies"]);
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
                yield model.updateAccomodationSetting(hotel_code, Object.assign(Object.assign({}, rest), { has_child_rates }));
                // insert in child age policies
                if (has_child_rates && child_age_policies) {
                    const payload = child_age_policies.map((item) => {
                        return {
                            hotel_code,
                            age_from: item.age_from,
                            age_to: item.age_to,
                            charge_type: item.charge_type,
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
}
exports.AccomodationSettingService = AccomodationSettingService;
//# sourceMappingURL=setting.accomodation.service.js.map