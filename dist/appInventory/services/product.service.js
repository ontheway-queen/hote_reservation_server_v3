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
class ProductInvService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createProduct(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id: admin_id } = req.hotel_admin;
            const body = req.body;
            const model = this.Model.productInventoryModel();
            const { data } = yield model.getAllProduct({
                key: body.name,
                hotel_code,
            });
            if (data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: "Product name already exists",
                };
            }
            const files = req.files || [];
            if (files.length) {
                body["image"] = files[0].filename;
            }
            const year = new Date().getFullYear();
            // get last voucher ID
            const productData = yield model.getAllProductsForLastId();
            const productNo = productData.length ? productData[0].id + 1 : 1;
            // Product create
            yield model.createProduct(Object.assign(Object.assign({}, body), { product_code: `P${year}${productNo}`, hotel_code, created_by: admin_id }));
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Product created successfully.",
            };
        });
    }
    getAllProduct(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, in_stock, unit, category, brand } = req.query;
            const { data, total } = yield this.Model.productInventoryModel().getAllProduct({
                key: key,
                unit: unit,
                brand: brand,
                category: category,
                in_stock: in_stock,
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
    updateProduct(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const id = Number(req.params.id);
                const { hotel_code } = req.hotel_admin;
                const body = req.body;
                const model = this.Model.productInventoryModel(trx);
                const files = req.files || [];
                if (files.length) {
                    body["image"] = files[0].filename;
                }
                const check = yield model.getAllProduct({
                    hotel_code,
                    pd_ids: [id],
                });
                if (!check.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Product not found",
                    };
                }
                yield model.updateProduct(id, body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Product updated successfully.",
                };
            }));
        });
    }
    createDamagedProduct(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id } = req.hotel_admin;
                console.log({ hotel_code, id });
                const { date, damaged_items } = req.body;
                // Check product
                const model = this.Model.productInventoryModel(trx);
                // Check inventory
                const PModel = this.Model.purchaseInventoryModel(trx);
                // Insert purchase item
                const stockItemsPayload = [];
                for (const item of damaged_items) {
                    const existingItem = stockItemsPayload.find((p) => p.product_id === item.product_id);
                    if (existingItem) {
                        existingItem.quantity += item.quantity;
                    }
                    else {
                        stockItemsPayload.push({
                            product_id: item.product_id,
                            hotel_code,
                            date: date,
                            quantity: item.quantity,
                            note: item.note,
                            created_by: id,
                        });
                    }
                }
                // Insert dm product
                yield model.createDamagedProduct(stockItemsPayload);
                // Inventory step
                const modifyInventoryProduct = [];
                const purchase_product_ids = damaged_items.map((item) => item.product_id);
                const getInventoryProduct = yield PModel.getAllInventory({
                    hotel_code,
                    product_id: purchase_product_ids,
                });
                for (const payloadItem of stockItemsPayload) {
                    const inventoryItem = getInventoryProduct.find((g) => g.product_id === payloadItem.product_id);
                    if (inventoryItem) {
                        modifyInventoryProduct.push({
                            available_quantity: parseFloat(inventoryItem.available_quantity) -
                                payloadItem.quantity,
                            total_damaged: parseFloat(inventoryItem.total_damaged) + payloadItem.quantity,
                            id: inventoryItem.id,
                        });
                    }
                }
                if (modifyInventoryProduct.length) {
                    yield Promise.all(modifyInventoryProduct.map((item) => __awaiter(this, void 0, void 0, function* () {
                        yield PModel.updateInInventory({
                            available_quantity: item.available_quantity,
                            total_damaged: item.total_damaged,
                        }, { id: item.id });
                    })));
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Damaged Product Created successfully.",
                };
            }));
        });
    }
    getAllDamagedProduct(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, date_from, date_to } = req.query;
            const model = this.Model.productInventoryModel();
            const { data, total } = yield model.getAllDamagedProduct({
                key: key,
                limit: Number(limit),
                skip: Number(skip),
                hotel_code,
                date_from: date_from,
                date_to: date_to,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getSingleDamagedProduct(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.productInventoryModel().getSingleDamagedProduct(parseInt(id), hotel_code);
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0],
            };
        });
    }
}
exports.default = ProductInvService;
//# sourceMappingURL=product.service.js.map