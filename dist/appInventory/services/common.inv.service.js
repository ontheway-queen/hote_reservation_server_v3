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
class CommonInvService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //=================== Category ======================//
    createCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { name } = req.body;
                // Check for existing category
                const Model = this.Model.CommonInventoryModel(trx);
                const { data } = yield Model.getAllCategory({
                    name: req.body.name,
                    hotel_code,
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Category name already exists",
                    };
                }
                yield Model.createCategory({
                    hotel_code,
                    name,
                    created_by: admin_id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Category created successfully.",
                };
            }));
        });
    }
    // Get all Category
    getAllCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, name, status } = req.query;
            const { hotel_code } = req.hotel_admin;
            const model = this.Model.CommonInventoryModel();
            const { data, total } = yield model.getAllCategory({
                name: name,
                status: status,
                limit: limit,
                skip: skip,
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
    // Update Category
    updateCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { id } = req.params;
                const updatePayload = req.body;
                const model = this.Model.CommonInventoryModel(trx);
                const { data } = yield model.getAllCategory({
                    name: updatePayload.name,
                    hotel_code,
                    excludeId: parseInt(req.params.id),
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Category name already exists",
                    };
                }
                const res = yield model.updateCategory(parseInt(id), {
                    name: updatePayload.name,
                    status: updatePayload.status,
                });
                if (res === 1) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: "Category updated successfully",
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Category didn't find  from this ID",
                    };
                }
            }));
        });
    }
    // Delete Category
    deleteCategory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { hotel_code } = req.hotel_admin;
                const model = this.Model.CommonInventoryModel(trx);
                const { data } = yield model.getAllCategory({
                    hotel_code,
                    excludeId: undefined,
                    name: "",
                });
                const category = data.find((item) => item.id === Number(id));
                if (!category) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Category not found from this ID",
                    };
                }
                // ✅ Soft delete
                yield model.deleteCategory(Number(id), hotel_code);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Category deleted successfully",
                };
            }));
        });
    }
    //=================== Unit ======================//
    // create Unit
    createUnit(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { name, short_code } = req.body;
                // Category name check
                const Model = this.Model.CommonInventoryModel(trx);
                const { data } = yield Model.getAllUnit({
                    name,
                    hotel_code,
                    short_code,
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Unit name already exists",
                    };
                }
                yield Model.createUnit({
                    hotel_code,
                    name,
                    short_code,
                    created_by: admin_id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Unit created successfully.",
                };
            }));
        });
    }
    // Get all Unit
    getAllUnit(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, name, status } = req.query;
            const { hotel_code } = req.hotel_admin;
            const model = this.Model.CommonInventoryModel();
            const { data, total } = yield model.getAllUnit({
                name: name,
                status: status,
                limit: limit,
                skip: skip,
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
    // Update Unit
    updateUnit(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { id } = req.params;
                const updatePayload = req.body;
                const model = this.Model.CommonInventoryModel(trx);
                const { data } = yield model.getAllUnit({
                    name: updatePayload.name,
                    hotel_code,
                    excludeId: parseInt(req.params.id),
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Unit name already exists",
                    };
                }
                const res = yield model.updateUnit(parseInt(id), hotel_code, {
                    name: updatePayload.name,
                    short_code: updatePayload.short_code,
                    status: updatePayload.status,
                });
                if (res === 1) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: "Unit updated successfully",
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Unit didn't find  from this ID",
                    };
                }
            }));
        });
    }
    //=================== Brand ======================//
    // create Unit
    createBrand(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { name } = req.body;
                // Category name check
                const Model = this.Model.CommonInventoryModel(trx);
                const { data } = yield Model.getAllBrand({ name, hotel_code });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Brand name already exists",
                    };
                }
                yield Model.createBrand({
                    hotel_code,
                    name,
                    created_by: admin_id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Brand created successfully.",
                };
            }));
        });
    }
    // Get all Brand
    getAllBrand(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, name, status } = req.query;
            const model = this.Model.CommonInventoryModel();
            const { data, total } = yield model.getAllBrand({
                hotel_code,
                name: name,
                status: status,
                limit: limit,
                skip: skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // Update Brand
    updateBrand(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { id } = req.params;
                const updatePayload = req.body;
                const model = this.Model.CommonInventoryModel(trx);
                const { data } = yield model.getAllBrand({
                    name: updatePayload.name,
                    hotel_code,
                    excludeId: parseInt(req.params.id),
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Brand name already exists",
                    };
                }
                const res = yield model.updateBrand(parseInt(id), hotel_code, {
                    name: updatePayload.name,
                    status: updatePayload.status,
                });
                if (res === 1) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: "Brand updated successfully",
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Brand didn't find  from this ID",
                    };
                }
            }));
        });
    }
    //=================== Supplier service ======================//
    // create Supplier
    createSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { name, phone } = req.body;
                // Supplier name check
                const Model = this.Model.CommonInventoryModel(trx);
                const { data } = yield Model.getAllSupplier({ name, hotel_code });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Supplier name already exists",
                    };
                }
                yield Model.createSupplier({
                    hotel_code,
                    name,
                    phone,
                    created_by: admin_id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Supplier created successfully.",
                };
            }));
        });
    }
    // Get all Supplier
    getAllSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, name, status } = req.query;
            const model = this.Model.CommonInventoryModel();
            const { data, total } = yield model.getAllSupplier({
                name: name,
                status: status,
                limit: limit,
                skip: skip,
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
    // Get all Supplier Payment
    getAllSupplierPayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, from_date, to_date } = req.query;
            const { data, total } = yield this.Model.CommonInventoryModel().getSupplierPayment({
                key: key,
                from_date: from_date,
                to_date: to_date,
                limit: limit,
                skip: skip,
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
    // Supplier payment report
    getSupplierLedgerReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, from_date, to_date } = req.query;
            const data = yield this.Model.CommonInventoryModel().getSupplierLedgerReport({
                limit: limit,
                skip: skip,
                from_date: from_date,
                to_date: to_date,
                id: parseInt(req.params.id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0],
            };
        });
    }
    // Update Supplier
    updateSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { id } = req.params;
                const updatePayload = req.body;
                const model = this.Model.CommonInventoryModel(trx);
                const { data } = yield model.getAllSupplier({
                    name: updatePayload.name,
                    hotel_code,
                    excludeId: parseInt(req.params.id),
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Supplier name already exists",
                    };
                }
                const res = yield model.updateSupplier(parseInt(id), hotel_code, {
                    name: updatePayload.name,
                    phone: updatePayload.phone,
                    status: updatePayload.status,
                    updated_by: admin_id,
                });
                if (res === 1) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: "Supplier updated successfully",
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Supplier not found with this ID",
                    };
                }
            }));
        });
    }
}
exports.default = CommonInvService;
//# sourceMappingURL=common.inv.service.js.map