import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IinsertFolioEntriesPayload } from "../utlis/interfaces/invoice.interface";
import {
	addPaymentReqBody,
	BookingRequestBody,
	IGBookingRequestBody,
	IguestReqBody,
} from "../utlis/interfaces/reservation.interface";
import { SubReservationService } from "./subreservation.service";

export class ReservationService extends AbstractServices {
	constructor() {
		super();
	}

	public async calendar(req: Request) {
		const { hotel_code } = req.hotel_admin;

		const { check_in, check_out } = req.query;

		const getAllAvailableRoomsWithType =
			await this.Model.reservationModel().calendar({
				hotel_code,
				check_in: check_in as string,
				check_out: check_out as string,
			});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data: getAllAvailableRoomsWithType,
		};
	}

	public async getAllAvailableRoomsTypeWithAvailableRoomCount(req: Request) {
		const { hotel_code } = req.hotel_admin;

		const { check_in, check_out } = req.query;

		const getAllAvailableRoomsWithType =
			await this.Model.reservationModel().getAllAvailableRoomsTypeWithAvailableRoomCount(
				{
					hotel_code,
					check_in: check_in as string,
					check_out: check_out as string,
				}
			);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data: getAllAvailableRoomsWithType,
		};
	}

	public async getAllAvailableRoomsTypeForEachDateAvailableRoom(
		req: Request
	) {
		const { hotel_code } = req.hotel_admin;

		const { check_in, check_out } = req.query;

		const getAllAvailableRoomsWithType =
			await this.Model.reservationModel().getAllAvailableRoomsTypeForEachAvailableRoom(
				{
					hotel_code,
					check_in: check_in as string,
					check_out: check_out as string,
				}
			);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data: getAllAvailableRoomsWithType,
		};
	}

	public async getAllAvailableRoomsByRoomType(req: Request) {
		const { hotel_code } = req.hotel_admin;

		const { check_in, check_out } = req.query;

		const getAllAvailableRoomsByRoomType =
			await this.Model.reservationModel().getAllAvailableRoomsByRoomType({
				hotel_code,
				check_in: check_in as string,
				check_out: check_out as string,
				room_type_id: parseInt(req.params.id),
			});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data: getAllAvailableRoomsByRoomType,
		};
	}

	public async createBooking(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const body = req.body as BookingRequestBody;

			const sub = new SubReservationService(trx);

			const total_nights = sub.calculateNights(
				body.check_in,
				body.check_out
			);
			if (total_nights <= 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message: "Check-in date must be before check-out date",
				};
			}

			// check room type available or not
			body.rooms.forEach(async (room) => {
				const getAllAvailableRoomsWithType =
					await this.Model.reservationModel(
						trx
					).getAllAvailableRoomsTypeWithAvailableRoomCount({
						hotel_code,
						check_in: body.check_in,
						check_out: body.check_out,
						room_type_id: room.room_type_id,
					});

				if (
					room.guests.length >
					getAllAvailableRoomsWithType[0].available_rooms
				) {
					return {
						success: false,
						code: this.StatusCode.HTTP_NOT_FOUND,
						message: "Room Assigned is more than available rooms",
					};
				}
			});

			// Guest
			const guest_id = await sub.findOrCreateGuest(
				body.guest,
				hotel_code
			);

			// Totals
			const { total_amount } = sub.calculateTotals(
				body.rooms,
				total_nights,
				{
					vat: body.vat,
					service_charge: body.service_charge,
				}
			);

			// Booking
			const booking = await sub.createMainBooking({
				payload: {
					is_individual_booking: body.is_individual_booking,
					check_in: body.check_in,
					check_out: body.check_out,
					created_by: req.hotel_admin.id,
					discount_amount: body.discount_amount,
					drop: body.drop,
					booking_type: body.reservation_type == "booked" ? "B" : "H",
					drop_time: body.drop_time,
					pickup_from: body.pickup_from,
					pickup: body.pickup,
					source_id: body.source_id,
					drop_to: body.drop_to,
					special_requests: body.special_requests,
					vat: body.vat,
					pickup_time: body.pickup_time,
					service_charge: body.service_charge,
					is_company_booked: body.is_company_booked,
					company_name: body.company_name,
					visit_purpose: body.visit_purpose,
				},
				hotel_code,
				guest_id,
				// sub_total,
				total_amount,
				is_checked_in: body.is_checked_in,
				total_nights,
			});

			// Rooms
			await sub.insertBookingRooms(body.rooms, booking.id, total_nights);

			// Availability
			await sub.updateAvailabilityWhenRoomBooking(
				body.reservation_type,
				body.rooms,
				body.check_in,
				body.check_out,
				hotel_code
			);

			await sub.createRoomBookingFolioWithEntries({
				body,
				guest_id,
				booking_id: booking.id,
				req,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Booking created successfully",
			};
		});
	}

	public async createGroupBooking(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const body = req.body as IGBookingRequestBody;

			const {
				check_in,
				check_out,
				booked_room_types,
				vat,
				service_charge,
				is_individual_booking,
				reservation_type,
				discount_amount,
				pickup,
				drop,
				drop_time,
				pickup_time,
				pickup_from,
				drop_to,
				source_id,
				special_requests,
				is_company_booked,
				company_name,
				visit_purpose,
				is_checked_in,
			} = body;

			const sub = new SubReservationService(trx);

			// Calculate total nights
			const total_nights = sub.calculateNights(check_in, check_out);
			if (total_nights <= 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message: "Check-in date must be before check-out date",
				};
			}

			// Validate room availability
			for (const rt of booked_room_types) {
				const availableRooms = await this.Model.reservationModel(
					trx
				).getAllAvailableRoomsTypeWithAvailableRoomCount({
					hotel_code,
					check_in,
					check_out,
					room_type_id: rt.room_type_id,
				});

				if (
					rt.rooms.length > (availableRooms[0]?.available_rooms || 0)
				) {
					return {
						success: false,
						code: this.StatusCode.HTTP_NOT_FOUND,
						message: "Room Assigned is more than available rooms",
					};
				}
			}

			// Find lead guest
			let leadGuest: IguestReqBody | null = null;

			outer: for (const rt of booked_room_types) {
				for (const room of rt.rooms) {
					for (const guest of room.guest_info) {
						if (guest.is_lead_guest) {
							leadGuest = guest;
							break outer;
						}
					}
				}
			}

			if (!leadGuest) {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message: "Lead guest information is required",
				};
			}

			// Insert or get lead guest
			const guest_id = await sub.findOrCreateGuest(leadGuest, hotel_code);

			// Calculate total
			const { total_amount } = sub.calculateTotalsForGroupBooking(
				booked_room_types,
				total_nights,
				{ vat, service_charge }
			);

			// Create main booking
			const booking = await sub.createMainBooking({
				payload: {
					is_individual_booking,
					check_in,
					check_out,
					created_by: req.hotel_admin.id,
					discount_amount,
					drop,
					booking_type: reservation_type === "booked" ? "B" : "H",
					drop_time,
					pickup_from,
					pickup,
					source_id,
					drop_to,
					special_requests,
					vat,
					pickup_time,
					service_charge,
					is_company_booked,
					company_name,
					visit_purpose,
				},
				hotel_code,
				guest_id,
				total_amount,
				is_checked_in,
				total_nights,
			});

			// Insert booking rooms
			await sub.insertBookingRoomsForGroupBooking(
				booked_room_types,
				booking.id,
				total_nights,
				hotel_code
			);

			// Update availability
			await sub.updateAvailabilityWhenGroupRoomBooking(
				reservation_type,
				booked_room_types,
				check_in,
				check_out,
				hotel_code
			);

			// Create folio and ledger entries
			await sub.createGroupRoomBookingFolioWithEntries({
				body,
				guest_id,
				booking_id: booking.id,
				req,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Booking created successfully",
				data: {
					booking_id: booking.id,
					total_amount,
				},
			};
		});
	}

	public async getAllBooking(req: Request) {
		const {
			search,
			booked_from,
			booked_to,
			booking_type,
			checkin_from,
			checkin_to,
			checkout_from,
			checkout_to,
			limit,
			skip,
			status,
		} = req.query;

		const { data, total } =
			await this.Model.reservationModel().getAllBooking({
				hotel_code: req.hotel_admin.hotel_code,
				search: search as string,
				booked_from: booked_from as string,
				booked_to: booked_to as string,
				booking_type: booking_type as string,
				checkin_from: checkin_from as string,
				checkin_to: checkin_to as string,
				checkout_from: checkout_from as string,
				checkout_to: checkout_to as string,
				limit: limit as string,
				skip: skip as string,
				status: status as string,
			});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	public async getArrivalDepStayBookings(req: Request) {
		const { data, total } =
			await this.Model.reservationModel().getArrivalDepStayBookings({
				hotel_code: req.hotel_admin.hotel_code,
				booking_mode: req.query.booking_mode as any,
				limit: req.query.limit as string,
				skip: req.query.skip as string,
				search: req.query.search as string,
				current_date: req.query.current_date as string,
			});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	public async getSingleBooking(req: Request) {
		const data = await this.Model.reservationModel().getSingleBooking(
			req.hotel_admin.hotel_code,
			parseInt(req.params.id)
		);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async updateSingleBooking(req: Request) {
		const {} = req.body as IGBookingRequestBody;
		const checkSingleBooking =
			await this.Model.reservationModel().getSingleBooking(
				req.hotel_admin.hotel_code,
				parseInt(req.params.id)
			);

		if (!checkSingleBooking) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: this.ResMsg.HTTP_NOT_FOUND,
			};
		}
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			// data,
		};
	}

	//   public async updateGroupBooking(req: Request) {
	//     return await this.db.transaction(async (trx) => {
	//       const { hotel_code } = req.hotel_admin;
	//       const booking_id = parseInt(req.params.booking_id);
	//       const body = req.body as IGBookingRequestBody;

	//       const checkSingleBooking =
	//         await this.Model.reservationModel().getSingleBooking(
	//           req.hotel_admin.hotel_code,
	//           parseInt(req.params.id)
	//         );

	//       if (!checkSingleBooking) {
	//         return {
	//           success: false,
	//           code: this.StatusCode.HTTP_NOT_FOUND,
	//           message: this.ResMsg.HTTP_NOT_FOUND,
	//         };
	//       }

	//       const {
	//         check_in,
	//         check_out,
	//         booked_room_types,
	//         vat,
	//         service_charge,
	//         is_individual_booking,
	//         reservation_type,
	//         discount_amount,
	//         pickup,
	//         drop,
	//         drop_time,
	//         pickup_time,
	//         pickup_from,
	//         drop_to,
	//         source_id,
	//         special_requests,
	//         is_company_booked,
	//         company_name,
	//         visit_purpose,
	//         is_checked_in,
	//       } = body;

	//       const sub = new SubReservationService(trx);

	//       // 1. Calculate nights
	//       const total_nights = sub.calculateNights(check_in, check_out);
	//       if (total_nights <= 0) {
	//         return {
	//           success: false,
	//           code: this.StatusCode.HTTP_BAD_REQUEST,
	//           message: "Check-in date must be before check-out date",
	//         };
	//       }

	//       // 2. Validate room availability
	//       for (const rt of booked_room_types) {
	//         const availableRooms = await this.Model.reservationModel(
	//           trx
	//         ).getAllAvailableRoomsTypeWithAvailableRoomCount({
	//           hotel_code,
	//           check_in,
	//           check_out,
	//           room_type_id: rt.room_type_id,
	//           exclude_booking_id: booking_id, // Exclude current booking from availability check
	//         });

	//         if (rt.rooms.length > (availableRooms[0]?.available_rooms || 0)) {
	//           return {
	//             success: false,
	//             code: this.StatusCode.HTTP_NOT_FOUND,
	//             message: "Room Assigned is more than available rooms",
	//           };
	//         }
	//       }

	//       // 3. Get lead guest
	//       let leadGuest: IguestReqBody | null = null;
	//       outer: for (const rt of booked_room_types) {
	//         for (const room of rt.rooms) {
	//           for (const guest of room.guest_info) {
	//             if (guest.is_lead_guest) {
	//               leadGuest = guest;
	//               break outer;
	//             }
	//           }
	//         }
	//       }

	//       if (!leadGuest) {
	//         return {
	//           success: false,
	//           code: this.StatusCode.HTTP_BAD_REQUEST,
	//           message: "Lead guest information is required",
	//         };
	//       }

	//       // 4. Insert or get lead guest
	//       const guest_id = await sub.findOrCreateGuest(leadGuest, hotel_code);

	//       // 5. Calculate total
	//       const { total_amount } = sub.calculateTotalsForGroupBooking(
	//         booked_room_types,
	//         total_nights,
	//         { vat, service_charge }
	//       );

	//       // 6. Update main booking
	//       await sub.updateMainBooking({
	//         payload: {
	//           check_in,
	//           check_out,
	//           updated_by: req.hotel_admin.id,
	//           discount_amount,
	//           drop,
	//           drop_time,
	//           pickup,
	//           pickup_from,
	//           pickup_time,
	//           drop_to,
	//           source_id,
	//           special_requests,
	//           vat,
	//           service_charge,
	//           is_individual_booking,
	//           is_company_booked,
	//           company_name,
	//           visit_purpose,
	//         },
	//         booking_id,
	//         hotel_code,
	//         guest_id,
	//         total_amount,
	//         is_checked_in,
	//         total_nights,
	//       });

	//       // 7. Delete previous booking_rooms, room_guests, and folio entries
	//       await sub.deleteBookingRoomsAndGuests(booking_id);
	//       await sub.deleteFolioEntriesByBookingId(booking_id); // Optional: keep history if needed

	//       // 8. Insert updated booking_rooms and guests
	//       await sub.insertBookingRoomsForGroupBooking(
	//         booked_room_types,
	//         booking_id,
	//         total_nights,
	//         hotel_code
	//       );

	//       // 9. Update availability
	//       await sub.updateAvailabilityWhenGroupRoomBooking(
	//         reservation_type,
	//         booked_room_types,
	//         check_in,
	//         check_out,
	//         hotel_code
	//       );

	//       // 10. Recreate folio and ledger entries
	//       await sub.createGroupRoomBookingFolioWithEntries({
	//         body,
	//         guest_id,
	//         booking_id,
	//         req,
	//       });

	//       return {
	//         success: true,
	//         code: this.StatusCode.HTTP_SUCCESSFUL,
	//         message: "Booking updated successfully",
	//         data: {
	//           booking_id,
	//           total_amount,
	//         },
	//       };
	//     });
	//   }

	// public async updatePartialReservation(req: Request) {
	//   return await this.db.transaction(async (trx) => {
	//     const booking_id = parseInt(req.params.booking_id);
	//     const { hotel_code } = req.hotel_admin;
	//     const body = req.body as {
	//       check_in?: string;
	//       check_out?: string;
	//       visit_purpose?: string;
	//       pickup?: boolean;
	//       pickup_from?: string;
	//       pickup_time?: string;
	//       drop?: boolean;
	//       drop_time?: string;
	//       drop_to?: string;
	//       special_requests?: string;
	//       is_company_booked?: boolean;
	//       company_name?: string;
	//       source_id?: number;

	//       // Full room structure (optional if only guest info changes)
	//       booked_room_types?: any[];

	//       // Partial guest info updates inside rooms
	//       changed_booking_rooms?: Array<{
	//         id?: number;
	//         room_id?: number;
	//         guest_info?: Array<{
	//           guest_id?: number;
	//           first_name?: string;
	//           last_name?: string;
	//           email?: string;
	//           phone?: string;
	//           address?: string;
	//           country_id?: number;
	//         }>;
	//       }>;
	//     };

	//     const sub = new SubReservationService(trx);

	//     const model = this.Model.reservationModel(trx);
	//     const guestModel = this.Model.guestModel(trx);
	//     // 1. Fetch original booking
	//     const booking =
	//       await model.getSingleBooking(
	//         req.hotel_admin.hotel_code,
	//         parseInt(req.params.id)
	//       );

	//     if (!booking) {
	//       return {
	//         success: false,
	//         code: this.StatusCode.HTTP_NOT_FOUND,
	//         message: this.ResMsg.HTTP_NOT_FOUND,
	//       };
	//     }

	//     // 2. Update booking core fields if any
	//     const updated_fields: any = {};
	//     if (body.check_in) updated_fields.check_in = body.check_in;
	//     if (body.check_out) updated_fields.check_out = body.check_out;
	//     if (body.visit_purpose !== undefined)
	//       updated_fields.visit_purpose = body.visit_purpose;
	//     if (body.special_requests !== undefined)
	//       updated_fields.special_requests = body.special_requests;
	//     if (body.pickup !== undefined) updated_fields.pickup = body.pickup;
	//     if (body.pickup_from) updated_fields.pickup_from = body.pickup_from;
	//     if (body.pickup_time) updated_fields.pickup_time = body.pickup_time;
	//     if (body.drop !== undefined) updated_fields.drop = body.drop;
	//     if (body.drop_to) updated_fields.drop_to = body.drop_to;
	//     if (body.drop_time) updated_fields.drop_time = body.drop_time;
	//     if (body.is_company_booked !== undefined)
	//       updated_fields.is_company_booked = body.is_company_booked;
	//     if (body.company_name !== undefined)
	//       updated_fields.company_name = body.company_name;
	//     if (body.source_id !== undefined)
	//       updated_fields.source_id = body.source_id;

	//     if (Object.keys(updated_fields).length > 0) {
	//       updated_fields.updated_at = trx.fn.now();
	//       updated_fields.updated_by = req.hotel_admin.id;
	//       // await trx("bookings")
	//       //   .withSchema(this.RESERVATION_SCHEMA)
	//       //   .where({ id: booking_id })
	//       //   .update(updated_fields);
	//       await model.updateRoomBooking(updated_fields,hotel_code,booking_id);
	//     }

	//     // 3. Update guest info if provided in changed_booking_rooms
	//     if (body.changed_booking_rooms && body.changed_booking_rooms.length > 0) {
	//       for (const room of body.changed_booking_rooms) {
	//         if (room.guest_info && room.guest_info.length > 0) {
	//           for (const guest of room.guest_info) {
	//             if (guest.guest_id) {
	//               // await trx("guests")
	//               //   .withSchema(this.RESERVATION_SCHEMA)
	//               //   .where("id", guest.guest_id)
	//               //   .update({
	//               //     first_name: guest.first_name,
	//               //     last_name: guest.last_name,
	//               //     email: guest.email,
	//               //     phone: guest.phone,
	//               //     address: guest.address,
	//               //     country: guest.country,
	//               //     nationality: guest.nationality,
	//               //     updated_at: trx.fn.now(),
	//               //     updated_by: req.hotel_admin.id,
	//               //   });

	//               // update guests
	//               await guestModel.updateSingleGuest(
	//                 {
	//                   id: guest.guest_id,
	//                   hotel_code,
	//                 },
	//                 {
	//                   first_name: guest.first_name,
	//                   last_name: guest.last_name,
	//                   email: guest.email,
	//                   phone: guest.phone,
	//                   address: guest.address,
	//                   country_id: guest.country_id,
	//                 }
	//               );

	//             } else {

	//               // Insert new guest if no guest_id present (optional)
	//               // You can add insert logic here if needed
	//             }
	//           }
	//         }
	//       }
	//     }

	//     // 4. If full booked_room_types payload present, compare and update rooms if changed
	//     if (body.booked_room_types && body.booked_room_types.length > 0) {
	//       const final_check_in = body.check_in || booking.check_in;
	//       const final_check_out = body.check_out || booking.check_out;
	//       const total_nights = sub.calculateNights(
	//         final_check_in,
	//         final_check_out
	//       );

	//       // Fetch current rooms + guests
	//       const currentRooms = await sub.getBookingRoomsWithGuests(booking_id);

	//       const isRoomStructureChanged = sub.hasRoomStructureChanged(
	//         currentRooms,
	//         body.booked_room_types,
	//         total_nights
	//       );

	//       if (isRoomStructureChanged) {
	//         // Delete old booking rooms and guests
	//         await sub.deleteBookingRoomsAndGuests(booking_id);

	//         // Validate availability and insert new rooms & guests
	//         for (const rt of body.booked_room_types) {
	//           const availability = await this.Model.reservationModel(
	//             trx
	//           ).getAllAvailableRoomsTypeWithAvailableRoomCount({
	//             hotel_code,
	//             check_in: final_check_in,
	//             check_out: final_check_out,
	//             room_type_id: rt.room_type_id,
	//             exclude_booking_id: booking_id,
	//           });

	//           const available_count = availability[0]?.available_rooms || 0;
	//           if (rt.rooms.length > available_count) {
	//             throw new Error(
	//               `Room type ${rt.room_type_id} does not have enough availability.`
	//             );
	//           }

	//           for (const room of rt.rooms) {
	//             const guest_ids = await sub.insertGuests(
	//               room.guest_info,
	//               hotel_code
	//             );

	//             await sub.insertBookingRoom({
	//               booking_id,
	//               room_type_id: rt.room_type_id,
	//               room_id: room.room_id,
	//               adults: room.adults,
	//               children: room.children,
	//               infant: room.infant,
	//               base_rate: room.rate.base_rate,
	//               changed_rate: room.rate.changed_rate,
	//               unit_base_rate: room.rate.base_rate * total_nights,
	//               unit_changed_rate: room.rate.changed_rate * total_nights,
	//               guest_ids,
	//             });
	//           }
	//         }

	//         // Update availability after changes
	//         await sub.updateAvailabilityWhenGroupRoomBooking(
	//           booking.booking_type === "B" ? "booked" : "hold",
	//           body.booked_room_types,
	//           final_check_in,
	//           final_check_out,
	//           hotel_code
	//         );

	//         // Handle folio adjustments (void & reinsert if payment exists)
	//         await sub.handleFolioAdjustmentForUpdate(booking_id, req);
	//       }
	//     }

	//     return {
	//       success: true,
	//       message: "Reservation updated successfully",
	//     };
	//   });
	// }

	// public async updatePartialReservation(req: Request) {
	//   return await this.db.transaction(async (trx) => {
	//     const booking_id = parseInt(req.params.booking_id);
	//     const { hotel_code } = req.hotel_admin;
	//     const body = req.body;

	//     const model = this.Model.reservationModel(trx);
	//     const guestModel = this.Model.guestModel(trx);
	//     const sub = new SubReservationService(trx);

	//     // 1. Get booking
	//     const booking = await model.getSingleBooking(hotel_code, booking_id);
	//     if (!booking) {
	//       return {
	//         success: false,
	//         code: this.StatusCode.HTTP_NOT_FOUND,
	//         message: this.ResMsg.HTTP_NOT_FOUND,
	//       };
	//     }

	//     // 2. Update booking metadata
	//     const updatedFields: any = {};
	//     const fieldMap = [
	//       "check_in",
	//       "check_out",
	//       "visit_purpose",
	//       "pickup",
	//       "pickup_from",
	//       "pickup_time",
	//       "drop",
	//       "drop_time",
	//       "drop_to",
	//       "special_requests",
	//       "is_company_booked",
	//       "company_name",
	//       "source_id",
	//     ];
	//     for (const key of fieldMap) {
	//       if (body[key] !== undefined) updatedFields[key] = body[key];
	//     }

	//     if (Object.keys(updatedFields).length > 0) {
	//       updatedFields.updated_at = trx.fn.now();
	//       updatedFields.updated_by = req.hotel_admin.id;
	//       await model.updateRoomBooking(updatedFields, hotel_code, booking_id);
	//     }

	//     // 3. Update room guest info (no room change)
	//     if (Array.isArray(body.changed_booking_rooms)) {
	//       for (const room of body.changed_booking_rooms) {
	//         if (Array.isArray(room.guest_info)) {
	//           for (const guest of room.guest_info) {
	//             if (guest.guest_id) {
	//               await guestModel.updateSingleGuest(
	//                 { id: guest.guest_id, hotel_code },
	//                 {
	//                   first_name: guest.first_name,
	//                   last_name: guest.last_name,
	//                   email: guest.email,
	//                   phone: guest.phone,
	//                   address: guest.address,
	//                   country_id: guest.country_id,
	//                 }
	//               );
	//             }
	//           }
	//         }
	//       }
	//     }

	//     // 4. Handle removed rooms (optional)
	//     if (Array.isArray(body.removed_rooms) && body.removed_rooms.length > 0) {
	//       await sub.removeBookingRoomsByRoomIds(booking_id, body.removed_rooms);
	//     }

	//     // 5. Handle add_room_types (optional)
	//     const total_nights = sub.calculateNights(
	//       body.check_in || booking.check_in,
	//       body.check_out || booking.check_out
	//     );

	//     if (Array.isArray(body.add_room_types)) {
	//       for (const rt of body.add_room_types) {
	//         const available =
	//           await model.getAllAvailableRoomsTypeWithAvailableRoomCount({
	//             hotel_code,
	//             check_in: body.check_in || booking.check_in,
	//             check_out: body.check_out || booking.check_out,
	//             room_type_id: rt.room_type_id,
	//             exclude_booking_id: booking_id,
	//           });

	//         const available_count = available[0]?.available_rooms || 0;
	//         if (rt.rooms.length > available_count) {
	//           throw new Error(
	//             `Not enough availability for room type ${rt.room_type_id}`
	//           );
	//         }

	//         for (const room of rt.rooms) {
	//           const guest_ids = await sub.insertGuests(
	//             room.guest_info,
	//             hotel_code
	//           );

	//           await sub.insertBookingRoom({
	//             booking_id,
	//             room_type_id: rt.room_type_id,
	//             room_id: room.room_id,
	//             adults: room.adults,
	//             children: room.children,
	//             infant: room.infant,
	//             base_rate: room.rate.base_rate,
	//             changed_rate: room.rate.changed_rate,
	//             unit_base_rate: room.rate.base_rate * total_nights,
	//             unit_changed_rate: room.rate.changed_rate * total_nights,
	//             guest_ids,
	//           });
	//         }
	//       }

	//       // Update availability
	//       await sub.updateAvailabilityWhenGroupRoomBooking(
	//         booking.booking_type === "B" ? "booked" : "hold",
	//         body.add_room_types,
	//         body.check_in || booking.check_in,
	//         body.check_out || booking.check_out,
	//         hotel_code
	//       );
	//     }

	//     // 6. Recalculate folio (if any room added/removed/updated)
	//     if (
	//       (Array.isArray(body.add_room_types) &&
	//         body.add_room_types.length > 0) ||
	//       (Array.isArray(body.removed_rooms) && body.removed_rooms.length > 0)
	//     ) {
	//       // 6.1. Void old folio entries (preserve folio, avoid deletion)
	//       await sub.voidFolioEntriesForBooking(booking_id);

	//       // 6.2. Insert new folio entries for updated rooms
	//       const updatedRoomList = await sub.getBookingRoomsWithGuests(booking_id);
	//       await sub.recreateFolioEntries({
	//         booking_id,
	//         guest_id: booking.guest_id,
	//         hotel_code,
	//         rooms: updatedRoomList,
	//         req,
	//         total_nights,
	//       });
	//     }

	//     return {
	//       success: true,
	//       message: "Reservation updated successfully",
	//     };
	//   });
	// }

	//   public async updatePartialReservation(req: Request) {
	//     return await this.db.transaction(async (trx) => {
	//       const booking_id = parseInt(req.params.booking_id);
	//       const { hotel_code } = req.hotel_admin;
	//       const body = req.body;

	//       const model = this.Model.reservationModel(trx);
	//       const guestModel = this.Model.guestModel(trx);
	//       const sub = new SubReservationService(trx);

	//       const booking = await model.getSingleBooking(hotel_code, booking_id);
	//       if (!booking) {
	//         return {
	//           success: false,
	//           code: this.StatusCode.HTTP_NOT_FOUND,
	//           message: this.ResMsg.HTTP_NOT_FOUND,
	//         };
	//       }

	//       const updatedFields: any = {};
	//       const keys = [
	//         "check_in",
	//         "check_out",
	//         "visit_purpose",
	//         "pickup",
	//         "pickup_from",
	//         "pickup_time",
	//         "drop",
	//         "drop_time",
	//         "drop_to",
	//         "special_requests",
	//         "is_company_booked",
	//         "company_name",
	//         "source_id",
	//       ];

	//       for (const key of keys) {
	//         if (body[key] !== undefined) updatedFields[key] = body[key];
	//       }

	//       if (Object.keys(updatedFields).length > 0) {
	//         updatedFields.updated_at = trx.fn.now();
	//         updatedFields.updated_by = req.hotel_admin.id;
	//         await model.updateRoomBooking(updatedFields, hotel_code, booking_id);
	//       }

	//       // Update guest info
	//       if (Array.isArray(body.changed_booking_rooms)) {
	//         for (const room of body.changed_booking_rooms) {
	//           if (Array.isArray(room.guest_info)) {
	//             for (const guest of room.guest_info) {
	//               if (guest.guest_id) {
	//                 await guestModel.updateSingleGuest(
	//                   { id: guest.guest_id, hotel_code },
	//                   {
	//                     first_name: guest.first_name,
	//                     last_name: guest.last_name,
	//                     email: guest.email,
	//                     phone: guest.phone,
	//                     address: guest.address,
	//                     country_id: guest.country_id,
	//                   }
	//                 );
	//               }
	//             }
	//           }
	//         }
	//       }

	//       const final_check_in = body.check_in || booking.check_in;
	//       const final_check_out = body.check_out || booking.check_out;
	//       const total_nights = sub.calculateNights(final_check_in, final_check_out);

	//       // Handle removed rooms
	//       if (Array.isArray(body.removed_rooms) && body.removed_rooms.length > 0) {
	//         await sub.removeBookingRoomsByRoomIds(booking_id, body.removed_rooms);
	//       }

	//       // Handle changed booking rooms (rate/occupancy)
	//       if (Array.isArray(body.changed_booking_rooms)) {
	//         for (const room of body.changed_booking_rooms) {
	//           if (!room.id) continue;

	//           const updateData: any = {};
	//           if (room.adults !== undefined) updateData.adults = room.adults;
	//           if (room.children !== undefined) updateData.children = room.children;
	//           if (room.infant !== undefined) updateData.infant = room.infant;
	//           if (room.base_rate !== undefined)
	//             updateData.base_rate = room.base_rate;
	//           if (room.changed_rate !== undefined)
	//             updateData.changed_rate = room.changed_rate;

	//           if (room.base_rate !== undefined && total_nights > 0)
	//             updateData.unit_base_rate = room.base_rate * total_nights;

	//           if (room.changed_rate !== undefined && total_nights > 0)
	//             updateData.unit_changed_rate = room.changed_rate * total_nights;

	//           if (Object.keys(updateData).length > 0) {
	//             updateData.updated_at = trx.fn.now();
	//             updateData.updated_by = req.hotel_admin.id;

	//             await trx("booking_rooms")
	//               .withSchema(this.RESERVATION_SCHEMA)
	//               .where("id", room.id)
	//               .andWhere("booking_id", booking_id)
	//               .update(updateData);
	//           }
	//         }
	//       }

	//       // Handle add_room_types
	//       if (Array.isArray(body.add_room_types)) {
	//         for (const rt of body.add_room_types) {
	//           const availability =
	//             await model.getAllAvailableRoomsTypeWithAvailableRoomCount({
	//               hotel_code,
	//               check_in: final_check_in,
	//               check_out: final_check_out,
	//               room_type_id: rt.room_type_id,
	//               exclude_booking_id: booking_id,
	//             });

	//           const available = availability[0]?.available_rooms || 0;
	//           if (rt.rooms.length > available) {
	//             throw new Error(
	//               `Room type ${rt.room_type_id} has insufficient availability.`
	//             );
	//           }

	//           for (const room of rt.rooms) {
	//             const guest_ids = await sub.insertGuests(
	//               room.guest_info,
	//               hotel_code
	//             );

	//             await sub.insertBookingRoom({
	//               booking_id,
	//               room_type_id: rt.room_type_id,
	//               room_id: room.room_id,
	//               adults: room.adults,
	//               children: room.children,
	//               infant: room.infant,
	//               base_rate: room.rate.base_rate,
	//               changed_rate: room.rate.changed_rate,
	//               unit_base_rate: room.rate.base_rate * total_nights,
	//               unit_changed_rate: room.rate.changed_rate * total_nights,
	//               guest_ids,
	//             });
	//           }
	//         }

	//         await sub.updateAvailabilityWhenGroupRoomBooking(
	//           booking.booking_type === "B" ? "booked" : "hold",
	//           body.add_room_types,
	//           final_check_in,
	//           final_check_out,
	//           hotel_code
	//         );
	//       }

	//       // Check if folio needs update
	//       const shouldUpdateFolio =
	//         (Array.isArray(body.add_room_types) &&
	//           body.add_room_types.length > 0) ||
	//         (Array.isArray(body.removed_rooms) && body.removed_rooms.length > 0) ||
	//         (Array.isArray(body.changed_booking_rooms) &&
	//           body.changed_booking_rooms.some(
	//             (room) =>
	//               room.changed_rate !== undefined ||
	//               room.base_rate !== undefined ||
	//               room.adults !== undefined ||
	//               room.children !== undefined ||
	//               room.infant !== undefined
	//           ));

	//       if (shouldUpdateFolio) {
	//         await sub.voidFolioEntriesForBooking(booking_id);

	//         const updatedRooms = await sub.getBookingRoomsWithGuests(booking_id);

	//         await sub.recreateFolioEntries({
	//           booking_id,
	//           guest_id: booking.guest_id,
	//           hotel_code,
	//           rooms: updatedRooms,
	//           req,
	//           total_nights,
	//         });
	//       }

	//       return {
	//         success: true,
	//         message: "Reservation updated successfully",
	//       };
	//     });
	//   }

	public async changeDatesOfBooking(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const { check_in, check_out } = req.body;
			const booking_id = parseInt(req.params.id);

			const reservationModel = this.Model.reservationModel(trx);
			const invoiceModel = this.Model.hotelInvoiceModel(trx);

			const booking = await reservationModel.getSingleBooking(
				hotel_code,
				booking_id
			);
			if (!booking) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			const {
				booking_rooms,
				check_in: prev_checkin,
				check_out: prev_checkout,
				vat,
				discount_amount,
				service_charge,
			} = booking;

			// Prevent changing to the same dates
			if (prev_checkin === check_in && prev_checkout === check_out) {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message: "You have requested previous date",
				};
			}

			// Check availability grouped by room type
			const roomTypeMap = new Map<number, number>();
			for (const room of booking_rooms) {
				roomTypeMap.set(
					room.room_type_id,
					(roomTypeMap.get(room.room_type_id) || 0) + 1
				);
			}

			for (const [room_type_id, total_rooms] of roomTypeMap.entries()) {
				const available =
					await this.Model.reservationModel().getAllAvailableRoomsTypeWithAvailableRoomCount(
						{
							hotel_code,
							check_in,
							check_out,
							room_type_id,
						}
					);

				if (
					available.length &&
					total_rooms > available[0].available_rooms
				) {
					return {
						success: false,
						code: this.StatusCode.HTTP_NOT_FOUND,
						message: "Room Assigned is more than available rooms",
					};
				}
			}

			// Recalculate totals
			const sub = new SubReservationService(trx);
			const total_nights = sub.calculateNights(check_in, check_out);

			const { total_amount } = sub.calculateTotalsByBookingRooms(
				booking_rooms,
				total_nights
			);

			console.log({ total_amount, booking_id, hotel_code });

			// Update booking totals
			await reservationModel.updateRoomBooking(
				{ total_amount, total_nights, check_out, check_in },
				hotel_code,
				booking_id
			);

			// Update booking rooms
			const roomIDs = booking_rooms.map((room) => room.room_id);
			await reservationModel.deleteBookingRooms(roomIDs);
			await sub.insertInBookingRoomsBySingleBookingRooms(
				booking_rooms,
				booking_id,
				total_nights
			);

			// Update room availability
			await sub.updateRoomAvailabilityService(
				"booked_room_decrease",
				booking_rooms,
				prev_checkin,
				prev_checkout,
				hotel_code
			);

			await sub.updateRoomAvailabilityService(
				"booked_room_increase",
				booking_rooms,
				check_in,
				check_out,
				hotel_code
			);

			// Handle folio entries
			const folioEntries =
				await invoiceModel.getFoliosEntriesbySingleBooking({
					booking_id,
					hotel_code,
					type: "primary",
				});

			if (!folioEntries.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "No folio entries found.",
				};
			}

			const folio_id = folioEntries[0].id;
			const entryIds = folioEntries.map((entry) => entry.entries_id);
			const hasPayment = folioEntries.some(
				(entry) => entry.posting_type.toLowerCase() === "payment"
			);

			// Mark all old entries as void
			await invoiceModel.updateFolioEntries({ is_void: true }, entryIds);

			if (hasPayment) {
				// Insert reversal entries
				const reversals: IinsertFolioEntriesPayload[] = folioEntries
					.filter(
						(entry) => entry.posting_type.toLowerCase() === "charge"
					)
					.map((entry) => ({
						debit: -entry.debit,
						credit: 0,
						folio_id,
						posting_type: "Charge",
						description:
							"Reversed previous room charge due to date change",
					}));
				if (reversals.length) {
					await invoiceModel.insertInFolioEntries(reversals);
				}
			}

			// Insert new charge entry
			await invoiceModel.insertInFolioEntries({
				debit: total_amount,
				folio_id,
				posting_type: "Charge",
				description: "New room charge after date change",
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "The dates of the reservation have been modified",
			};
		});
	}

	public async checkIn(req: Request) {
		const hotel_code = req.hotel_admin.hotel_code;
		const booking_id = parseInt(req.params.id);
		const data = await this.Model.reservationModel().getSingleBooking(
			hotel_code,
			booking_id
		);

		if (!data) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: this.ResMsg.HTTP_NOT_FOUND,
			};
		}

		const { status } = data;

		if (status != "confirmed") {
			return {
				success: false,
				code: this.StatusCode.HTTP_BAD_REQUEST,
				message:
					"This booking has other status. So, you cannot checkin",
			};
		}

		// update
		await this.Model.reservationModel().updateRoomBooking(
			{
				status: "checked_in",
			},
			hotel_code,
			booking_id
		);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: "Successfully Cheked in",
		};
	}

	public async checkOut(req: Request) {
		return await this.db.transaction(async (trx) => {
			const hotel_code = req.hotel_admin.hotel_code;
			const booking_id = parseInt(req.params.id);

			const reservationModel = this.Model.reservationModel(trx);
			const sub = new SubReservationService(trx);

			const data = await reservationModel.getSingleBooking(
				hotel_code,
				booking_id
			);

			if (!data) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			const { status, booking_type, booking_rooms, check_in, check_out } =
				data;

			if (booking_type != "B" && status != "checked_in") {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message:
						"This booking has other status. So, you cannot checkout",
				};
			}

			// check  due balance exist or not
			const hotelInvoiceModel = this.Model.hotelInvoiceModel(trx);

			const checkDueAmount =
				await hotelInvoiceModel.getDueAmountByBookingID({
					booking_id,
					hotel_code,
				});

			// if (checkDueAmount > 0) {
			//   return {
			//     success: false,
			//     code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
			//     message: `This guest has ${checkDueAmount} due. So you cannot checkout`,
			//   };
			// }

			// room avaibility decrease
			await sub.updateRoomAvailabilityService(
				"booked_room_decrease",
				booking_rooms,
				check_in,
				check_out,
				hotel_code
			);

			// update
			await reservationModel.updateRoomBooking(
				{
					status: "checked_out",
				},
				hotel_code,
				booking_id
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Successfully Cheked out",
			};
		});
	}

	public async updateReservationHoldStatus(req: Request) {
		return await this.db.transaction(async (trx) => {
			const hotel_code = req.hotel_admin.hotel_code;
			const booking_id = parseInt(req.params.id);

			const { status: reservation_type_status } = req.body;

			console.log(req.body, "hold body");
			const sub = new SubReservationService(trx);

			const data = await this.Model.reservationModel().getSingleBooking(
				hotel_code,
				booking_id
			);

			if (!data) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			const { booking_type, status, booking_rooms, check_in, check_out } =
				data;

			if (booking_type != "H" && status !== "confirmed") {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message:
						"This booking has other status. So, you cannot changed",
				};
			}

			if (reservation_type_status == "confirmed") {
				// update
				await this.Model.reservationModel().updateRoomBooking(
					{
						booking_type: "B",
						status: "confirmed",
					},
					hotel_code,
					booking_id
				);
				// Availability
				await sub.updateRoomAvailabilityForHoldService(
					"hold_decrease",
					booking_rooms,
					check_in,
					check_out,
					hotel_code
				);

				await sub.updateRoomAvailabilityService(
					"booked_room_increase",
					booking_rooms,
					check_in,
					check_out,
					hotel_code
				);

				// update room availability
			} else if (reservation_type_status == "canceled") {
				// update
				await this.Model.reservationModel().updateRoomBooking(
					{
						booking_type: "H",
						status: "canceled",
					},
					hotel_code,
					booking_id
				);

				// Availability
				await sub.updateRoomAvailabilityForHoldService(
					"hold_decrease",
					booking_rooms,
					check_in,
					check_out,
					hotel_code
				);
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Successfully updated",
			};
		});
	}

	public async getFoliosbySingleBooking(req: Request) {
		const data =
			await this.Model.hotelInvoiceModel().getFoliosbySingleBooking(
				req.hotel_admin.hotel_code,
				parseInt(req.params.id)
			);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async getFoliosWithEntriesbySingleBooking(req: Request) {
		const data =
			await this.Model.hotelInvoiceModel().getFoliosWithEntriesbySingleBooking(
				{
					hotel_code: req.hotel_admin.hotel_code,
					booking_id: parseInt(req.params.id),
				}
			);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async getFolioEntriesbyFolioID(req: Request) {
		const data =
			await this.Model.hotelInvoiceModel().getFolioEntriesbyFolioID(
				req.hotel_admin.hotel_code,
				parseInt(req.params.id)
			);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async addPaymentByFolioID(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { acc_id, amount, folio_id, payment_date, remarks } =
				req.body as addPaymentReqBody;
			const sub = new SubReservationService(trx);

			const invModel = this.Model.hotelInvoiceModel(trx);
			const checkSingleFolio =
				await invModel.getSingleFoliobyHotelCodeAndFolioID(
					req.hotel_admin.hotel_code,
					folio_id
				);

			if (!checkSingleFolio) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			// insert entries
			await sub.handlePaymentAndFolioForAddPayment({
				acc_id,
				amount,
				folio_id,
				guest_id: checkSingleFolio.guest_id,
				payment_for: "ADD MONEY",
				remarks,
				req,
				payment_date,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Payment has been added",
			};
		});
	}

	public async refundPaymentByFolioID(req: Request) {
		return await this.db.transaction(async (trx) => {
			const {
				acc_id,
				amount,
				folio_id,
				payment_date,
				payment_type,
				remarks,
			} = req.body as addPaymentReqBody;
			const sub = new SubReservationService(trx);

			const invModel = this.Model.hotelInvoiceModel(trx);
			const checkSingleFolio =
				await invModel.getSingleFoliobyHotelCodeAndFolioID(
					req.hotel_admin.hotel_code,
					folio_id
				);

			if (!checkSingleFolio) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			// insert entries
			await sub.handlePaymentAndFolioForRefundPayment({
				acc_id,
				amount,
				folio_id,
				guest_id: checkSingleFolio.guest_id,
				payment_for: "REFUND",
				remarks,
				req,
				payment_date,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Payment has been refunded",
			};
		});
	}

	public async adjustAmountByFolioID(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { amount, folio_id, remarks } = req.body as addPaymentReqBody;

			const invModel = this.Model.hotelInvoiceModel(trx);
			const checkSingleFolio =
				await invModel.getSingleFoliobyHotelCodeAndFolioID(
					req.hotel_admin.hotel_code,
					folio_id
				);

			if (!checkSingleFolio) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			await this.Model.hotelInvoiceModel().insertInFolioEntries({
				debit: -amount,
				credit: 0,
				folio_id: folio_id,
				posting_type: "Adjustment",
				description: remarks,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}

	public async addItemByFolioID(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { amount, folio_id, remarks } = req.body as addPaymentReqBody;

			const invModel = this.Model.hotelInvoiceModel(trx);
			const checkSingleFolio =
				await invModel.getSingleFoliobyHotelCodeAndFolioID(
					req.hotel_admin.hotel_code,
					folio_id
				);

			if (!checkSingleFolio) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			await this.Model.hotelInvoiceModel().insertInFolioEntries({
				debit: amount,
				folio_id: folio_id,
				posting_type: "Charge",
				description: remarks,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}
}
export default ReservationService;
