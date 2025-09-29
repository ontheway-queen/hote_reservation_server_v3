import { Router } from "express";
import HotelInventoryRouter from "../appInventory/inventory.root.router";
import AuthChecker from "../common/middleware/authChecker/authChecker";
import AccountRouter from "./routers/account.router";
import AdminBtocHandlerRouter from "./routers/adminBtocHandler.router";
import AdministrationRouter from "./routers/administration.router";
import ChannelManagerRouter from "./routers/channelManager.router";
import CommonRouter from "./routers/common.router";
import ExpenseRouter from "./routers/expense.router";
import FolioRouter from "./routers/folio.router";
import GuestRouter from "./routers/guest.router";
import HrRouter from "./routers/hr.router";
import InvoiceRouter from "./routers/invoice.router";
import MoneyRecieptRouter from "./routers/money-reciept.router";
import ReportRouter from "./routers/reports.router";
import { ReservationRouter } from "./routers/reservation.router";
import HotelRestaurantRouter from "./routers/restaurant.hotel.router";
import RoomGuestRouter from "./routers/room.guest.router";
import RoomRouter from "./routers/room.router";
import ServiceRouter from "./routers/service.router";
import ServiceCategoriesRouter from "./routers/serviceCategories.router";
import SettingRouter from "./routers/setting.router";
import SupplierRouter from "./routers/supplier.router";

export class ReservationRootRouter {
	public router = Router();
	public authChecker = new AuthChecker();

	constructor() {
		this.callRouter();
	}

	private callRouter() {
		this.router.use(
			"/common",
			this.authChecker.hotelAdminAuthChecker,
			new CommonRouter().router
		);

		this.router.use(
			"/hr",
			this.authChecker.hotelAdminAuthChecker,
			new HrRouter().router
		);

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
			"/channel-manager",
			this.authChecker.hotelAdminAuthChecker,
			new ChannelManagerRouter().router
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
			"/money-receipt",
			this.authChecker.hotelAdminAuthChecker,
			new MoneyRecieptRouter().router
		);

		this.router.use(
			"/account",
			this.authChecker.hotelAdminAuthChecker,
			new AccountRouter().router
		);

		this.router.use(
			"/folio",
			this.authChecker.hotelAdminAuthChecker,
			new FolioRouter().router
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
			"/inventory",
			this.authChecker.hotelAdminAuthChecker,
			new HotelInventoryRouter().router
		);

		this.router.use(
			"/supplier",
			this.authChecker.hotelAdminAuthChecker,
			new SupplierRouter().router
		);

		this.router.use(
			"/btoc",
			this.authChecker.hotelAdminAuthChecker,
			new AdminBtocHandlerRouter().router
		);

		this.router.use(
			"/service-categories",
			this.authChecker.hotelAdminAuthChecker,
			new ServiceCategoriesRouter().router
		);

		this.router.use(
			"/services",
			this.authChecker.hotelAdminAuthChecker,
			new ServiceRouter().router
		);

		this.router.use(
			"/restaurant",
			this.authChecker.hotelAdminAuthChecker,
			new HotelRestaurantRouter().router
		);

		this.router.use(
			"/",
			this.authChecker.hotelAdminAuthChecker,
			new ReservationRouter().router
		);
	}
}
