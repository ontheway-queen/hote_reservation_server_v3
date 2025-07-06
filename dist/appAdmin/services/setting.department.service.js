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
const Setting_Model_1 = __importDefault(require("../../models/reservationPanel/Setting.Model"));
class DepartmentSettingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //=================== Department service ======================//
    // create Department
    createDepartment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id } = req.hotel_admin;
                const { name } = req.body;
                // Department check
                const settingModel = this.Model.settingModel();
                const { data } = yield settingModel.getAllDepartment({
                    name,
                    hotel_code,
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Department name already exists",
                    };
                }
                // model
                const model = new Setting_Model_1.default(trx);
                yield model.createDepartment({
                    hotel_code,
                    name,
                    created_by: id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Department created successfully.",
                };
            }));
        });
    }
    // Get all Department
    getAllDepartment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, name, status } = req.query;
            const model = this.Model.settingModel();
            const { data, total } = yield model.getAllDepartment({
                status: status,
                limit: limit,
                skip: skip,
                name: name,
                hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // Update Department
    updateDepartment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { id } = req.params;
                const updatePayload = req.body;
                const model = this.Model.settingModel(trx);
                const { data } = yield model.getAllDepartment({
                    name: updatePayload.name,
                    hotel_code,
                    excludeId: parseInt(req.params.id),
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Department name already exists",
                    };
                }
                yield model.updateDepartment(parseInt(id), hotel_code, {
                    name: updatePayload.name,
                    status: updatePayload.status,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Department updated successfully",
                };
            }));
        });
    }
    // Delete Department
    deleteDepartment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { id } = req.params;
                const model = this.Model.settingModel(trx);
                yield model.deleteDepartment(parseInt(id), hotel_code);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Department deleted successfully",
                };
            }));
        });
    }
}
exports.default = DepartmentSettingService;
//# sourceMappingURL=setting.department.service.js.map