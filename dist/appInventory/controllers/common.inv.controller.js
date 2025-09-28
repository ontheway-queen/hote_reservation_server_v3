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
const common_inv_service_1 = __importDefault(require("../services/common.inv.service"));
const common_inv_validator_1 = __importDefault(require("../utils/validation/common.inv.validator"));
class CommonInvController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new common_inv_service_1.default();
        this.validator = new common_inv_validator_1.default();
        //=================== Category ======================//
        // Create Category
        this.createCategory = this.asyncWrapper.wrap({ bodySchema: this.validator.createCommonModuleValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createCategory(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // Get All Category
        this.getAllCategory = this.asyncWrapper.wrap({ querySchema: this.validator.getAllCommonModuleQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.getAllCategory(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        // Update Category
        this.updateCategory = this.asyncWrapper.wrap({ bodySchema: this.validator.UpdateCommonModuleValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.updateCategory(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        // Update Category
        this.deleteCategory = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.deleteCategory(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        //=================== Unit ======================//
        // Create Unit
        this.createUnit = this.asyncWrapper.wrap({ bodySchema: this.validator.createCommonModuleValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.service.createUnit(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        // Get All Unit
        this.getAllUnit = this.asyncWrapper.wrap({ querySchema: this.validator.getAllCommonModuleQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.service.getAllUnit(req), { code } = _f, data = __rest(_f, ["code"]);
            res.status(code).json(data);
        }));
        // Update Unit
        this.updateUnit = this.asyncWrapper.wrap({ bodySchema: this.validator.UpdateCommonModuleValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _g = yield this.service.updateUnit(req), { code } = _g, data = __rest(_g, ["code"]);
            res.status(code).json(data);
        }));
        // Delete Unit
        this.deleteUnit = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _h = yield this.service.deleteUnit(req), { code } = _h, data = __rest(_h, ["code"]);
            res.status(code).json(data);
        }));
        //=================== Brand ======================//
        // Create Brand
        this.createBrand = this.asyncWrapper.wrap({ bodySchema: this.validator.createCommonModuleValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _j = yield this.service.createBrand(req), { code } = _j, data = __rest(_j, ["code"]);
            res.status(code).json(data);
        }));
        // Get All Brand
        this.getAllBrand = this.asyncWrapper.wrap({ querySchema: this.validator.getAllCommonModuleQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _k = yield this.service.getAllBrand(req), { code } = _k, data = __rest(_k, ["code"]);
            res.status(code).json(data);
        }));
        // Update Brand
        this.updateBrand = this.asyncWrapper.wrap({ bodySchema: this.validator.UpdateCommonModuleValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _l = yield this.service.updateBrand(req), { code } = _l, data = __rest(_l, ["code"]);
            res.status(code).json(data);
        }));
        // Delete Brand
        this.deleteBrand = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _m = yield this.service.deleteBrand(req), { code } = _m, data = __rest(_m, ["code"]);
            res.status(code).json(data);
        }));
        //=================== Supplier Controller ======================//
        // create Supplier
        this.createSupplier = this.asyncWrapper.wrap({ bodySchema: this.validator.createSupplierValidatorValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _o = yield this.service.createSupplier(req), { code } = _o, data = __rest(_o, ["code"]);
            res.status(code).json(data);
        }));
        // get All Supplier
        this.getAllSupplier = this.asyncWrapper.wrap({ querySchema: this.validator.getAllSupplierQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _p = yield this.service.getAllSupplier(req), { code } = _p, data = __rest(_p, ["code"]);
            res.status(code).json(data);
        }));
        // get All Supplier payment
        this.getAllSupplierPaymentById = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _q = yield this.service.getAllSupplierPaymentById(req), { code } = _q, data = __rest(_q, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllSupplierInvoiceById = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _r = yield this.service.getAllSupplierInvoiceById(req), { code } = _r, data = __rest(_r, ["code"]);
            res.status(code).json(data);
        }));
        // update Supplier
        this.updateSupplier = this.asyncWrapper.wrap({ bodySchema: this.validator.UpdateSupplierValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _s = yield this.service.updateSupplier(req), { code } = _s, data = __rest(_s, ["code"]);
            res.status(code).json(data);
        }));
        // delete Supplier
        this.deleteSupplier = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _t = yield this.service.deleteSupplier(req), { code } = _t, data = __rest(_t, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = CommonInvController;
//# sourceMappingURL=common.inv.controller.js.map