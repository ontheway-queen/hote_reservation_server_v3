"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const b2cConfigurationModel_1 = __importDefault(require("./b2cConfigurationModel/b2cConfigurationModel"));
const btoc_invoiceModel_1 = __importDefault(require("./btocInvModel/btoc.invoiceModel"));
const btoc_model_1 = require("./btocModels/btoc.model");
const commonModel_1 = __importDefault(require("./commonModel/commonModel"));
const dboModel_1 = __importDefault(require("./commonModel/dboModel"));
const service_model_1 = __importDefault(require("./hotelServiceModel/service.model"));
const serviceCategories_model_1 = __importDefault(require("./hotelServiceModel/serviceCategories.model"));
const serviceImage_model_1 = __importDefault(require("./hotelServiceModel/serviceImage.model"));
const servicePricing_model_1 = __importDefault(require("./hotelServiceModel/servicePricing.model"));
const serviceSchedule_model_1 = __importDefault(require("./hotelServiceModel/serviceSchedule.model"));
const mAdministration_model_1 = __importDefault(require("./managementsModel/mAdministrationModel/mAdministration.model"));
const mConfigurationModel_1 = __importDefault(require("./managementsModel/mConfigurationModel/mConfigurationModel"));
const accountModel_1 = __importDefault(require("./reservationPanel/accountModel/accountModel"));
const channelManager_model_1 = __importDefault(require("./reservationPanel/channelManager.model"));
const dashBoardModel_1 = __importDefault(require("./reservationPanel/dashBoardModel"));
const employeeModel_1 = __importDefault(require("./reservationPanel/employeeModel"));
const expenseModel_1 = __importDefault(require("./reservationPanel/expenseModel"));
const guestModel_1 = __importDefault(require("./reservationPanel/guestModel"));
const hotel_model_1 = __importDefault(require("./reservationPanel/hotel.model"));
const hotelInvoiceModel_1 = __importDefault(require("./reservationPanel/hotelInvoiceModel"));
const hrModel_1 = __importDefault(require("./reservationPanel/hrModel"));
const common_inventory_model_1 = __importDefault(require("./reservationPanel/inventoryModel/common.inventory.model"));
const inventory_model_1 = __importDefault(require("./reservationPanel/inventoryModel/inventory.model"));
const product_inventory_model_1 = __importDefault(require("./reservationPanel/inventoryModel/product.inventory.model"));
const puschase_inventory_model_1 = __importDefault(require("./reservationPanel/inventoryModel/puschase.inventory.model"));
const stock_inventory_model_1 = __importDefault(require("./reservationPanel/inventoryModel/stock.inventory.model"));
const payment_model_1 = __importDefault(require("./reservationPanel/paymentModel/payment.model"));
const payRollModel_1 = __importDefault(require("./reservationPanel/payRollModel"));
const rAdministration_model_1 = __importDefault(require("./reservationPanel/rAdministration.model"));
const ReportModel_1 = __importDefault(require("./reservationPanel/ReportModel/ReportModel"));
const reservation_model_1 = require("./reservationPanel/reservation.model");
const Room_Model_1 = __importDefault(require("./reservationPanel/Room.Model"));
const Setting_Model_1 = __importDefault(require("./reservationPanel/Setting.Model"));
const restaurant_admin_model_1 = __importDefault(require("./restaurantModel/restaurant.admin.model"));
const restaurant_Model_1 = __importDefault(require("./restaurantModel/restaurant.Model"));
class Models {
    constructor(db) {
        this.db = db;
    }
    commonModel(trx) {
        return new commonModel_1.default(trx || this.db);
    }
    RoomModel(trx) {
        return new Room_Model_1.default(trx || this.db);
    }
    reservationModel(trx) {
        return new reservation_model_1.ReservationModel(trx || this.db);
    }
    rAdministrationModel(trx) {
        return new rAdministration_model_1.default(trx || this.db);
    }
    hotelInvoiceModel(trx) {
        return new hotelInvoiceModel_1.default(trx || this.db);
    }
    reportModel(trx) {
        return new ReportModel_1.default(trx || this.db);
    }
    accountModel(trx) {
        return new accountModel_1.default(trx || this.db);
    }
    expenseModel(trx) {
        return new expenseModel_1.default(trx || this.db);
    }
    settingModel(trx) {
        return new Setting_Model_1.default(trx || this.db);
    }
    guestModel(trx) {
        return new guestModel_1.default(trx || this.db);
    }
    employeeModel(trx) {
        return new employeeModel_1.default(trx || this.db);
    }
    hrModel(trx) {
        return new hrModel_1.default(trx || this.db);
    }
    payRollModel(trx) {
        return new payRollModel_1.default(trx || this.db);
    }
    channelManagerModel(trx) {
        return new channelManager_model_1.default(trx || this.db);
    }
    dashBoardModel(trx) {
        return new dashBoardModel_1.default(trx || this.db);
    }
    //=============== Inventory model Start ================ //
    // category, unit, brand, supplier
    CommonInventoryModel(trx) {
        return new common_inventory_model_1.default(trx || this.db);
    }
    // product, damaged product
    productInventoryModel(trx) {
        return new product_inventory_model_1.default(trx || this.db);
    }
    // puchase
    purchaseInventoryModel(trx) {
        return new puschase_inventory_model_1.default(trx || this.db);
    }
    // stock
    stockInventoryModel(trx) {
        return new stock_inventory_model_1.default(trx || this.db);
    }
    // payment model
    paymentModel(trx) {
        return new payment_model_1.default(trx || this.db);
    }
    //=============== m360ict panel model start ================ //
    // hotel user model
    HotelModel(trx) {
        return new hotel_model_1.default(trx || this.db);
    }
    mAdmiministrationModel(trx) {
        return new mAdministration_model_1.default(trx || this.db);
    }
    // configuration model
    mConfigurationModel(trx) {
        return new mConfigurationModel_1.default(trx || this.db);
    }
    DboModel(trx) {
        return new dboModel_1.default(trx || this.db);
    }
    //--------------------- Btoc Model ---------------------------//
    btocUserModel(trx) {
        return new btoc_model_1.BtocUserModel(trx || this.db);
    }
    // ------------- Btoc Configuration Model ----------------- //
    b2cConfigurationModel(trx) {
        return new b2cConfigurationModel_1.default(trx || this.db);
    }
    btocInvoiceModel(trx) {
        return new btoc_invoiceModel_1.default(trx || this.db);
    }
    inventoryModel(trx) {
        return new inventory_model_1.default(trx || this.db);
    }
    serviceCategoriesModel(trx) {
        return new serviceCategories_model_1.default(trx || this.db);
    }
    serviceModel(trx) {
        return new service_model_1.default(trx || this.db);
    }
    serviceImageModel(trx) {
        return new serviceImage_model_1.default(trx || this.db);
    }
    servicePricingModel(trx) {
        return new servicePricing_model_1.default(trx || this.db);
    }
    serviceScheduleModel(trx) {
        return new serviceSchedule_model_1.default(trx || this.db);
    }
    restaurantModel(trx) {
        return new restaurant_Model_1.default(trx || this.db);
    }
    restaurantAdminModel(trx) {
        return new restaurant_admin_model_1.default(trx || this.db);
    }
}
exports.default = Models;
//# sourceMappingURL=rootModels.js.map