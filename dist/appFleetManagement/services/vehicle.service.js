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
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class VehicleService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Create Vehicle
    createVehicle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const _a = req.body, { vehicle_fuels } = _a, body = __rest(_a, ["vehicle_fuels"]);
                const model = this.Model.vehicleModel(trx);
                const dModel = this.Model.fleetCommonModel(trx);
                // Check
                const { data } = yield model.getAllVehicles({
                    key: body.reg_number,
                    hotel_code,
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Registration number already exists",
                    };
                }
                const driver_id = body.driver_id;
                const driverID = yield dModel.getSingleDriver(driver_id, hotel_code);
                if (!driverID.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Invalid Driver information",
                    };
                }
                const files = req.files || [];
                if (files.length) {
                    body["vehicle_photo"] = files[0].filename;
                }
                // Vehicle create
                const createVehicle = yield model.createVehicle(Object.assign(Object.assign({}, body), { hotel_code, created_by: admin_id }));
                let vehicle_fuels_parse = [];
                if (vehicle_fuels) {
                    vehicle_fuels_parse = JSON.parse(vehicle_fuels);
                }
                if (vehicle_fuels_parse.length) {
                    const VehicleFuelPayload = vehicle_fuels_parse.map((item) => ({
                        vehicle_id: createVehicle[0],
                        fuel_type: item.fuel_type,
                        mileage: item.mileage,
                    }));
                    yield model.createVehicleFuel(VehicleFuelPayload);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Vehicle created successfully.",
                };
            }));
        });
    }
    // Get all Vehicle
    getAllVehicle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, status } = req.query;
            const model = this.Model.vehicleModel();
            const { data, total } = yield model.getAllVehicles({
                key: key,
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
    // Get Single Vehicle
    getSingleVehicle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const model = this.Model.vehicleModel();
            const data = yield model.getSingleVehicle(parseInt(id), hotel_code);
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
    // update Vehicle
    updateVehicle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: admin_id, hotel_code } = req.hotel_admin;
                const { id } = req.params;
                const updatePayload = req.body;
                const files = req.files || [];
                let vehicle_photo = updatePayload.vehicle_photo;
                if (files.length) {
                    vehicle_photo = files[0].filename;
                }
                // Check if owner exists
                const Model = this.Model.fleetCommonModel(trx);
                if (updatePayload.owner_id) {
                    const CheckOwnerID = yield Model.getSingleOwner(updatePayload.owner_id, hotel_code);
                    if (!CheckOwnerID.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Invalid owner information",
                        };
                    }
                }
                const model = this.Model.vehicleModel(trx);
                yield model.updateVehicle(parseInt(id), {
                    owner_id: updatePayload.owner_id,
                    reg_number: updatePayload.reg_number,
                    model: updatePayload.model,
                    mileage: updatePayload.mileage,
                    manufacturer: updatePayload.manufacturer,
                    vehicle_photo: vehicle_photo,
                    manufacture_year: updatePayload.manufacture_year,
                    license_plate: updatePayload.license_plate,
                    tax_token: updatePayload.tax_token,
                    driver_id: updatePayload.driver_id,
                    token_expired: updatePayload.token_expired,
                    insurance_number: updatePayload.insurance_number,
                    insurance_expired: updatePayload.insurance_expired,
                    vehicle_type: updatePayload.vehicle_type,
                    fuel_type: updatePayload.fuel_type,
                    status: updatePayload.status,
                    vehicle_color: updatePayload.vehicle_color,
                    updated_by: admin_id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Vehicle updated successfully",
                };
            }));
        });
    }
}
exports.default = VehicleService;
//# sourceMappingURL=vehicle.service.js.map