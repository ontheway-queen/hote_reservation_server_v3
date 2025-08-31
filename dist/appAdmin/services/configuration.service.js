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
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
class ConfigurationService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // ======================= Shift ======================= //
    createShift(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const body = req.body;
                body.hotel_code = hotel_code;
                const hrConfigurationModel = this.Model.hrModel(trx);
                const { data } = yield hrConfigurationModel.getAllShifts({
                    name: body.name,
                    hotel_code,
                });
                if (data.length > 0) {
                    throw new customEror_1.default("Shift with this name already exists", this.StatusCode.HTTP_CONFLICT);
                }
                yield hrConfigurationModel.createShift(body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Shift has been created",
                };
            }));
        });
    }
    getAllShifts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { name, limit, skip } = req.query;
                const hrConfigurationModel = this.Model.hrModel(trx);
                const { data, total } = yield hrConfigurationModel.getAllShifts({
                    name: name,
                    hotel_code,
                    skip: Number(skip),
                    limit: Number(limit),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Shifts fetched successfully",
                    total,
                    data,
                };
            }));
        });
    }
    getSingleShift(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const id = Number(req.params.id);
                const hrConfigurationModel = this.Model.hrModel(trx);
                const data = yield hrConfigurationModel.getSingleShift({
                    id,
                    hotel_code,
                });
                if (!data) {
                    throw new customEror_1.default("Shift not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Shift fetched successfully",
                    data,
                };
            }));
        });
    }
    updateShift(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const id = Number(req.params.id);
                const payload = req.body;
                const hrConfigurationModel = this.Model.hrModel(trx);
                const data = yield hrConfigurationModel.getSingleShift({
                    id,
                    hotel_code,
                });
                if (!data) {
                    throw new customEror_1.default("Shift not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                const { data: nameAlreadyExists } = yield hrConfigurationModel.getAllShifts({
                    name: payload.name,
                    hotel_code,
                });
                if (nameAlreadyExists.length > 0) {
                    throw new customEror_1.default("Shift with this name already exists", this.StatusCode.HTTP_CONFLICT);
                }
                yield hrConfigurationModel.updateShift({ id, hotel_code, payload });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Shift updated successfully",
                };
            }));
        });
    }
    deleteShift(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const id = Number(req.params.id);
                const hrConfigurationModel = this.Model.hrModel(trx);
                const data = yield hrConfigurationModel.getSingleShift({
                    id,
                    hotel_code,
                });
                if (!data) {
                    throw new customEror_1.default("Shift not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                yield hrConfigurationModel.deleteShift({ id, hotel_code });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Shift deleted successfully",
                };
            }));
        });
    }
    // ======================= Allowances ======================= //
    createAllowances(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const body = req.body;
                body.hotel_code = hotel_code;
                const hrConfigurationModel = this.Model.hrModel(trx);
                const { data } = yield hrConfigurationModel.getAllAllowances({
                    name: body.name,
                    hotel_code,
                });
                if (data.length > 0) {
                    throw new customEror_1.default("Allowances with this name already exists", this.StatusCode.HTTP_CONFLICT);
                }
                yield hrConfigurationModel.createAllowances(body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Shift has been created",
                };
            }));
        });
    }
    getAllAllowances(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { name } = req.query;
                const hrConfigurationModel = this.Model.hrModel(trx);
                const { data, total } = yield hrConfigurationModel.getAllAllowances({
                    name: name,
                    hotel_code,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Allowances fetched successfully",
                    total,
                    data,
                };
            }));
        });
    }
    getSingleAllowance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const id = Number(req.params.id);
                const hrConfigurationModel = this.Model.hrModel(trx);
                const data = yield hrConfigurationModel.getSingleAllowance({
                    id,
                    hotel_code,
                });
                if (!data) {
                    throw new customEror_1.default("Allowance not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Allowance fetched successfully",
                    data,
                };
            }));
        });
    }
    updateAllowance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const id = Number(req.params.id);
                const payload = req.body;
                const hrConfigurationModel = this.Model.hrModel(trx);
                const data = yield hrConfigurationModel.getSingleAllowance({
                    id,
                    hotel_code,
                });
                if (!data) {
                    throw new customEror_1.default("Allowance not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                const { data: nameAlreadyExists } = yield hrConfigurationModel.getAllAllowances({
                    name: payload.name,
                    hotel_code,
                });
                if (nameAlreadyExists.length > 0) {
                    throw new customEror_1.default("Allowance with this name already exists", this.StatusCode.HTTP_CONFLICT);
                }
                yield hrConfigurationModel.updateAllowance({
                    id,
                    hotel_code,
                    payload,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Allowance updated successfully",
                };
            }));
        });
    }
    deleteAllowance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const id = Number(req.params.id);
                const hrConfigurationModel = this.Model.hrModel(trx);
                const data = yield hrConfigurationModel.getSingleAllowance({
                    id,
                    hotel_code,
                });
                if (!data) {
                    throw new customEror_1.default("Allowance not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                yield hrConfigurationModel.deleteAllowance({ id, hotel_code });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Allowance deleted successfully",
                };
            }));
        });
    }
    // ======================= Deductions ======================= //
    createDeductions(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const body = req.body;
                body.hotel_code = hotel_code;
                const hrConfigurationModel = this.Model.hrModel(trx);
                const { data } = yield hrConfigurationModel.getAllDeductions({
                    name: body.name,
                    hotel_code,
                });
                if (data.length > 0) {
                    throw new customEror_1.default("Deduction with this name already exists", this.StatusCode.HTTP_CONFLICT);
                }
                yield hrConfigurationModel.createDeductions(body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Deduction has been created",
                };
            }));
        });
    }
    getAllDeductions(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { name } = req.query;
                const hrConfigurationModel = this.Model.hrModel(trx);
                const { data, total } = yield hrConfigurationModel.getAllDeductions({
                    name: name,
                    hotel_code,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Deductions fetched successfully",
                    total,
                    data,
                };
            }));
        });
    }
    getSingleDeduction(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const id = Number(req.params.id);
                const hrConfigurationModel = this.Model.hrModel(trx);
                const data = yield hrConfigurationModel.getSingleDeduction({
                    id,
                    hotel_code,
                });
                if (!data) {
                    throw new customEror_1.default("Deduction not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Deduction fetched successfully",
                    data,
                };
            }));
        });
    }
    updateDeduction(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const id = Number(req.params.id);
                const payload = req.body;
                const hrConfigurationModel = this.Model.hrModel(trx);
                const data = yield hrConfigurationModel.getSingleDeduction({
                    id,
                    hotel_code,
                });
                if (!data) {
                    throw new customEror_1.default("Deduction not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                const { data: nameAlreadyExists } = yield hrConfigurationModel.getAllDeductions({
                    name: payload.name,
                    hotel_code,
                });
                if (nameAlreadyExists.length > 0) {
                    throw new customEror_1.default("Deduction with this name already exists", this.StatusCode.HTTP_CONFLICT);
                }
                yield hrConfigurationModel.updateDeduction({
                    id,
                    hotel_code,
                    payload,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Deduction updated successfully",
                };
            }));
        });
    }
    deleteDeduction(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const id = Number(req.params.id);
                const hrConfigurationModel = this.Model.hrModel(trx);
                const data = yield hrConfigurationModel.getSingleDeduction({
                    id,
                    hotel_code,
                });
                if (!data) {
                    throw new customEror_1.default("Deduction not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                yield hrConfigurationModel.deleteDeduction({ id, hotel_code });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Deduction deleted successfully",
                };
            }));
        });
    }
}
exports.default = ConfigurationService;
//# sourceMappingURL=configuration.service.js.map