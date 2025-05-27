import { Router } from "express";
import HotelInventoryRouter from "../../appInventory/routers/inventory.app.router";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import AccountRouter from "./account.router";
import AdministrationRouter from "./administration.router";
import ExpenseRouter from "./expense.router";
import GuestRouter from "./guest.router";
import InvoiceRouter from "./invoice.router";
import MoneyRecieptRouter from "./money-reciept.router";
import PayRollRouter from "./payRoll.router";
import ReportRouter from "./reports.router";
import { ReservationRouter } from "./reservation.router";
import hotelRestaurantRouter from "./restaurant.hotel.router";
import RoomGuestRouter from "./room.guest.router";
import RoomRouter from "./room.router";
import SettingRouter from "./setting.router";

export class ReservationRootRouter {
  public router = Router();
  public authChecker = new AuthChecker();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.router.use(
      "/setting",
      this.authChecker.hotelAdminAuthChecker,
      new SettingRouter().router
    );

    this.router.use(
      "/room",
      this.authChecker.hotelAdminAuthChecker,
      new RoomRouter().router
    );

    this.router.use(
      "/report",
      this.authChecker.hotelAdminAuthChecker,
      new ReportRouter().router
    );

    this.router.use(
      "/administration",
      this.authChecker.hotelAdminAuthChecker,
      new AdministrationRouter().router
    );

    this.router.use(
      "/money-reciept",
      this.authChecker.hotelAdminAuthChecker,
      new MoneyRecieptRouter().router
    );

    this.router.use(
      "/account",
      this.authChecker.hotelAdminAuthChecker,
      new AccountRouter().router
    );

    this.router.use(
      "/invoice",
      this.authChecker.hotelAdminAuthChecker,
      new InvoiceRouter().router
    );

    this.router.use(
      "/expense",
      this.authChecker.hotelAdminAuthChecker,
      new ExpenseRouter().router
    );

    this.router.use(
      "/guest",
      this.authChecker.hotelAdminAuthChecker,
      new GuestRouter().router
    );

    this.router.use(
      "/room-guest",
      this.authChecker.hotelAdminAuthChecker,
      new RoomGuestRouter().router
    );

    this.router.use(
      "/payroll",
      this.authChecker.hotelAdminAuthChecker,
      new PayRollRouter().router
    );

    this.router.use(
      "/restaurant",
      this.authChecker.hotelAdminAuthChecker,
      new hotelRestaurantRouter().router
    );

    this.router.use(
      "/inventory",
      this.authChecker.hotelAdminAuthChecker,
      new HotelInventoryRouter().router
    );

    this.router.use(
      "/",
      this.authChecker.hotelAdminAuthChecker,
      new ReservationRouter().router
    );
  }
}
