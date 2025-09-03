import Joi from "joi";

class ExpenseValidator {
	// create expense head validator
	createExpenseHeadValidator = Joi.object({
		name: Joi.string().required(),
	});

	//update expense head validator
	UpdateExpenseHeadValidator = Joi.object({
		name: Joi.string().required(),
	});

	// create expense validator
	public createExpenseValidator = Joi.object({
		expense_by: Joi.number().required().messages({
			"any.required": "Expense By is required",
		}),
		expense_no: Joi.string().required().messages({
			"any.required": "Expense No is required",
		}),
		expense_date: Joi.string().required().messages({
			"any.required": "Expense Date is required",
		}),
		expense_note: Joi.string().allow("").optional(),
		pay_method: Joi.string()
			.valid("CASH", "BANK", "MOBILE_BANKING", "CHEQUE")
			.required(),

		account_id: Joi.number().when("pay_method", {
			is: Joi.valid("CASH", "BANK", "MOBILE_BANKING"),
			then: Joi.number().required().messages({
				"any.required":
					"Account ID is required when payment method is CASH, BANK or MOBILE_BANKING",
			}),
			otherwise: Joi.optional(),
		}),

		cheque_no: Joi.string().when("pay_method", {
			is: "CHEQUE",
			then: Joi.required().messages({
				"any.required":
					"Check No is required when payment method is CHEQUE",
			}),
			otherwise: Joi.optional(),
		}),

		cheque_date: Joi.string().when("pay_method", {
			is: "CHEQUE",
			then: Joi.required().messages({
				"any.required":
					"Check Date is required when payment method is CHEQUE",
			}),
			otherwise: Joi.optional(),
		}),

		bank_name: Joi.string().when("pay_method", {
			is: "CHEQUE",
			then: Joi.required().messages({
				"any.required":
					"Bank Name is required when payment method is CHEQUE",
			}),
			otherwise: Joi.optional(),
		}),

		branch_name: Joi.string().when("pay_method", {
			is: "CHEQUE",
			then: Joi.required().messages({
				"any.required":
					"Branch Name is required when payment method is CHEQUE",
			}),
			otherwise: Joi.optional(),
		}),

		transaction_no: Joi.string().when("pay_method", {
			is: "MOBILE_BANKING",
			then: Joi.required().messages({
				"any.required":
					"Transaction No is required when payment method is MOBILE_BANKING",
			}),
			otherwise: Joi.optional(),
		}),

		total_amount: Joi.number().required(),

		expense_items: Joi.string().custom((value, helpers) => {
			try {
				const parsedObject = JSON.parse(value);
				const deductionType = typeof parsedObject;
				if (deductionType !== "object") {
					return helpers.message({
						custom: "Invalid Expense Items: should be a JSON object",
					});
				}
				return value;
			} catch (err) {
				return helpers.message({
					custom: "Invalid Expense Items: should be a valid JSON Object",
				});
			}
		}),
	});

	// get all room booking query validator
	public getAllExpenseQueryValidator = Joi.object({
		limit: Joi.string().optional(),
		skip: Joi.string().optional(),
		key: Joi.string().allow("").optional(),
		from_date: Joi.string().allow("").optional(),
		to_date: Joi.string().allow("").optional(),
	});
}
export default ExpenseValidator;

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
