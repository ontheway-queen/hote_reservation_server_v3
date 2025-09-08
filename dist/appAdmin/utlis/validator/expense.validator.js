"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class ExpenseValidator {
    constructor() {
        // create expense head validator
        this.createExpenseHeadValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
        });
        //update expense head validator
        this.UpdateExpenseHeadValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
        });
        // create expense validator
        this.createExpenseValidator = joi_1.default.object({
            expense_by: joi_1.default.number().required().messages({
                "any.required": "Expense By is required",
            }),
            expense_date: joi_1.default.string().required().messages({
                "any.required": "Expense Date is required",
            }),
            expense_note: joi_1.default.string().allow("").optional(),
            pay_method: joi_1.default.string()
                .valid("CASH", "BANK", "MOBILE_BANKING", "CHEQUE")
                .required(),
            account_id: joi_1.default.number().when("pay_method", {
                is: joi_1.default.valid("CASH", "BANK", "MOBILE_BANKING"),
                then: joi_1.default.number().required().messages({
                    "any.required": "Account ID is required when payment method is CASH, BANK or MOBILE_BANKING",
                }),
                otherwise: joi_1.default.optional(),
            }),
            cheque_no: joi_1.default.string().when("pay_method", {
                is: "CHEQUE",
                then: joi_1.default.required().messages({
                    "any.required": "Check No is required when payment method is CHEQUE",
                }),
                otherwise: joi_1.default.optional(),
            }),
            cheque_date: joi_1.default.string().when("pay_method", {
                is: "CHEQUE",
                then: joi_1.default.required().messages({
                    "any.required": "Check Date is required when payment method is CHEQUE",
                }),
                otherwise: joi_1.default.optional(),
            }),
            bank_name: joi_1.default.string().when("pay_method", {
                is: "CHEQUE",
                then: joi_1.default.required().messages({
                    "any.required": "Bank Name is required when payment method is CHEQUE",
                }),
                otherwise: joi_1.default.optional(),
            }),
            branch_name: joi_1.default.string().when("pay_method", {
                is: "CHEQUE",
                then: joi_1.default.required().messages({
                    "any.required": "Branch Name is required when payment method is CHEQUE",
                }),
                otherwise: joi_1.default.optional(),
            }),
            transaction_no: joi_1.default.string().when("pay_method", {
                is: "MOBILE_BANKING",
                then: joi_1.default.required().messages({
                    "any.required": "Transaction No is required when payment method is MOBILE_BANKING",
                }),
                otherwise: joi_1.default.optional(),
            }),
            expense_items: joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed)) {
                        return helpers.message({
                            custom: "Invalid Expense Items: should be an array of objects",
                        });
                    }
                    // validate each item inside array
                    for (const item of parsed) {
                        if (typeof item.id !== "number") {
                            return helpers.message({
                                custom: "Each expense item must have a numeric id",
                            });
                        }
                        if (item.remarks && typeof item.remarks !== "string") {
                            return helpers.message({
                                custom: "Each expense item must have a string remarks",
                            });
                        }
                        if (typeof item.amount !== "number") {
                            return helpers.message({
                                custom: "Each expense item must have a numeric amount",
                            });
                        }
                    }
                    return parsed; // ✅ will pass parsed array to `req.body`
                }
                catch (err) {
                    return helpers.message({
                        custom: "Invalid Expense Items: should be a valid JSON array",
                    });
                }
            }),
        });
        // get all room booking query validator
        this.getAllExpenseQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().optional(),
            skip: joi_1.default.string().optional(),
            key: joi_1.default.string().allow("").optional(),
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
        });
    }
}
exports.default = ExpenseValidator;
/*

CREATE TYPE hotel_reservation.pay_method_enum AS ENUM ('CASH', 'BANK', 'MOBILE_BANKING', 'CHEQUE');

CREATE TABLE hotel_reservation.expense (
    id SERIAL PRIMARY KEY,
    hotel_code INT NOT NULL REFERENCES hotel_reservation.hotels(hotel_code),
    voucher_no VARCHAR(20) NOT NULL,
    expense_date DATE NOT NULL,
    expense_by INT NOT NULL REFERENCES hr.employee(id),
    expense_no VARCHAR(50) NOT NULL,
    pay_method pay_method_enum NOT NULL,
    transaction_no VARCHAE(50),
    expense_cheque_id INT,
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    cheque_no VARCHAR(50),
    cheque_date DATE,
    deposit_date DATE,
    account_id INT,
    expense_amount NUMERIC(10,2) NOT NULL,
    expense_note VARCHAR(255),
    acc_voucher_id INT NOT NULL,
    expense_voucher_url_1 VARCHAR(255),
    expense_voucher_url_2 VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    is_deleted SMALLINT DEFAULT 0,
    deleted_by INT
);
*/
/* CREATE TABLE hotel_reservation.expense_items (
    id SERIAL PRIMARY KEY,
    expense_id INT NOT NULL REFERENCES hotel_reservation.expense(id),
    expense_head_id INT NOT NULL REFERENCES hotel_reservation.expense_head(id),
    amount NUMERIC(10,2) NOT NULL,
    remarks VARCHAR(455) NOT NULL
); */
//# sourceMappingURL=expense.validator.js.map