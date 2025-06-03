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
const accountModel_1 = __importDefault(require("../../../models/reservationPanel/accountModel"));
class HelperLib {
    constructor(trx) {
        this.trx = trx;
    }
    // Create head code
    createAccHeadCode({ hotel_code, group_code, parent_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const accHeadModel = new accountModel_1.default(this.trx);
            let newHeadCode = '';
            if (parent_id) {
                const parentHead = yield accHeadModel.getAccountHead({
                    hotel_code,
                    group_code,
                    id: parent_id,
                });
                if (!parentHead.length) {
                    return false;
                }
                const { code: parent_head_code } = parentHead[0];
                const heads = yield accHeadModel.getAccountHead({
                    hotel_code,
                    group_code,
                    parent_id,
                    order_by: 'ah.code',
                    order_to: 'desc',
                });
                if (heads.length) {
                    const { code: child_code } = heads[0];
                    const lastHeadCodeNum = child_code.split('.');
                    const newNum = Number(lastHeadCodeNum[lastHeadCodeNum.length - 1]) + 1;
                    newHeadCode = lastHeadCodeNum.pop();
                    newHeadCode = lastHeadCodeNum.join('.');
                    if (newNum < 10) {
                        newHeadCode += '.00' + newNum;
                    }
                    else if (newNum < 100) {
                        newHeadCode += '.0' + newNum;
                    }
                    else {
                        newHeadCode += '.' + newNum;
                    }
                }
                else {
                    newHeadCode = parent_head_code + '.001';
                }
            }
            else {
                const checkHead = yield accHeadModel.getAccountHead({
                    hotel_code,
                    group_code,
                    parent_id: null,
                    order_by: 'ah.id',
                    order_to: 'desc',
                });
                if (checkHead.length) {
                    newHeadCode = Number(checkHead[0].code) + 1 + '';
                }
                else {
                    newHeadCode = Number(group_code) + 1 + '';
                }
            }
            return newHeadCode;
        });
    }
}
exports.default = HelperLib;
//# sourceMappingURL=helperLib.js.map