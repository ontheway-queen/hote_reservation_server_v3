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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_controllers_1 = __importDefault(require("../../../abstracts/abstract.controllers"));
const doubleEntry_services_1 = __importDefault(require("./doubleEntry.services"));
class DoubleEntryController extends abstract_controllers_1.default {
    constructor() {
        super();
        this.services = new doubleEntry_services_1.default();
        this.allGroups = this.asyncWrapper.wrap([], (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.services.allGroups(req);
            if (data.success) {
                res.status(200).json(data);
            }
            else {
                this.error('get all products...');
            }
        }));
        this.allAccHeads = this.asyncWrapper.wrap([], (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.services.allAccHeads(req);
            if (data.success) {
                res.status(200).json(data);
            }
            else {
                this.error('get all products...');
            }
        }));
        this.deleteAccHead = this.asyncWrapper.wrap([], (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.services.deleteAccHead(req);
            if (data.success) {
                res.status(200).json(data);
            }
            else {
                this.error('get all products...');
            }
        }));
        this.insertAccHead = this.asyncWrapper.wrap([], (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.services.insertAccHead(req);
            if (data.success) {
                res.status(200).json(data);
            }
            else {
                this.error('get all products...');
            }
        }));
        this.updateAccHead = this.asyncWrapper.wrap([], (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.services.updateAccHead(req);
            if (data.success) {
                res.status(200).json(data);
            }
            else {
                this.error('get all products...');
            }
        }));
        this.allAccVouchers = this.asyncWrapper.wrap([], (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.services.allAccVouchers(req);
            if (data.success) {
                res.status(200).json(data);
            }
            else {
                this.error('get all products...');
            }
        }));
        this.generalJournal = this.asyncWrapper.wrap([], (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.services.generalJournal(req);
            if (data.success) {
                res.status(200).json(data);
            }
            else {
                this.error('get all products...');
            }
        }));
    }
}
exports.default = DoubleEntryController;
//# sourceMappingURL=doubleEntry.controllers.js.map