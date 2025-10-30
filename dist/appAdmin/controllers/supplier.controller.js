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
const abstract_controller_1 = __importDefault(require("../../abstarcts/abstract.controller"));
const supplier_service_1 = __importDefault(require("../services/supplier.service"));
const hrConfiguration_validator_1 = __importDefault(require("../utlis/validator/hrConfiguration.validator"));
class SupplierController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new supplier_service_1.default();
        this.validator = new hrConfiguration_validator_1.default();
        this.createSupplier = this.asyncWrapper.wrap({ bodySchema: this.validator.createSupplierValidatorValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createSupplier(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllSupplier = this.asyncWrapper.wrap({ querySchema: this.validator.getAllSupplierQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.getAllSupplier(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleSupplierPaymentById = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.getSingleSupplierPaymentById(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllSupplierInvoiceById = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.getAllSupplierInvoiceById(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        this.updateSupplier = this.asyncWrapper.wrap({ bodySchema: this.validator.UpdateSupplierValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.service.updateSupplier(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteSupplier = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.service.deleteSupplier(req), { code } = _f, data = __rest(_f, ["code"]);
            res.status(code).json(data);
        }));
        this.supplierPayment = this.asyncWrapper.wrap({
            bodySchema: this.validator.supplierPayment,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _g = yield this.service.supplierPayment(req), { code } = _g, data = __rest(_g, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllSupplierPayment = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _h = yield this.service.getAllSupplierPayment(req), { code } = _h, data = __rest(_h, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllSupplierTransaction = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _j = yield this.service.getAllSupplierTransaction(req), { code } = _j, data = __rest(_j, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleSupplierTransaction = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _k = yield this.service.getSingleSupplierTransaction(req), { code } = _k, data = __rest(_k, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = SupplierController;
//# sourceMappingURL=supplier.controller.js.map