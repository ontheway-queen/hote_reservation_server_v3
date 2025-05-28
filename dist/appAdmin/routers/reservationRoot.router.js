"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationRootRouter = void 0;
const express_1 = require("express");
const inventory_app_router_1 = __importDefault(require("../../appInventory/routers/inventory.app.router"));
const authChecker_1 = __importDefault(require("../../common/middleware/authChecker/authChecker"));
const account_router_1 = __importDefault(require("./account.router"));
const administration_router_1 = __importDefault(require("./administration.router"));
const expense_router_1 = __importDefault(require("./expense.router"));
const guest_router_1 = __importDefault(require("./guest.router"));
const invoice_router_1 = __importDefault(require("./invoice.router"));
const money_reciept_router_1 = __importDefault(require("./money-reciept.router"));
const payRoll_router_1 = __importDefault(require("./payRoll.router"));
const reports_router_1 = __importDefault(require("./reports.router"));
const reservation_router_1 = require("./reservation.router");
const room_guest_router_1 = __importDefault(require("./room.guest.router"));
const room_router_1 = __importDefault(require("./room.router"));
const setting_router_1 = __importDefault(require("./setting.router"));
class ReservationRootRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.use("/setting", this.authChecker.hotelAdminAuthChecker, new setting_router_1.default().router);
        this.router.use("/room", this.authChecker.hotelAdminAuthChecker, new room_router_1.default().router);
        this.router.use("/report", this.authChecker.hotelAdminAuthChecker, new reports_router_1.default().router);
        this.router.use("/administration", this.authChecker.hotelAdminAuthChecker, new administration_router_1.default().router);
        this.router.use("/money-reciept", this.authChecker.hotelAdminAuthChecker, new money_reciept_router_1.default().router);
        this.router.use("/account", this.authChecker.hotelAdminAuthChecker, new account_router_1.default().router);
        this.router.use("/invoice", this.authChecker.hotelAdminAuthChecker, new invoice_router_1.default().router);
        this.router.use("/expense", this.authChecker.hotelAdminAuthChecker, new expense_router_1.default().router);
        this.router.use("/guest", this.authChecker.hotelAdminAuthChecker, new guest_router_1.default().router);
        this.router.use("/room-guest", this.authChecker.hotelAdminAuthChecker, new room_guest_router_1.default().router);
        this.router.use("/payroll", this.authChecker.hotelAdminAuthChecker, new payRoll_router_1.default().router);
        this.router.use("/inventory", this.authChecker.hotelAdminAuthChecker, new inventory_app_router_1.default().router);
        this.router.use("/", this.authChecker.hotelAdminAuthChecker, new reservation_router_1.ReservationRouter().router);
    }
}
exports.ReservationRootRouter = ReservationRootRouter;
//# sourceMappingURL=reservationRoot.router.js.map