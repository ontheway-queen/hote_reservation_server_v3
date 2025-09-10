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
class EmployeeService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createEmployee(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id } = req.hotel_admin;
            const _a = req.body, { department_ids, designation_id } = _a, rest = __rest(_a, ["department_ids", "designation_id"]);
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const files = req.files || [];
                if (files.length) {
                    rest["photo"] = files[0].filename;
                }
                const hrModel = this.Model.hrModel(trx);
                const { total } = yield hrModel.getAllDepartment({
                    ids: department_ids,
                    hotel_code,
                });
                console.log({ total });
                if (total !== department_ids.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Department not found from given id",
                    };
                }
                const { data } = yield hrModel.getAllEmployee({
                    key: rest.email,
                    hotel_code,
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Employee already exist",
                    };
                }
                const [insertRes] = yield hrModel.insertEmployee(Object.assign(Object.assign({}, rest), { hotel_code,
                    designation_id, created_by: id }));
                // insert into employee_departments
                yield hrModel.insertIntoEmpDepartment(department_ids.map((dept_id) => ({
                    emp_id: insertRes.id,
                    department_id: dept_id,
                })));
                // insert into emp bank info
                yield hrModel.insertIntoEmpbankInfo({
                    emp_id: insertRes.id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    getAllEmployee(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { key, designation_id, department_id, status } = req.query;
            const { data, total } = yield this.Model.employeeModel().getAllEmployee({
                key: key,
                hotel_code,
                department: department_id,
                designation: designation_id,
                status: status,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getSingleEmployee(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.employeeModel().getSingleEmployee(parseInt(id), hotel_code);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateEmployee(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id } = req.hotel_admin;
            const _a = req.body, { new_department_ids, remove_department_ids } = _a, rest = __rest(_a, ["new_department_ids", "remove_department_ids"]);
            console.log(req.body);
            const emp_id = Number(req.params.id);
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const files = req.files || [];
                if (files.length) {
                    rest["photo"] = files[0].filename;
                }
                const hrModel = this.Model.hrModel(trx);
                if (new_department_ids === null || new_department_ids === void 0 ? void 0 : new_department_ids.length) {
                    const { total } = yield hrModel.getAllDepartment({
                        ids: new_department_ids,
                        hotel_code,
                    });
                    console.log({ total });
                    if (total !== new_department_ids.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Department not found from given id",
                        };
                    }
                    const alreadyHasDeptId = yield hrModel.hasEmpDepartmentAlreadyExist(emp_id, new_department_ids);
                    let uniqueIds = [];
                    if (alreadyHasDeptId.length) {
                        new_department_ids.forEach((id) => {
                            const found = alreadyHasDeptId.find((item) => item.department_id == id);
                            if (!found) {
                                uniqueIds.push(id);
                            }
                        });
                    }
                    else {
                        uniqueIds = new_department_ids;
                    }
                    yield hrModel.insertIntoEmpDepartment(uniqueIds.map((dept_id) => ({
                        emp_id,
                        department_id: dept_id,
                    })));
                }
                if (remove_department_ids === null || remove_department_ids === void 0 ? void 0 : remove_department_ids.length) {
                    yield hrModel.removeDepartmentFromEmployee(emp_id, remove_department_ids.map((dept_id) => dept_id));
                }
                if (Object.keys(rest).length) {
                    yield hrModel.updateEmployee(emp_id, rest);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    deleteEmployee(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield this.Model.employeeModel().deleteEmployee(parseInt(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Employee has been deleted",
            };
        });
    }
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