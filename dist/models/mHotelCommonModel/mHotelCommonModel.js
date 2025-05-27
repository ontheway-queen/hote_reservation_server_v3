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
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class MHotelCommonModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getAllAccomodation({ status }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("accomodation_type")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where((query) => {
                if (status) {
                    query.where("status", status);
                }
            });
        });
    }
    getAllCity({ limit, skip, search, country_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("city")
                .withSchema(this.PUBLIC_SCHEMA)
                .select("*")
                .where((query) => {
                if (search) {
                    query.where("status", "ilike", `%${search}%`);
                }
                if (country_code) {
                    query.where("country_code", country_code);
                }
            })
                .limit(limit || 30)
                .offset(skip || 0);
        });
    }
    getAllCountry({ limit, skip, search, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("country")
                .withSchema(this.PUBLIC_SCHEMA)
                .select("*")
                .where((query) => {
                if (search) {
                    query
                        .where("country_code_2_letter", "ilike", `%${search}%`)
                        .orWhere("country_name", "ilike", `${search}`);
                }
            })
                .limit(limit || 30)
                .offset(skip || 0);
        });
    }
}
exports.default = MHotelCommonModel;
//# sourceMappingURL=mHotelCommonModel.js.map