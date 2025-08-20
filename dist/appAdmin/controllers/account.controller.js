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
const account_validator_1 = __importDefault(require("../utlis/validator/account.validator"));
const account_service_1 = __importDefault(require("../services/account.service"));
class AccountController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new account_service_1.default();
        this.validator = new account_validator_1.default();
        // public createAccountHead = this.asyncWrapper.wrap(
        //   { bodySchema: this.validator.createAccountHeadValidator },
        //   async (req: Request, res: Response) => {
        //     const { code, ...data } = await this.service.createAccountHead(
        //       req
        //     );
        //     res.status(code).json(data);
        //   }
        // );
        // public getAllAccountHead = this.asyncWrapper.wrap(
        //   { bodySchema: this.validator.createAccountValidator },
        //   async (req: Request, res: Response) => {
        //     const { code, ...data } = await this.service.getAllAccountHead(
        //       req
        //     );
        //     res.status(code).json(data);
        //   }
        // );
        this.getAllGroups = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.service.allGroups(req);
            res.status(200).json(data);
        }));
        this.getallAccHeads = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllAccHeads(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteAccHead = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.service.deleteAccHead(req);
            if (data.success) {
                res.status(200).json(data);
            }
            else {
                this.error("get all products...");
            }
        }));
        this.insertAccHead = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.insertAccHead(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.updateAccHead = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.service.updateAccHead(req);
            if (data.success) {
                res.status(200).json(data);
            }
            else {
                this.error("get all products...");
            }
        }));
        this.allAccVouchers = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.service.allAccVouchers(req);
            if (data.success) {
                res.status(200).json(data);
            }
            else {
                this.error("get all products...");
            }
        }));
        this.generalJournal = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.service.generalJournal(req);
            if (data.success) {
                res.status(200).json(data);
            }
            else {
                this.error("get all products...");
            }
        }));
        this.createAccount = this.asyncWrapper.wrap({ bodySchema: this.validator.createAccountValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.createAccount(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllAccount = this.asyncWrapper.wrap({ querySchema: this.validator.getAllAccountQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.getAllAccount(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        // Update Account
        this.updateAccount = this.asyncWrapper.wrap({ bodySchema: this.validator.updateAccountValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.service.updateAccount(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        // balance transfer
        this.balanceTransfer = this.asyncWrapper.wrap({ bodySchema: this.validator.balanceTransferValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.service.balanceTransfer(req), { code } = _f, data = __rest(_f, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = AccountController;
//# sourceMappingURL=account.controller.js.map