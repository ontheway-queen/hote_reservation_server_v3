import Joi from "joi";

class ReportValidator {
  // Room Report Validator
  public getAllHotelRoomQueryValidator = Joi.object({
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
  });

  // Room Booking Report Validator
  public getAllHotelRoomBookingQueryValidator = Joi.object({
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
    room_id: Joi.string().allow("").optional(),
    check_in_out_status: Joi.string().allow("").optional(),
    pay_status: Joi.string().allow("").optional(),
    status: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
  });

  // Account Report Validator
  public getAllAccountQueryValidator = Joi.object({
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    name: Joi.string().allow("").optional(),
  });

  // Expense Report Validator
  public getAllExpenseQueryValidator = Joi.object({
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    key: Joi.string().allow("").optional(),
  });

  // get Salary Report query validator
  public getSalaryReportQueryValidator = Joi.object({
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    key: Joi.string().allow("").optional(),
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
  });

  // Hall Booking Report Validator
  public getHallBookingQueryValidator = Joi.object({
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    check_in_out_status: Joi.string().allow("").optional(),
    pay_status: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    booking_status: Joi.string().allow("").optional(),
  });

  // client ledger Report Validator
  public getClientLedgerQueryValidator = Joi.object({
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    pay_type: Joi.string().allow("").optional(),
    user_id: Joi.string().allow("").optional(),
  });

  // Journal Report Validator
  public accountJournalReportQueryValidator = Joi.object({
    from_date: Joi.string().optional(),
    to_date: Joi.string().optional(),
  });

  // Account Ledger Report Validator
  public accountLedgerReportQueryValidator = Joi.object({
    from_date: Joi.string().required(),
    to_date: Joi.string().required(),
    head_id: Joi.number().integer().required(),
  });
}
export default ReportValidator;
