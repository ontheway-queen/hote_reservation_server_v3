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
exports.RoomService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class RoomService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createRoom(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { room_type_id, room_name } = req.body;
                const { hotel_code, id: user_id } = req.hotel_admin;
                const settingModel = this.Model.settingModel(trx);
                const roomModel = this.Model.RoomModel(trx);
                const checkRoomType = yield settingModel.getSingleRoomType(room_type_id, hotel_code);
                if (!checkRoomType.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Room type is not found",
                    };
                }
                // Check for duplicate room name
                const { data: duplicateRooms } = yield roomModel.getAllRoom({
                    hotel_code,
                    exact_name: room_name,
                });
                if (duplicateRooms.length > 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Room name already exists",
                    };
                }
                //  Insert new room
                yield roomModel.createRoom(Object.assign(Object.assign({}, req.body), { hotel_code, created_by: user_id }));
                // Handle room availability
                const availability = yield roomModel.getRoomAvailabilitiesByRoomTypeId(hotel_code, room_type_id);
                if (availability) {
                    yield roomModel.updateInRoomAvailabilities(hotel_code, room_type_id, {
                        available_rooms: availability.available_rooms + 1,
                        total_rooms: availability.total_rooms + 1,
                    });
                }
                else {
                    const todayPlus365 = new Date();
                    todayPlus365.setUTCDate(todayPlus365.getUTCDate() + 365);
                    const dateStr = todayPlus365.toISOString().split("T")[0];
                    yield roomModel.insertInRoomAvilabilities({
                        hotel_code,
                        room_type_id,
                        date: dateStr,
                        available_rooms: 1,
                        total_rooms: 1,
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Room created successfully.",
                };
            }));
        });
    }
    getAllRoom(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, limit, skip, room_type_id } = req.query;
            const { hotel_code } = req.hotel_admin;
            const { data, total } = yield this.Model.RoomModel().getAllRoom({
                search: search,
                limit: limit,
                skip: skip,
                hotel_code,
                room_type_id: parseInt(room_type_id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getAllRoomByRoomTypes(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { data, total } = yield this.Model.RoomModel().getAllRoomByRoomTypes({
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
    getAllAvailableRooms(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { data, total } = yield this.Model.RoomModel().getAllAvailableRooms({
                hotel_code,
                check_in: req.query.check_in,
                check_out: req.query.check_out,
                adult: parseInt(req.query.adult),
                child: parseInt(req.query.child),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // update hotel room
    updateroom(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { room_id } = req.params;
                const { room_name, room_type_id } = req.body;
                const settingModel = this.Model.settingModel(trx);
                const roomModel = this.Model.RoomModel(trx);
                const existingRoom = yield roomModel.getSingleRoom(hotel_code, parseInt(room_id));
                if (!existingRoom.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (room_name) {
                    const { data: roomsWithSameName } = yield roomModel.getAllRoom({
                        hotel_code,
                        exact_name: room_name,
                    });
                    if (roomsWithSameName.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "Room name already exists",
                        };
                    }
                }
                const currentRoom = existingRoom[0];
                if (room_type_id && currentRoom.room_type_id !== room_type_id) {
                    const newRoomType = yield settingModel.getSingleRoomType(room_type_id, hotel_code);
                    if (!newRoomType.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Room type not found",
                        };
                    }
                    const newAvailability = yield roomModel.getRoomAvailabilitiesByRoomTypeId(hotel_code, room_type_id);
                    if (newAvailability) {
                        yield roomModel.updateInRoomAvailabilities(hotel_code, room_type_id, {
                            total_rooms: newAvailability.total_rooms + 1,
                            available_rooms: newAvailability.available_rooms + 1,
                        });
                    }
                    else {
                        const todayPlus365 = new Date();
                        todayPlus365.setUTCDate(todayPlus365.getUTCDate() + 365);
                        const dateStr = todayPlus365.toISOString().split("T")[0];
                        yield roomModel.insertInRoomAvilabilities({
                            hotel_code,
                            room_type_id,
                            date: dateStr,
                            total_rooms: 1,
                            available_rooms: 1,
                        });
                    }
                    const prevAvailability = yield roomModel.getRoomAvailabilitiesByRoomTypeId(hotel_code, currentRoom.room_type_id);
                    if (prevAvailability.total_rooms === 1) {
                        yield roomModel.deleteInRoomAvailabilities({
                            hotel_code,
                            room_type_id: currentRoom.room_type_id,
                        });
                    }
                    else {
                        yield roomModel.updateInRoomAvailabilities(hotel_code, currentRoom.room_type_id, {
                            total_rooms: prevAvailability.total_rooms - 1,
                            available_rooms: prevAvailability.available_rooms - 1,
                        });
                    }
                }
                yield roomModel.updateRoom(parseInt(room_id), hotel_code, req.body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Room updated successfully",
                };
            }));
        });
    }
    // update room by status
    updateRoomStatus(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { room_id } = req.params;
                const { hotel_code } = req.hotel_admin;
                const { status } = req.body;
                const roomModel = this.Model.RoomModel(trx);
                const roomId = parseInt(room_id);
                const existingRoom = yield roomModel.getSingleRoom(hotel_code, roomId);
                if (!existingRoom.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const currentRoom = existingRoom[0];
                const currentStatus = currentRoom.status;
                if (currentStatus === status) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: `Room is already marked as ${status}.`,
                    };
                }
                const availability = yield roomModel.getRoomAvailabilitiesByRoomTypeId(hotel_code, currentRoom.room_type_id);
                if (status === "out_of_service") {
                    // Going out of service: reduce availability
                    if (availability.total_rooms === 1) {
                        yield roomModel.deleteInRoomAvailabilities({
                            hotel_code,
                            room_type_id: currentRoom.room_type_id,
                        });
                    }
                    else {
                        yield roomModel.updateInRoomAvailabilities(hotel_code, currentRoom.room_type_id, {
                            total_rooms: availability.total_rooms - 1,
                            available_rooms: availability.available_rooms - 1,
                        });
                    }
                }
                else if (currentStatus == "out_of_service" && status === "in_service") {
                    // Going back to in_service: increase availability
                    if (availability) {
                        yield roomModel.updateInRoomAvailabilities(hotel_code, currentRoom.room_type_id, {
                            total_rooms: availability.total_rooms + 1,
                            available_rooms: availability.available_rooms + 1,
                        });
                    }
                    else {
                        const todayPlus365 = new Date();
                        todayPlus365.setUTCDate(todayPlus365.getUTCDate() + 365);
                        const dateStr = todayPlus365.toISOString().split("T")[0];
                        yield roomModel.insertInRoomAvilabilities({
                            hotel_code,
                            room_type_id: currentRoom.room_type_id,
                            date: dateStr,
                            total_rooms: 1,
                            available_rooms: 1,
                        });
                    }
                }
                // Update the room status
                yield roomModel.updateRoom(roomId, hotel_code, { status });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: `Room status updated to ${status}.`,
                };
            }));
        });
    }
}
exports.RoomService = RoomService;
exports.default = RoomService;
//# sourceMappingURL=room.service%20copy.js.map