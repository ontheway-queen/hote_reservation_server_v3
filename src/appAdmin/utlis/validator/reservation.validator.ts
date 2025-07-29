import Joi from "joi";
export class ReservationValidator {
  public getAvailableRoomsQueryValidator = Joi.object({
    check_in: Joi.date().required(),
    check_out: Joi.date().required(),
  });

  // public createBookingValidator = Joi.object({
  //   reservation_type: Joi.string().valid("hold", "booked").required(),
  //   is_checked_in: Joi.bool().required(),
  //   is_individual_booking: Joi.bool().required(),
  //   check_in: Joi.date().iso().required(),
  //   check_out: Joi.date().iso().required(),
  //   guest: Joi.object({
  //     first_name: Joi.string().required(),
  //     last_name: Joi.string().required(),
  //     email: Joi.string().email().allow("").optional(),
  //     address: Joi.string().allow("").optional(),
  //     phone: Joi.string().required(),
  //     nationality: Joi.string().required(),
  //     country: Joi.string().required(),
  //   }).required(),

  //   pickup: Joi.boolean().required(),
  //   pickup_from: Joi.when("pickup", {
  //     is: true,
  //     then: Joi.string().required(),
  //     otherwise: Joi.forbidden(),
  //   }),
  //   pickup_time: Joi.when("pickup", {
  //     is: true,
  //     then: Joi.string().isoDate().required(), // assuming ISO datetime string
  //     otherwise: Joi.forbidden(),
  //   }),

  //   drop: Joi.boolean().required(),
  //   drop_to: Joi.when("drop", {
  //     is: true,
  //     then: Joi.string().required(),
  //     otherwise: Joi.forbidden(),
  //   }),
  //   drop_time: Joi.when("drop", {
  //     is: true,
  //     then: Joi.string().isoDate().required(),
  //     otherwise: Joi.forbidden(),
  //   }),

  //   // discount_amount: Joi.number().min(0).required(),
  //   service_charge: Joi.number().min(0).required(),
  //   vat: Joi.number().min(0).required(),
  //   rooms: Joi.array()
  //     .items(
  //       Joi.object({
  //         room_type_id: Joi.number().required(),
  //         rate_plan_id: Joi.number().required(),
  //         rate: Joi.object({
  //           base_price: Joi.number().required(),
  //           changed_price: Joi.number().required(),
  //         }).required(),
  //         number_of_rooms: Joi.number().min(1).required(),

  //         guests: Joi.array()
  //           .items(
  //             Joi.object({
  //               room_id: Joi.number().required(),
  //               adults: Joi.number().min(1).required(),
  //               children: Joi.number().min(0).required(),
  //               infant: Joi.number().min(0).required(),
  //               cbf: Joi.number().min(0).required(),
  //             })
  //           )
  //           .min(1)
  //           .required(),

  //         meal_plans_ids: Joi.array().items(Joi.number()).optional(),
  //       })
  //     )
  //     .min(1)
  //     .required(),

  //   company_name: Joi.string().allow("").optional(),
  //   visit_purpose: Joi.string().allow("").optional(),
  //   is_company_booked: Joi.boolean().optional().default(false),
  //   special_requests: Joi.string().allow("").optional(),
  //   is_payment_given: Joi.bool().required(),
  //   payment: Joi.object({
  //     method: Joi.string().valid("MOBILE_BANKING", "BANK", "CASH").required(),
  //     acc_id: Joi.number().required(),
  //     amount: Joi.number().required(),
  //   }).optional(),

  //   source_id: Joi.number().required(),
  // });

  public createBookingValidator = Joi.object({
    is_individual_booking: Joi.bool().required(),
    reservation_type: Joi.string().valid("hold", "booked").required(),
    is_checked_in: Joi.bool().required(),
    check_in: Joi.date().iso().required(),
    check_out: Joi.date().iso().required(),
    pickup: Joi.boolean().required(),
    pickup_from: Joi.when("pickup", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),

    pickup_time: Joi.when("pickup", {
      is: true,
      then: Joi.string().isoDate().required(),
      otherwise: Joi.forbidden(),
    }),

    drop: Joi.boolean().required(),
    drop_to: Joi.when("drop", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    drop_time: Joi.when("drop", {
      is: true,
      then: Joi.string().isoDate().required(),
      otherwise: Joi.forbidden(),
    }),
    service_charge: Joi.number().min(0).required(),
    vat: Joi.number().min(0).required(),
    service_charge_percentage: Joi.number().min(0).default(0),
    vat_percentage: Joi.number().min(0).default(0),
    lead_guest_info: Joi.object({
      first_name: Joi.string().optional(),
      last_name: Joi.string().allow("").optional(),
      email: Joi.string().allow("").optional(),
      phone: Joi.string().allow("").optional(),
      country_id: Joi.number().required(),
      address: Joi.string().allow("").optional(),
      passport_no: Joi.string().allow("").optional(),
      type: Joi.string().allow("adult", "child", "infant").required(),
    }),
    booked_room_types: Joi.array()
      .items(
        Joi.object({
          room_type_id: Joi.number().required(),
          rate_plan_id: Joi.number().required(),
          rooms: Joi.array()
            .items(
              Joi.object({
                check_in: Joi.date().iso().required(),
                check_out: Joi.date().iso().required(),
                room_id: Joi.number().required(),
                cbf: Joi.number().required().default(0),
                adults: Joi.number().min(1).required(),
                children: Joi.number().min(0).required(),
                infant: Joi.number().min(0).required(),
                rate: Joi.object({
                  base_rate: Joi.number().required(),
                  changed_rate: Joi.number().required(),
                }).required(),
                guest_info: Joi.array().items(
                  Joi.object({
                    first_name: Joi.string().optional(),
                    last_name: Joi.string().allow("").optional(),
                    email: Joi.string().allow("").optional(),
                    phone: Joi.string().allow("").optional(),
                    country_id: Joi.number().required(),
                    address: Joi.string().allow("").optional(),
                    passport_no: Joi.string().allow("").optional(),
                    type: Joi.string()
                      .allow("adult", "child", "infant")
                      .required(),
                    is_room_primary_guest: Joi.boolean().required(),
                  })
                ),
              })
            )
            .min(1)
            .required(),

          meal_plans_ids: Joi.array().items(Joi.number()).optional(),
        })
      )
      .min(1)
      .required(),

    company_name: Joi.string().allow("").optional(),
    visit_purpose: Joi.string().allow("").optional(),
    is_company_booked: Joi.boolean().optional().default(false),
    special_requests: Joi.string().allow("").optional(),
    is_payment_given: Joi.bool().required(),
    payment: Joi.object({
      method: Joi.string().valid("MOBILE_BANKING", "BANK", "CASH").required(),
      acc_id: Joi.number().required(),
      amount: Joi.number().required(),
    }).optional(),

    source_id: Joi.number().required(),
  });

  public createGroupBookingValidator = Joi.object({
    is_individual_booking: Joi.bool().required(),
    reservation_type: Joi.string().valid("hold", "booked").required(),
    is_checked_in: Joi.bool().required(),
    check_in: Joi.date().iso().required(),
    check_out: Joi.date().iso().required(),
    pickup: Joi.boolean().required(),
    pickup_from: Joi.when("pickup", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),

    pickup_time: Joi.when("pickup", {
      is: true,
      then: Joi.string().isoDate().required(), // assuming ISO datetime string
      otherwise: Joi.forbidden(),
    }),

    drop: Joi.boolean().required(),
    drop_to: Joi.when("drop", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    drop_time: Joi.when("drop", {
      is: true,
      then: Joi.string().isoDate().required(),
      otherwise: Joi.forbidden(),
    }),

    service_charge: Joi.number().min(0).required(),
    vat: Joi.number().min(0).required(),
    service_charge_percentage: Joi.number().min(0).default(0),
    vat_percentage: Joi.number().min(0).default(0),
    lead_guest_info: Joi.object({
      first_name: Joi.string().optional(),
      last_name: Joi.string().allow("").optional(),
      email: Joi.string().allow("").optional(),
      phone: Joi.string().allow("").optional(),
      country_id: Joi.number().required(),
      address: Joi.string().allow("").optional(),
      type: Joi.string().allow("adult", "child", "infant").required(),
      passport_no: Joi.string().allow("").optional(),
    }),
    booked_room_types: Joi.array()
      .items(
        Joi.object({
          room_type_id: Joi.number().required(),
          rate_plan_id: Joi.number().required(),
          rooms: Joi.array()
            .items(
              Joi.object({
                check_in: Joi.date().iso().required(),
                check_out: Joi.date().iso().required(),
                room_id: Joi.number().required(),
                cbf: Joi.number().required().default(0),
                adults: Joi.number().min(1).required(),
                children: Joi.number().min(0).required(),
                infant: Joi.number().min(0).required(),
                rate: Joi.object({
                  base_rate: Joi.number().required(),
                  changed_rate: Joi.number().required(),
                }).required(),
                guest_info: Joi.array().items(
                  Joi.object({
                    first_name: Joi.string().optional(),
                    last_name: Joi.string().allow("").optional(),
                    email: Joi.string().allow("").optional(),
                    phone: Joi.string().allow("").optional(),
                    country_id: Joi.number().required(),
                    address: Joi.string().allow("").optional(),
                    type: Joi.string()
                      .allow("adult", "child", "infant")
                      .required(),
                    passport_no: Joi.string().allow("").optional(),
                    is_room_primary_guest: Joi.boolean().required(),
                  })
                ),
              })
            )
            .min(1)
            .required(),

          meal_plans_ids: Joi.array().items(Joi.number()).optional(),
        })
      )
      .min(1)
      .required(),

    company_name: Joi.string().allow("").optional(),
    visit_purpose: Joi.string().allow("").optional(),
    is_company_booked: Joi.boolean().optional().default(false),
    special_requests: Joi.string().allow("").optional(),
    is_payment_given: Joi.bool().required(),
    payment: Joi.object({
      method: Joi.string().valid("MOBILE_BANKING", "BANK", "CASH").required(),
      acc_id: Joi.number().required(),
      amount: Joi.number().required(),
    }).optional(),

    source_id: Joi.number().required(),
  });

  public getAllBookingByBookingModeValidator = Joi.object({
    current_date: Joi.string().required(),
    booking_mode: Joi.string().valid("arrival", "departure", "stay").required(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    search: Joi.string().allow("").optional(),
  });

  public updateRoomAndRateOfReservation = Joi.object({
    changed_rate_of_booking_rooms: Joi.array()
      .items(
        Joi.object({
          room_id: Joi.number().required(),
          unit_base_rate: Joi.number().required(),
          unit_changed_rate: Joi.number().required(),
        })
      )
      .optional(),

    add_room_types: Joi.array()
      .items(
        Joi.object({
          room_type_id: Joi.number().required(),
          rate_plan_id: Joi.number().required(),
          rooms: Joi.array()
            .items(
              Joi.object({
                check_in: Joi.date().iso().required(),
                check_out: Joi.date().iso().required(),
                room_id: Joi.number().required(),
                cbf: Joi.number().required().default(0),
                adults: Joi.number().min(1).required(),
                children: Joi.number().min(0).required(),
                infant: Joi.number().min(0).required(),
                rate: Joi.object({
                  base_rate: Joi.number().required(),
                  changed_rate: Joi.number().required(),
                }).required(),

                guest_info: Joi.array().items(
                  Joi.object({
                    first_name: Joi.string().optional(),
                    last_name: Joi.string().allow("").optional(),
                    email: Joi.string().allow("").optional(),
                    phone: Joi.string().allow("").optional(),
                    country_id: Joi.number().required(),
                    address: Joi.string().allow("").optional(),
                    passport_no: Joi.string().allow("").optional(),
                    type: Joi.string()
                      .allow("adult", "child", "infant")
                      .required(),
                    is_room_primary_guest: Joi.boolean().required(),
                  })
                ),
              })
            )
            .min(1)
            .required(),

          meal_plans_ids: Joi.array().items(Joi.number()).optional(),
        })
      )
      .min(1)
      .optional(),

    removed_rooms: Joi.array().items(Joi.number().required()).optional(),
  });

  public updateSingleReservation = Joi.object({
    comments: Joi.string().allow("").optional(),
    source_id: Joi.number().required(),
    company_name: Joi.string().allow("").optional(),
    visit_purpose: Joi.string().allow("").optional(),
    drop: Joi.boolean().optional(),
    drop_time: Joi.when("drop", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    drop_to: Joi.when("drop", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    pickup: Joi.boolean().optional(),
    pickup_time: Joi.when("pickup", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    pickup_from: Joi.when("pickup", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
  });

  public addPayment = Joi.object({
    folio_id: Joi.number().required(),
    amount: Joi.number().required(),
    acc_id: Joi.number().required(),
    payment_date: Joi.string().required(),
    remarks: Joi.string().allow("").optional(),
  });

  public adjustBalance = Joi.object({
    folio_id: Joi.number().required(),
    amount: Joi.number().required(),
    remarks: Joi.string().allow("").optional(),
  });

  public addItemByFolioID = Joi.object({
    folio_id: Joi.number().required(),
    amount: Joi.number().required(),
    remarks: Joi.string().allow("").optional(),
  });

  public refundPayment = Joi.object({
    folio_id: Joi.number().required(),
    amount: Joi.number().required(),
    acc_id: Joi.number().required(),
    payment_date: Joi.string().required(),
    remarks: Joi.string().allow("").optional(),
  });

  public changeDatesOfBooking = Joi.object({
    check_in: Joi.string().required(),
    check_out: Joi.string().required(),
  });

  public changeRoomOfAReservation = Joi.object({
    previous_room_id: Joi.number().required(),
    new_room_id: Joi.number().required(),
    base_rate: Joi.number().required(),
    changed_rate: Joi.number().required(),
  });

  public updateOthersOfARoomByBookingID = Joi.object({
    adults: Joi.number().optional(),
    children: Joi.number().optional(),
    cbf: Joi.number().optional(),
  });

  public changeDatesOfBookingRoom = Joi.object({
    check_in: Joi.string().required(),
    check_out: Joi.string().required(),
    room_id: Joi.number().required(),
  });

  public updateReservationHoldStatusValidator = Joi.object({
    status: Joi.string().allow("confirmed", "canceled").required(),
  });

  public updateOrRemoveGuestFromRoom = Joi.object({
    remove_guest: Joi.number().optional(),
    add_guest: Joi.array()
      .items(
        Joi.object({
          first_name: Joi.string().optional(),
          last_name: Joi.string().allow("").optional(),
          email: Joi.string().allow("").optional(),
          phone: Joi.string().allow("").optional(),
          country_id: Joi.number().required(),
          address: Joi.string().allow("").optional(),
          passport_no: Joi.string().allow("").optional(),
          type: Joi.string().allow("adult", "child", "infant").required(),
          is_room_primary_guest: Joi.boolean().required(),
        })
      )
      .optional(),
  });
}
