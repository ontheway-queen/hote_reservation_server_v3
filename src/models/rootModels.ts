import { Knex } from "knex";
import ClientModel from "./ClientModel/client.Model";
import CommonModel from "./commonModel/commonModel";
import MAdministrationModel from "./managementsModel/mAdministrationModel/mAdministration.model";
import MConfigurationModel from "./managementsModel/mConfigurationModel/mConfigurationModel";
import AccountModel from "./reservationPanel/accountModel";
import DashBoardModel from "./reservationPanel/dashBoardModel";
import EmployeeModel from "./reservationPanel/employeeModel";
import ExpenseModel from "./reservationPanel/expenseModel";
import GuestModel from "./reservationPanel/guestModel";
import HotelModel from "./reservationPanel/hotel.model";

import HotelInvoiceModel from "./reservationPanel/hotelInvoiceModel";
import CommonInventoryModel from "./reservationPanel/inventoryModel/common.inventory.model";
import ProductInventoryModel from "./reservationPanel/inventoryModel/product.inventory.model";
import PurchaseInventoryModel from "./reservationPanel/inventoryModel/puschase.inventory.model";
import StockInventoryModel from "./reservationPanel/inventoryModel/stock.inventory.model";
import PayRollModel from "./reservationPanel/payRollModel";
import RAdministrationModel from "./reservationPanel/rAdministration.model";
import ReportModel from "./reservationPanel/ReportModel/ReportModel";
import RoomModel from "./reservationPanel/Room.Model";
import RoomBookingModel from "./reservationPanel/roomBookingModel";
import SettingModel from "./reservationPanel/Setting.Model";
import { ReservationModel } from "./reservationPanel/reservation.model";

class Models {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  public commonModel(trx?: Knex.Transaction) {
    return new CommonModel(trx || this.db);
  }

  public RoomModel(trx?: Knex.Transaction) {
    return new RoomModel(trx || this.db);
  }

  public reservationModel(trx?: Knex.Transaction) {
    return new ReservationModel(trx || this.db);
  }

  public roomBookingModel(trx?: Knex.Transaction) {
    return new RoomBookingModel(trx || this.db);
  }

  public rAdministrationModel(trx?: Knex.Transaction) {
    return new RAdministrationModel(trx || this.db);
  }

  public hotelInvoiceModel(trx?: Knex.Transaction) {
    return new HotelInvoiceModel(trx || this.db);
  }

  public reportModel(trx?: Knex.Transaction) {
    return new ReportModel(trx || this.db);
  }

  public accountModel(trx?: Knex.Transaction) {
    return new AccountModel(trx || this.db);
  }

  public expenseModel(trx?: Knex.Transaction) {
    return new ExpenseModel(trx || this.db);
  }

  public settingModel(trx?: Knex.Transaction) {
    return new SettingModel(trx || this.db);
  }

  public guestModel(trx?: Knex.Transaction) {
    return new GuestModel(trx || this.db);
  }

  public employeeModel(trx?: Knex.Transaction) {
    return new EmployeeModel(trx || this.db);
  }

  public payRollModel(trx?: Knex.Transaction) {
    return new PayRollModel(trx || this.db);
  }

  public dashBoardModel(trx?: Knex.Transaction) {
    return new DashBoardModel(trx || this.db);
  }

  //=============== Inventory model Start ================ //

  // category, unit, brand, supplier
  public CommonInventoryModel(trx?: Knex.Transaction) {
    return new CommonInventoryModel(trx || this.db);
  }

  // product, damaged product
  public productInventoryModel(trx?: Knex.Transaction) {
    return new ProductInventoryModel(trx || this.db);
  }

  // puchase
  public purchaseInventoryModel(trx?: Knex.Transaction) {
    return new PurchaseInventoryModel(trx || this.db);
  }

  // stock
  public stockInventoryModel(trx?: Knex.Transaction) {
    return new StockInventoryModel(trx || this.db);
  }

  //=============== m360ict panel model start ================ //

  // hotel user model
  public HotelModel(trx?: Knex.Transaction) {
    return new HotelModel(trx || this.db);
  }

  public mAdmiministrationModel(trx?: Knex.Transaction) {
    return new MAdministrationModel(trx || this.db);
  }

  // configuration model
  public mConfigurationModel(trx?: Knex.Transaction) {
    return new MConfigurationModel(trx || this.db);
  }
}
export default Models;
