import Joi from "joi";

class AdvancedRoomBookingValidator {
  // create advanced room booking validator
  public createAdvancedRoomBookingValidator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().allow("").optional(),
    phone: Joi.string().allow("").optional(),
    check_in_time: Joi.string().required(),
    check_out_time: Joi.string().required(),
    nationality: Joi.string().allow("").optional(),
    group_name: Joi.string().allow("").optional(),
    total_room: Joi.number().required(),
    extra_charge: Joi.number().optional(),
  });

  // confirm room booking validator
  public confirmRoomBookingValidator = Joi.object({
    discount_amount: Joi.number().required(),
    tax_amount: Joi.number().required(),
    payment_type: Joi.string().allow("").optional(),
    check_in_time: Joi.string().allow("").optional(),
    ac_tr_ac_id: Joi.number().optional(),
    total_room: Joi.number().optional(),
    extra_charge: Joi.number().required(),
    paid_amount: Joi.number().optional(),
    check_in: Joi.number().valid(1, 0).required(),
    booking_rooms: Joi.array()
      .items(
        Joi.object({
          room_id: Joi.number().required(),
          amount: Joi.number().required(),
          name: Joi.string().required(),
        })
      )
      .required(),
  });

  // refund room booking
  public refundRoomBookingValidator = Joi.object({
    charge: Joi.number().required(),
    refund_from_acc: Joi.number().required(),
    refund_type: Joi.string().required(),
  });

  // get all room booking query validator
  public getAllRoomBookingQueryValidator = Joi.object({
    limit: Joi.string().optional(),
    skip: Joi.string().optional(),
    name: Joi.string().allow("").optional(),
    status: Joi.string().allow("").optional(),
    user_id: Joi.string().allow("").optional(),
  });

  // insert booking check in
  public insertBookingCheckIn = Joi.object({
    booking_id: Joi.number().required(),
    check_in: Joi.string().required(),
  });

  // add booking check out
  public addBookingCheckOut = Joi.object({
    check_out: Joi.string().required(),
  });

  // extend Room Booking Validator
  public extendRoomBookingValidator = Joi.object({
    check_out_time: Joi.string().required(),
    sub_total: Joi.number().optional(),
    due: Joi.number().optional(),
    grand_total: Joi.number().optional(),
    extend_status: Joi.number().optional(),
    extend_nights: Joi.number().optional(),
    booking_rooms: Joi.array()
      .items(
        Joi.object({
          room_id: Joi.number().required(),
        })
      )
      .required(),
  });
}
export default AdvancedRoomBookingValidator;
