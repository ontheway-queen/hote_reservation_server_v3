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
exports.ServiceService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
class ServiceService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id } = req.hotel_admin;
                const { services, service_pricing, service_schedule } = req.body;
                const files = req.files;
                const services_images = [];
                let hasThumbnail = false;
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "thumbnail_url":
                            services.thumbnail_url = filename;
                            hasThumbnail = true;
                            break;
                        case "service_images":
                            const data = {
                                hotel_code,
                                image_url: filename,
                            };
                            services_images.push(data);
                            break;
                        default:
                            break;
                    }
                }
                if (!hasThumbnail) {
                    throw new customEror_1.default("Thumbnail is required", this.StatusCode.HTTP_BAD_REQUEST);
                }
                if (services && !services.is_always_open) {
                    if (!service_schedule.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Service schedule is required",
                        };
                    }
                }
                const serviceModel = this.Model.serviceModel(trx);
                const serviceCategoryModel = this.Model.serviceCategoriesModel(trx);
                const serviceImageModel = this.Model.serviceImageModel(trx);
                // const servicePricingModel = this.Model.servicePricingModel(trx);
                const serviceScheduleModel = this.Model.serviceScheduleModel(trx);
                const isServiceExists = yield serviceCategoryModel.getServiceCategory({
                    hotel_code,
                    id: services.category_id,
                });
                if (!isServiceExists) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Service Category does not exist",
                    };
                }
                const check = yield serviceModel.getSingleService({
                    name: services.name,
                    hotel_code,
                    category_id: services.category_id,
                });
                if (check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Same service with same category already exists",
                    };
                }
                const lastServiceCode = yield serviceModel.getLastServiceCode(hotel_code);
                const words = services.name.trim().split(/\s+/);
                let codeWord = words
                    .map((word) => word[0].toUpperCase())
                    .filter((c) => /[A-Z]/.test(c))
                    .join("");
                codeWord = codeWord.substring(0, 10);
                const code = (lastServiceCode === null || lastServiceCode === void 0 ? void 0 : lastServiceCode.service_code.split("-")[2]) || "0000";
                const newServiceCode = (parseInt(code) + 1)
                    .toString()
                    .padStart(4, "0");
                const [newCategory] = yield serviceModel.createService(Object.assign({ hotel_code, created_by: id, service_code: `SER-${codeWord}-${newServiceCode}` }, services));
                console.log({ newCategory });
                if (services_images && services_images.length) {
                    yield Promise.all(services_images.map((img) => serviceImageModel.uploadServiceImage(Object.assign(Object.assign({}, img), { service_id: newCategory.id }))));
                }
                if (service_pricing && service_pricing.length > 0) {
                    yield Promise.all(service_pricing.map((price) => {
                        let mainPrice = price.price;
                        let vatPrice = 0;
                        let discount_price = 0;
                        if (price.discount_percent &&
                            price.discount_percent > 0) {
                            discount_price =
                                price.price -
                                    (price.price * price.discount_percent) / 100;
                        }
                        let total = discount_price > 0
                            ? discount_price + price.delivery_charge
                            : price.price + price.delivery_charge;
                        if (price.vat_percent && price.vat_percent > 0) {
                            vatPrice = (total * price.vat_percent) / 100;
                        }
                        console.log(Object.assign(Object.assign({}, price), { hotel_code, service_id: newCategory.id, total_price: discount_price > 0
                                ? (discount_price || 0) +
                                    (vatPrice || 0) +
                                    (price.delivery_charge || 0)
                                : mainPrice +
                                    (vatPrice || 0) +
                                    (price.delivery_charge || 0), discount_price }));
                        // return servicePricingModel.createServicePricing({
                        // 	...price,
                        // 	hotel_code,
                        // 	service_id: newCategory.id,
                        // 	total_price:
                        // 		discount_price > 0
                        // 			? (discount_price || 0) +
                        // 			  (vatPrice || 0) +
                        // 			  (price.delivery_charge || 0)
                        // 			: mainPrice +
                        // 			  (vatPrice || 0) +
                        // 			  (price.delivery_charge || 0),
                        // 	discount_price,
                        // });
                    }));
                }
                if (service_schedule && service_schedule.length > 0) {
                    yield Promise.all(service_schedule.map((schedule) => {
                        return serviceScheduleModel.addServiceSchedule(Object.assign(Object.assign({}, schedule), { hotel_code, service_id: newCategory.id }));
                    }));
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Service has been created successfully!",
                };
            }));
        });
    }
    getAllServices(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { key, limit, skip, status } = req.query;
            const serviceModel = this.Model.serviceModel();
            const data = yield serviceModel.getAllServices({
                key: key,
                status: status,
                limit: Number(limit),
                skip: Number(skip),
                hotel_code,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_SUCCESSFUL, message: "Services has been fetched successfully!" }, data);
        });
    }
    getSingleService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const serviceModel = this.Model.serviceModel();
            const data = yield serviceModel.getSingleService({
                id: Number(id),
                hotel_code,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Service does not exist",
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Service has been fetched successfully!",
                data,
            };
        });
    }
    deleteService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { hotel_code } = req.hotel_admin;
                const serviceModel = this.Model.serviceModel(trx);
                const isServiceExists = yield serviceModel.getSingleService({
                    id: Number(id),
                    hotel_code,
                });
                if (!isServiceExists) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Service does not exist",
                    };
                }
                const data = yield serviceModel.deleteService({
                    id: Number(id),
                    hotel_code,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Service has been deleted successfully!",
                    data,
                };
            }));
        });
    }
    updateService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { hotel_code } = req.hotel_admin;
                const { services, delete_service_images_id, service_pricing, delete_service_pricing_id, service_schedule, delete_service_schedule_id, } = req.body;
                const files = req.files;
                const serviceModel = this.Model.serviceModel(trx);
                const categoryModel = this.Model.serviceCategoriesModel(trx);
                const serviceScheduleModel = this.Model.serviceScheduleModel(trx);
                const serviceImageModel = this.Model.serviceImageModel(trx);
                // const servicePricingModel = this.Model.servicePricingModel(trx);
                const isServiceExists = yield serviceModel.getSingleService({
                    id: Number(id),
                    hotel_code,
                });
                if (!isServiceExists) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Service does not exist",
                    };
                }
                const services_images = [];
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "thumbnail_url":
                            services.thumbnail_url = filename;
                            break;
                        case "service_image":
                            const data = {
                                hotel_code,
                                image_url: filename,
                            };
                            services_images.push(data);
                            break;
                        default:
                            break;
                    }
                }
                if (services && services.category_id) {
                    const category = yield categoryModel.getServiceCategory({
                        hotel_code,
                        id: Number(services.category_id),
                    });
                    if (!category) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Category does not exist",
                        };
                    }
                }
                if (services && services.is_always_open) {
                    console.log(1);
                    yield serviceScheduleModel.updateServiceSchedule({
                        where: {
                            service_id: Number(id),
                            hotel_code,
                        },
                        payload: {
                            is_deleted: true,
                        },
                    });
                }
                if (delete_service_images_id && delete_service_images_id.length) {
                    for (const id of delete_service_images_id) {
                        yield serviceImageModel.updateServiceImage({
                            where: {
                                id,
                                hotel_code,
                            },
                            payload: {
                                is_deleted: true,
                            },
                        });
                    }
                }
                if (services_images && services_images.length) {
                    yield Promise.all(services_images.map((img) => serviceImageModel.uploadServiceImage(Object.assign(Object.assign({}, img), { service_id: Number(id) }))));
                }
                if (services && !services.is_always_open) {
                    if (service_schedule && !service_schedule.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Service schedule is required",
                        };
                    }
                }
                if (service_schedule && service_schedule.length) {
                    for (const schedule of service_schedule) {
                        if (schedule.start_time > schedule.end_time) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: "Start time should be less than end time",
                            };
                        }
                    }
                }
                if (service_pricing && service_pricing.length > 0) {
                    const filteredPricing = service_pricing.filter((price) => price.id === null);
                    yield Promise.all(filteredPricing.map((price) => {
                        let mainPrice = price.price;
                        let vatPrice = 0;
                        let discount_price = 0;
                        if (price.discount_percent &&
                            price.discount_percent > 0) {
                            discount_price =
                                price.price -
                                    (price.price * price.discount_percent) / 100;
                        }
                        let total = discount_price > 0
                            ? discount_price + price.delivery_charge
                            : price.price + price.delivery_charge;
                        if (price.vat_percent && price.vat_percent > 0) {
                            vatPrice = (total * price.vat_percent) / 100;
                        }
                        // return servicePricingModel.createServicePricing({
                        // 	...price,
                        // 	hotel_code,
                        // 	service_id: id,
                        // 	total_price:
                        // 		discount_price > 0
                        // 			? (discount_price || 0) +
                        // 			  (vatPrice || 0) +
                        // 			  (price.delivery_charge || 0)
                        // 			: mainPrice +
                        // 			  (vatPrice || 0) +
                        // 			  (price.delivery_charge || 0),
                        // 	discount_price,
                        // });
                    }));
                    yield Promise.all(service_pricing
                        .filter((price) => price.id !== null)
                        .map((price) => {
                        // return servicePricingModel.updateServicePricing({
                        // 	where: {
                        // 		id: Number(price.id),
                        // 		hotel_code,
                        // 	},
                        // 	payload: price,
                        // });
                    }));
                }
                if (delete_service_pricing_id && delete_service_pricing_id.length) {
                    for (const id of delete_service_pricing_id) {
                        // await servicePricingModel.updateServicePricing({
                        // 	where: {
                        // 		id,
                        // 		hotel_code,
                        // 	},
                        // 	payload: {
                        // 		is_deleted: true,
                        // 	},
                        // });
                    }
                }
                if (delete_service_schedule_id &&
                    delete_service_schedule_id.length) {
                    for (const id of delete_service_schedule_id) {
                        yield serviceScheduleModel.updateServiceSchedule({
                            where: {
                                id,
                                hotel_code,
                            },
                            payload: {
                                is_deleted: true,
                            },
                        });
                    }
                }
                if (service_schedule && service_schedule.length) {
                    const filteredSchedule = service_schedule.filter((schedule) => schedule.id === null);
                    yield Promise.all(filteredSchedule.map((schedule) => {
                        return serviceScheduleModel.addServiceSchedule(Object.assign(Object.assign({}, schedule), { hotel_code, service_id: id }));
                    }));
                    yield Promise.all(service_schedule
                        .filter((schedule) => schedule.id !== null)
                        .map((schedule) => {
                        return serviceScheduleModel.updateServiceSchedule({
                            where: {
                                id: Number(schedule.id),
                                hotel_code,
                            },
                            payload: schedule,
                        });
                    }));
                }
                if (services) {
                    yield serviceModel.updateService({
                        payload: services,
                        where: {
                            id: Number(id),
                            hotel_code,
                        },
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Service has been updated successfully!",
                };
            }));
        });
    }
}
exports.ServiceService = ServiceService;
exports.default = ServiceService;
//# sourceMappingURL=service.service.js.map