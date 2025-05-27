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
exports.generateNextGroupCode = void 0;
const abstract_services_1 = __importDefault(require("../../../abstracts/abstract.services"));
const doubleEntry_utils_1 = require("./doubleEntry.utils");
class DoubleEntryServices extends abstract_services_1.default {
    constructor() {
        super();
        // GROUPS
        this.allGroups = (req) => __awaiter(this, void 0, void 0, function* () {
            const conn = this.models.doubleEntry(req);
            const data = yield conn.allGroups();
            return { success: true, data };
        });
        //   ACCOUNT HEAD
        this.allAccHeads = (req) => __awaiter(this, void 0, void 0, function* () {
            const conn = this.models.doubleEntry(req);
            const query = req.query;
            const data = yield conn.allAccHeads(query);
            return Object.assign({ success: true }, data);
        });
        // INSERT ACCOUNT HEAD
        this.insertAccHead = (req) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.accountHeadInserter(req, req.body);
            return { success: true, data };
        });
        this.updateAccHead = (req) => __awaiter(this, void 0, void 0, function* () {
            const conn = this.models.doubleEntry(req);
            const body = req.body;
            const id = req.params.id;
            const data = yield conn.updateAccHead(body, id);
            return { success: true, data };
        });
        this.deleteAccHead = (req) => __awaiter(this, void 0, void 0, function* () {
            const conn = this.models.doubleEntry(req);
            const id = req.params.id;
            const data = yield conn.deleteAccHead(id);
            return { success: true, data };
        });
        //   ACCOUNT VOUCHERS
        this.allAccVouchers = (req) => __awaiter(this, void 0, void 0, function* () {
            const conn = this.models.doubleEntry(req);
            const data = yield conn.allAccVouchers();
            return { success: true, data };
        });
        this.generalJournal = (req) => __awaiter(this, void 0, void 0, function* () {
            const conn = this.models.doubleEntry(req);
            const vouchers = yield conn.allAccVouchers();
            const data = (0, doubleEntry_utils_1.journalFormatter)(vouchers);
            return { success: true, data };
        });
        // ============= UTILS ==============
        this.accountHeadInserter = (req, data, trx1) => __awaiter(this, void 0, void 0, function* () {
            const { head_group_code, head_name, head_parent_id, isParent } = data;
            return yield this.models.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const conn = this.models.doubleEntry(req, trx1 || trx);
                const payload = [];
                if (head_parent_id) {
                    let lastHeadCode;
                    if (isParent) {
                        lastHeadCode = yield conn.getLastHeadCodeByParent(head_parent_id);
                    }
                    else {
                        const { head_code } = yield conn.getHeadCodeByHeadId(head_parent_id);
                        const headData = yield conn.getLastHeadCodeByHeadCode(head_code);
                        if (head_parent_id === (headData === null || headData === void 0 ? void 0 : headData.head_id)) {
                            lastHeadCode = headData.head_code + '.000';
                        }
                        else {
                            lastHeadCode = headData.head_code;
                        }
                    }
                    for (const [index, item] of head_name.entries()) {
                        const head_code = (0, exports.generateNextGroupCode)(lastHeadCode, index, isParent);
                        payload.push({
                            head_agency_id: req.agency_id,
                            head_code,
                            head_created_by: req.user_id,
                            head_group_code,
                            head_name: item,
                            head_parent_id,
                        });
                    }
                }
                else {
                    const headData = yield conn.getHeadCodeByGroup(head_group_code);
                    if (headData) {
                        const spHead = headData.head_code.split('.');
                        spHead.pop;
                    }
                    const baseHeadCode = (headData === null || headData === void 0 ? void 0 : headData.head_code)
                        ? Number(headData.head_code) + 1
                        : Number(head_group_code);
                    for (const [index, item] of head_name.entries()) {
                        payload.push({
                            head_agency_id: req.agency_id,
                            head_code: baseHeadCode + index,
                            head_created_by: req.user_id,
                            head_group_code,
                            head_name: item,
                            head_parent_id,
                        });
                    }
                }
                return yield conn.insertAccHead(payload);
            }));
        });
    }
}
exports.default = DoubleEntryServices;
const generateNextGroupCode = (lastCode, sumNum, isParent) => {
    let parts = lastCode === null || lastCode === void 0 ? void 0 : lastCode.split('.');
    if (parts.length === 1 && !isParent) {
        parts.push('000');
    }
    let lastPart = parseInt(parts.pop(), 10) + 1 + (sumNum || 0);
    parts.push(lastPart.toString().padStart(3, '0'));
    return parts.join('.');
};
exports.generateNextGroupCode = generateNextGroupCode;
//# sourceMappingURL=doubleEntry.services.js.map