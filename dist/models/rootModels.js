"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_Model_1 = __importDefault(require("./ClientModel/client.Model"));
const commonModel_1 = __importDefault(require("./commonModel/commonModel"));
const mAdministration_model_1 = __importDefault(require("./managementsModel/mAdministrationModel/mAdministration.model"));
const mConfigurationModel_1 = __importDefault(require("./managementsModel/mConfigurationModel/mConfigurationModel"));
const accountModel_1 = __importDefault(require("./reservationPanel/accountModel"));
const dashBoardModel_1 = __importDefault(require("./reservationPanel/dashBoardModel"));
const employeeModel_1 = __importDefault(require("./reservationPanel/employeeModel"));
const expenseModel_1 = __importDefault(require("./reservationPanel/expenseModel"));
const guestModel_1 = __importDefault(require("./reservationPanel/guestModel"));
const hotel_model_1 = __importDefault(require("./reservationPanel/hotel.model"));
const hotelInvoiceModel_1 = __importDefault(require("./reservationPanel/hotelInvoiceModel"));
const common_inventory_model_1 = __importDefault(require("./reservationPanel/inventoryModel/common.inventory.model"));
const product_inventory_model_1 = __importDefault(require("./reservationPanel/inventoryModel/product.inventory.model"));
const puschase_inventory_model_1 = __importDefault(require("./reservationPanel/inventoryModel/puschase.inventory.model"));
const stock_inventory_model_1 = __importDefault(require("./reservationPanel/inventoryModel/stock.inventory.model"));
const payRollModel_1 = __importDefault(require("./reservationPanel/payRollModel"));
const rAdministration_model_1 = __importDefault(require("./reservationPanel/rAdministration.model"));
const ReportModel_1 = __importDefault(require("./reservationPanel/ReportModel/ReportModel"));
const Room_Model_1 = __importDefault(require("./reservationPanel/Room.Model"));
const roomBookingModel_1 = __importDefault(require("./reservationPanel/roomBookingModel"));
const Setting_Model_1 = __importDefault(require("./reservationPanel/Setting.Model"));
const res_admin_role_model_1 = __importDefault(require("./restaurantModel/res.admin.role.model"));
const res_common_model_1 = __importDefault(require("./restaurantModel/res.common.model"));
const res_food_model_1 = __importDefault(require("./restaurantModel/res.food.model"));
const res_order_model_1 = __importDefault(require("./restaurantModel/res.order.model"));
const res_report_model_1 = __importDefault(require("./restaurantModel/res.report.model"));
const restaurant_Model_1 = __importDefault(require("./restaurantModel/restaurant.Model"));
const reservation_model_1 = require("./reservationPanel/reservation.model");
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
    roomBookingModel(trx) {
        return new roomBookingModel_1.default(trx || this.db);
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
    payRollModel(trx) {
        return new payRollModel_1.default(trx || this.db);
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
    //=============== Restaurant model start ================ //
    // hotel Restaurant
    restaurantModel(trx) {
        return new restaurant_Model_1.default(trx || this.db);
    }
    // admin role permission
    resAdminRoleModel(trx) {
        return new res_admin_role_model_1.default(trx || this.db);
    }
    // Restaurant, account, expense, invoice, supplier
    resCommonModel(trx) {
        return new res_common_model_1.default(trx || this.db);
    }
    // category, ingredient, purchase, inventory, food
    resFoodModel(trx) {
        return new res_food_model_1.default(trx || this.db);
    }
    // table, order, kitchen
    resOrderModel(trx) {
        return new res_order_model_1.default(trx || this.db);
    }
    // Restaurant Reports
    resReportModel(trx) {
        return new res_report_model_1.default(trx || this.db);
    }
    //=============== client panel model start ================ //
    // hotel hall booking
    clientModel(trx) {
        return new client_Model_1.default(trx || this.db);
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
}
exports.default = Models;
//# sourceMappingURL=rootModels.js.map