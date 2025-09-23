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
const product_service_1 = __importDefault(require("../services/product.service"));
const product_validator_1 = __importDefault(require("../utils/validation/product.validator"));
class ProductInvController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new product_service_1.default();
        this.validator = new product_validator_1.default();
        this.createProduct = this.asyncWrapper.wrap({ bodySchema: this.validator.createProductInvValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createProduct(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllProduct = this.asyncWrapper.wrap({ querySchema: this.validator.getAllProductInvValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.getAllProduct(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.updateProduct = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamStringValidator(),
            bodySchema: this.validator.updateProductInvValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.updateProduct(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        //=================== Damaged Product  ======================//
        this.createDamagedProduct = this.asyncWrapper.wrap({ bodySchema: this.validator.createDamagedProductValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.createDamagedProduct(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllDamagedProduct = this.asyncWrapper.wrap({ querySchema: this.validator.getAllDamagedProductValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.service.getAllDamagedProduct(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleDamagedProduct = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.service.getSingleDamagedProduct(req), { code } = _f, data = __rest(_f, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = ProductInvController;
//# sourceMappingURL=product.controller.js.map