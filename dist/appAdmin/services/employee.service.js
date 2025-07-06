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
exports.EmployeeService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
class EmployeeService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // create employee
    createEmployee(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id } = req.hotel_admin;
            const body = req.body;
            const files = req.files || [];
            if (files.length) {
                body["photo"] = files[0].filename;
            }
            const employeeModel = this.Model.employeeModel();
            const { data } = yield employeeModel.getAllEmployee({
                key: body.email,
                hotel_code,
            });
            if (data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: "Employee already exist",
                };
            }
            yield employeeModel.insertEmployee(Object.assign(Object.assign({}, req.body), { hotel_code, created_by: id }));
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    // get all Employee
    getAllEmployee(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { key, department, designation } = req.query;
            const employeeModel = this.Model.employeeModel();
            const { data, total } = yield employeeModel.getAllEmployee({
                key: key,
                hotel_code,
                department: department,
                designation: designation,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // get Single Employee
    getSingleEmployee(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.employeeModel().getSingleEmployee(parseInt(id), hotel_code);
            if (!data) {
                throw new customEror_1.default(`The requested employee with ID: ${id} not found.`, this.StatusCode.HTTP_NOT_FOUND);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    // update employee
    updateEmployee(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { id } = req.params;
                const _a = req.body, { email } = _a, rest = __rest(_a, ["email"]);
                const files = req.files || [];
                if (files.length) {
                    rest["photo"] = files[0].filename;
                }
                const model = this.Model.employeeModel(trx);
                const res = yield model.updateEmployee(parseInt(id), Object.assign(Object.assign({}, rest), { hotel_code,
                    email }));
                if (res === 1) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: "Employee Profile updated successfully",
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Employee Profile didn't find from this ID",
                    };
                }
            }));
        });
    }
    // Delete employee
    deleteEmployee(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const model = this.Model.employeeModel(trx);
                const res = yield model.deleteEmployee(parseInt(id));
                if (res === 1) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: "Employee Profile deleted successfully",
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Employee Profile didn't find from this ID",
                    };
                }
            }));
        });
    }
    // get Employees By Department Id
    getEmployeesByDepartmentId(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { limit, skip } = req.query;
            const model = this.Model.employeeModel();
            const res = yield model.getEmployeesByDepartmentId({
                id: Number(id),
                limit: Number(limit),
                skip: Number(skip),
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_OK }, res);
        });
    }
}
exports.EmployeeService = EmployeeService;
exports.default = EmployeeService;
//# sourceMappingURL=employee.service.js.map