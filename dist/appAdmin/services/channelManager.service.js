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
class ChannelManagerService extends abstract_service_1.default {
    constructor() {
        super();
    }
    addChannelManager(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotel_code = req.hotel_admin.hotel_code;
            yield this.Model.channelManagerModel().addChannelManager(Object.assign(Object.assign({}, req.body), { hotel_code, created_by: req.hotel_admin.hotel_code }));
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Channel has been added",
            };
        });
    }
    getAllChannelManager(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.channelManagerModel().getAllChannelManager({
                hotel_code: req.hotel_admin.hotel_code,
                is_internal: Boolean(req.query.is_internal),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateChannelManager(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotel_code = req.hotel_admin.hotel_code;
            yield this.Model.channelManagerModel().updateChannelManager(Object.assign({}, req.body), { id: Number(req.params.id), hotel_code });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Channel has been updated",
            };
        });
    }
    channelAllocation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { hotel_code } = req.hotel_admin;
                const { channel_id, room_type_id, total_allocated_rooms, from_date, to_date, rate_plans, } = req.body;
                const cmModel = this.Model.channelManagerModel(trx);
                const settingModel = this.Model.settingModel(trx);
                const reservationModel = this.Model.reservationModel(trx);
                // 1. Validate room type
                const check_room_type_data = yield settingModel.getSingleRoomType(room_type_id, hotel_code);
                if (!check_room_type_data.length)
                    throw new Error("Invalid Room Type");
                // 2. Validate channel
                const checkCM = yield cmModel.getSingleChannel(channel_id, hotel_code);
                if (!checkCM)
                    throw new Error("Invalid Channel");
                // 3. Validate rate plans
                const checkRatePlans = yield settingModel.getAllRoomRateByratePlanIDs({
                    hotel_code,
                    ids: rate_plans,
                });
                if (checkRatePlans.length !== rate_plans.length)
                    throw new Error("Invalid Rate Plans");
                // 4. Prepare dates & allocations
                const channelAllocationPayload = [];
                const roomAvailabilityUpdates = [];
                let currentDate = new Date(from_date);
                const endDate = new Date(to_date);
                while (currentDate <= endDate) {
                    const formattedDate = currentDate.toISOString().split("T")[0];
                    console.log(formattedDate);
                    // 4a. PMS availability check
                    const availableRoomCount = yield cmModel.getAllTodayAvailableRoomsTypeWithRoomCount({
                        check_in: formattedDate,
                        check_out: formattedDate,
                        hotel_code,
                        room_type_id,
                    });
                    console.log({ availableRoomCount });
                    if (!availableRoomCount.length ||
                        availableRoomCount[0].available_rooms < total_allocated_rooms)
                        throw new Error(`Not enough rooms on ${formattedDate}. Requested ${total_allocated_rooms}, only ${((_a = availableRoomCount[0]) === null || _a === void 0 ? void 0 : _a.available_rooms) || 0} available.`);
                    // 4b. Merge with existing allocation if exists
                    const existingAllocation = yield cmModel.getSingleChannelAllocation({
                        hotel_code,
                        room_type_id,
                        channel_id,
                        date: formattedDate,
                    });
                    if (existingAllocation) {
                        // update existing allocation
                        yield cmModel.updateChannelAllocation({
                            id: existingAllocation.id,
                            allocated_rooms: total_allocated_rooms,
                        });
                        // here have deallocate
                        yield cmModel.bulkUpdateRoomAvailabilityForChannel({
                            type: "deallocate",
                            hotel_code,
                            room_type_id,
                            updates: [
                                {
                                    date: formattedDate,
                                    total_rooms: existingAllocation.allocated_rooms,
                                },
                            ],
                        });
                    }
                    else {
                        // insert new allocation
                        channelAllocationPayload.push({
                            hotel_code,
                            room_type_id,
                            channel_id,
                            date: formattedDate,
                            allocated_rooms: total_allocated_rooms,
                        });
                    }
                    // PMS room availability
                    roomAvailabilityUpdates.push({
                        date: formattedDate,
                        total_rooms: total_allocated_rooms,
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                // 5. Bulk insert new allocations
                if (channelAllocationPayload.length) {
                    yield cmModel.insertInChannelAllocation(channelAllocationPayload);
                }
                // 6. Bulk update PMS availability
                yield cmModel.bulkUpdateRoomAvailabilityForChannel({
                    type: "allocate",
                    hotel_code,
                    room_type_id,
                    updates: roomAvailabilityUpdates,
                });
                // 7. Insert/update rate plans mapping
                if (rate_plans.length) {
                    const channelRatePlanPayload = rate_plans.map((rp) => ({
                        hotel_code,
                        room_type_id,
                        channel_id,
                        rate_plan_id: rp,
                    }));
                    yield cmModel.insertInChannelRatePlans(channelRatePlanPayload);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Room allocation successful",
                };
            }));
        });
    }
    getChannelRoomAllocations(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.channelManagerModel().getChannelRoomAllocations({
                current_date: req.query.current_date,
                hotel_code: req.hotel_admin.hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
}
exports.default = ChannelManagerService;
//# sourceMappingURL=channelManager.service.js.map