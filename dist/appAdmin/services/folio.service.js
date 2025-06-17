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
exports.FolioService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const helperFunction_1 = require("../utlis/library/helperFunction");
class FolioService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createFolio(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { booking_id, name } = req.body;
                const invoiceModel = this.Model.hotelInvoiceModel(trx);
                const reservationModel = this.Model.reservationModel(trx);
                const checkSingleBooking = yield reservationModel.getSingleBooking(hotel_code, booking_id);
                if (!checkSingleBooking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const [lastFolio] = yield invoiceModel.getLasFolioId();
                const folio_number = helperFunction_1.HelperFunction.generateFolioNumber(lastFolio === null || lastFolio === void 0 ? void 0 : lastFolio.id);
                yield invoiceModel.insertInFolio({
                    booking_id,
                    name,
                    folio_number,
                    hotel_code,
                    type: "Custom",
                    status: "open",
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Folio has been created",
                };
            }));
        });
    }
}
exports.FolioService = FolioService;
//# sourceMappingURL=folio.service.js.map