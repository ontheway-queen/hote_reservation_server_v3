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
exports.ServiceCategoriesService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const lib_1 = __importDefault(require("../../utils/lib/lib"));
class ServiceCategoriesService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createServiceCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id } = req.hotel_admin;
            const { name } = req.body;
            const serviceCategoriesModel = this.Model.serviceCategoriesModel();
            const check = yield serviceCategoriesModel.getServiceCategory({
                hotel_code,
                name,
            });
            if (check) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: "Service Category name already exists",
                };
            }
            const category_code = yield lib_1.default.generateCategoryCode(hotel_code, name);
            yield serviceCategoriesModel.createServiceCategory({
                hotel_code,
                name,
                created_by: id,
                category_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Service Category has been created successfully!",
            };
        });
    }
    getAllServiceCategories(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { name, limit, skip, status } = req.query;
            const serviceCategoriesModel = this.Model.serviceCategoriesModel();
            const data = yield serviceCategoriesModel.getServiceCategories({
                key: name,
                status: status,
                limit: Number(limit),
                skip: Number(skip),
                hotel_code,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_SUCCESSFUL, message: "Service Categories has been fetched successfully!" }, data);
        });
    }
    updateServiceCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const id = Number(req.params.id);
                const _a = req.body, { name } = _a, rest = __rest(_a, ["name"]);
                const serviceCategoriesModel = this.Model.serviceCategoriesModel();
                if (name) {
                    const check = yield serviceCategoriesModel.getServiceCategory({
                        hotel_code,
                        name,
                    });
                    if (check) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Service Category name already exists",
                        };
                    }
                }
                const category_code = yield lib_1.default.generateCategoryCode(hotel_code, name);
                yield serviceCategoriesModel.updateServiceCategory({
                    id,
                    hotel_code,
                }, Object.assign({ name, category_code }, rest));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Service Categories has been updated successfully!",
                };
            }));
        });
    }
    deleteServiceCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const id = Number(req.params.id);
                const serviceCategoriesModel = this.Model.serviceCategoriesModel();
                const check = yield serviceCategoriesModel.getServiceCategory({
                    hotel_code,
                    id,
                });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Service Category name does not exists",
                    };
                }
                yield serviceCategoriesModel.updateServiceCategory({
                    id,
                    hotel_code,
                }, { is_deleted: true });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Service Categories has been deleted successfully!",
                };
            }));
        });
    }
}
exports.ServiceCategoriesService = ServiceCategoriesService;
exports.default = ServiceCategoriesService;
//# sourceMappingURL=serviceCategories.service.js.map