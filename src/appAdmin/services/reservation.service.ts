import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IinsertFolioEntriesPayload } from "../utlis/interfaces/invoice.interface";
import {
	addPaymentReqBody,
	BookingRequestBody,
	IGBookingRequestBody,
	IguestReqBody,
	IUpdateReservationRequestBody,
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
			const { total_amount, sub_total } = sub.calculateTotals(
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
					service_charge_percentage: body.service_charge_percentage,
					vat_percentage: body.vat_percentage,
				},
				hotel_code,
				guest_id,
				sub_total,
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
				service_charge_percentage,
				vat_percentage,
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
			const { total_amount, sub_total } =
				sub.calculateTotalsForGroupBooking(
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
					service_charge_percentage,
					vat_percentage,
				},
				hotel_code,
				sub_total,
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

	// public async updateSingleBooking(req: Request) {
	//   const {} = req.body as IGBookingRequestBody;
	//   const checkSingleBooking =
	//     await this.Model.reservationModel().getSingleBooking(
	//       req.hotel_admin.hotel_code,
	//       parseInt(req.params.id)
	//     );

	//   if (!checkSingleBooking) {
	//     return {
	//       success: false,
	//       code: this.StatusCode.HTTP_NOT_FOUND,
	//       message: this.ResMsg.HTTP_NOT_FOUND,
	//     };
	//   }
	//   return {
	//     success: true,
	//     code: this.StatusCode.HTTP_OK,
	//     // data,
	//   };
	// }

	public async updatePartialReservation(req: Request) {
		return await this.db.transaction(async (trx) => {
			const booking_id = parseInt(req.params.id);
			const { hotel_code } = req.hotel_admin;
			const body = req.body as IUpdateReservationRequestBody;

			const model = this.Model.reservationModel(trx);
			const hotelInvModel = this.Model.hotelInvoiceModel(trx);
			const sub = new SubReservationService(trx);

			// 1. Fetch booking
			const booking = await model.getSingleBooking(
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
				vat_percentage,
				service_charge_percentage,
				vat,
				service_charge,
			} = booking;

			// 2. Get folio for booking (Primary)
			const folio = await hotelInvModel.getFoliosbySingleBooking({
				booking_id,
				hotel_code,
				type: "Primary",
			});

			if (!folio || folio.length === 0) {
				throw new Error("Folio not found for booking");
			}
			const folioId = folio[0].id;
			const total_nights = sub.calculateNights(
				booking.check_in,
				booking.check_out
			);

			// Prepare folio entries array
			let folioEntries: IinsertFolioEntriesPayload[] = [];

			// Helper function to recalc VAT and Service Charge and push to folioEntries
			const addVatAndServiceChargeEntries = (
				totalChangedRate: number
			) => {
				const nowVat = vat_percentage
					? (totalChangedRate * vat_percentage) / 100
					: vat || 0;
				const nowServiceCharge = service_charge_percentage
					? (totalChangedRate * service_charge_percentage) / 100
					: service_charge || 0;

				for (
					let current = new Date(booking.check_in);
					current < new Date(booking.check_out);
					current.setDate(current.getDate() + 1)
				) {
					const formattedDate = current.toISOString().split("T")[0];

					if (nowVat > 0) {
						folioEntries.push({
							folio_id: folioId,
							date: formattedDate,
							posting_type: "Charge",
							debit: nowVat,
							room_id: 0,
							description: "VAT",
							rack_rate: 0,
						});
					}
					if (nowServiceCharge > 0) {
						folioEntries.push({
							folio_id: folioId,
							date: formattedDate,
							posting_type: "Charge",
							debit: nowServiceCharge,
							room_id: 0,
							description: "Service Charge",
							rack_rate: 0,
						});
					}
				}
			};

			// VOID all folio entries except payments initially
			await hotelInvModel.updateFolioEntriesByFolioId(
				{ is_void: true },
				{ folio_id: folioId },
				{ type: "Payment" }
			);

			// 3. Update rates for existing rooms if provided
			if (Array.isArray(body.changed_rate_of_booking_rooms)) {
				const currentRooms = await model.getAllBookingRoomsByBookingId({
					hotel_code,
					booking_id,
				});

				let total_changed_rate = 0;

				for (const room of currentRooms) {
					const changedRoom = body.changed_rate_of_booking_rooms.find(
						(r) => r.room_id === room.room_id
					);

					if (changedRoom) {
						await model.updateSingleBookingRoom(
							{
								base_rate:
									changedRoom.unit_base_rate * total_nights,
								changed_rate:
									changedRoom.unit_changed_rate *
									total_nights,
								unit_base_rate: changedRoom.unit_base_rate,
								unit_changed_rate:
									changedRoom.unit_changed_rate,
							},
							{
								room_id: changedRoom.room_id,
								booking_id,
							}
						);
						total_changed_rate += Number(
							changedRoom.unit_changed_rate
						);
					} else {
						total_changed_rate += Number(room.unit_changed_rate);
					}
				}

				// Add folio entries for changed rooms per night
				for (
					let current = new Date(booking.check_in);
					current < new Date(booking.check_out);
					current.setDate(current.getDate() + 1)
				) {
					const formattedDate = current.toISOString().split("T")[0];

					for (const room of body.changed_rate_of_booking_rooms) {
						folioEntries.push({
							folio_id: folioId,
							date: formattedDate,
							posting_type: "Charge",
							debit: room.unit_changed_rate,
							room_id: room.room_id,
							description: "Room Tariff",
							rack_rate: room.unit_base_rate,
						});
					}
				}

				// Add VAT and Service Charge for changed rooms
				addVatAndServiceChargeEntries(total_changed_rate);
			}

			// 4. Remove rooms (if any)
			if (
				Array.isArray(body.removed_rooms) &&
				body.removed_rooms.length > 0
			) {
				// Delete booking rooms from DB
				await model.deleteBookingRooms(body.removed_rooms);

				// VOID all folio entries except payments initially
				await hotelInvModel.updateFolioEntriesByFolioId(
					{ is_void: true },
					{ folio_id: folioId },
					{ type: "Payment" }
				);

				// Recalculate total changed rate after removal
				const remainingRooms =
					await model.getAllBookingRoomsByBookingId({
						hotel_code,
						booking_id,
					});
				const total_changed_rate = remainingRooms.reduce(
					(sum, r) => sum + Number(r.unit_changed_rate),
					0
				);

				// Add VAT and Service Charge for remaining rooms
				addVatAndServiceChargeEntries(total_changed_rate);

				// room avaibility decrease
				await sub.updateRoomAvailabilityServiceByRoomIds(
					"booked_room_decrease",
					body.removed_rooms,
					booking.check_in,
					booking.check_out,
					hotel_code
				);
			}

			// 5. Add new rooms (if any)
			if (
				Array.isArray(body.add_room_types) &&
				body.add_room_types.length > 0
			) {
				// Check availability for each room type first
				for (const rt of body.add_room_types) {
					const available =
						await model.getAllAvailableRoomsTypeWithAvailableRoomCount(
							{
								hotel_code,
								check_in: booking.check_in,
								check_out: booking.check_out,
								room_type_id: rt.room_type_id,
							}
						);

					const available_count = available[0]?.available_rooms || 0;

					console.log({ available_count });
					if (rt.rooms.length > available_count) {
						throw new Error(
							`Not enough availability for room type ${rt.room_type_id}`
						);
					}
				}

				const allRoomsbeforeAdd =
					await model.getAllBookingRoomsByBookingId({
						hotel_code,
						booking_id,
					});

				// Insert new rooms bulk
				await sub.insertBookingRoomsForGroupBooking(
					body.add_room_types,
					booking.id,
					total_nights,
					hotel_code
				);

				// Update availability
				await sub.updateAvailabilityWhenGroupRoomBooking(
					"booked",
					body.add_room_types,
					booking.check_in,
					booking.check_out,
					hotel_code
				);

				// Recalculate total changed rate after addition
				const allRoomsAfterAdd =
					await model.getAllBookingRoomsByBookingId({
						hotel_code,
						booking_id,
					});

				const total_changed_rate = allRoomsAfterAdd.reduce(
					(sum, r) => sum + Number(r.unit_changed_rate),
					0
				);

				// Add folio entries for added rooms per night
				for (
					let current = new Date(booking.check_in);
					current < new Date(booking.check_out);
					current.setDate(current.getDate() + 1)
				) {
					const formattedDate = current.toISOString().split("T")[0];

					for (const rt of body.add_room_types) {
						for (const room of rt.rooms) {
							folioEntries.push({
								folio_id: folioId,
								date: formattedDate,
								posting_type: "Charge",
								debit: room.rate.changed_rate,
								room_id: room.room_id,
								description: "Room Tariff",
								rack_rate: room.rate.base_rate,
							});
						}
					}

					for (const room of allRoomsbeforeAdd) {
						folioEntries.push({
							folio_id: folioId,
							date: formattedDate,
							posting_type: "Charge",
							debit: room.unit_changed_rate,
							room_id: room.room_id,
							description: "Room Tariff",
							rack_rate: room.unit_base_rate,
						});
					}
				}

				// Add VAT and Service Charge for all rooms after addition
				addVatAndServiceChargeEntries(total_changed_rate);
			}

			console.log({ folioEntries });

			// 6. Insert all folio entries at once
			if (folioEntries.length > 0) {
				await hotelInvModel.insertInFolioEntries(folioEntries);
			}

			// 7. Recalculate total_amount from all active folio entries (exclude voided)
			const allFolioEntries =
				await hotelInvModel.getFoliosEntriesbySingleBooking({
					hotel_code,
					booking_id,
				});

			const nowTotalAmount = allFolioEntries.reduce(
				(sum, entry) => sum + (Number(entry.debit) || 0),
				0
			);

			// 8. Update booking total_amount
			await model.updateRoomBooking(
				{
					total_amount: nowTotalAmount,
				},
				hotel_code,
				booking_id
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Reservation updated successfully",
			};
		});
	}

	// public async updatePartialReservation(req: Request) {
	//   return await this.db.transaction(async (trx) => {
	//     const booking_id = parseInt(req.params.id);
	//     const { hotel_code } = req.hotel_admin;
	//     const body = req.body as IUpdateReservationRequestBody;

	//     const model = this.Model.reservationModel(trx);
	//     const hotelInvModel = this.Model.hotelInvoiceModel(trx);
	//     const sub = new SubReservationService(trx);

	//     console.log("here");
	//     // 1. Fetch booking
	//     const booking = await model.getSingleBooking(hotel_code, booking_id);

	//     if (!booking) {
	//       return {
	//         success: false,
	//         code: this.StatusCode.HTTP_NOT_FOUND,
	//         message: this.ResMsg.HTTP_NOT_FOUND,
	//       };
	//     }

	//     const { vat_percentage, service_charge_percentage, vat, service_charge } =
	//       booking;

	//     // Get folio
	//     const folio = await hotelInvModel.getFoliosbySingleBooking({
	//       booking_id,
	//       hotel_code,
	//       type: "Primary",
	//     });

	//     const total_nights = sub.calculateNights(
	//       booking.check_in,
	//       booking.check_out
	//     );

	//     const folioEntries: IinsertFolioEntriesPayload[] = [];

	//     // 2. Update rate for existing rooms
	//     if (Array.isArray(body.changed_rate_of_booking_rooms)) {
	//       let total_changed_rate = 0;
	//       let nowVat = 0;
	//       let nowServiceCharge = 0;

	//       for (const room of body.changed_rate_of_booking_rooms) {
	//         if (
	//           room.unit_base_rate !== undefined &&
	//           room.unit_changed_rate !== undefined
	//         ) {
	//           // get all booking room
	//           const getAllBookingRooms =
	//             await model.getAllBookingRoomsByBookingId({
	//               hotel_code,
	//               booking_id,
	//             });

	//           // void all flio entries except payment
	//           await hotelInvModel.updateFolioEntriesByFolioId(
	//             { is_void: true },
	//             {
	//               folio_id: folio[0].id,
	//             },
	//             {
	//               type: "Payment",
	//             }
	//           );

	//           for (const broom of getAllBookingRooms) {
	//             if (room.room_id !== broom.room_id) {
	//               total_changed_rate += Number(broom.unit_changed_rate);
	//             } else {
	//               total_changed_rate += Number(room.unit_changed_rate);
	//             }
	//           }

	//           await model.updateSingleBookingRoom(
	//             {
	//               base_rate: room.unit_base_rate * total_nights,
	//               changed_rate: room.unit_changed_rate * total_nights,
	//               unit_base_rate: room.unit_base_rate,
	//               unit_changed_rate: room.unit_changed_rate,
	//             },
	//             {
	//               room_id: room.room_id,
	//               booking_id,
	//             }
	//           );

	//           // vat & service charge
	//           nowVat = vat_percentage
	//             ? (total_changed_rate * vat_percentage) / 100
	//             : vat;
	//           nowServiceCharge = service_charge_percentage
	//             ? total_changed_rate * service_charge_percentage
	//             : service_charge;

	//           for (
	//             let current = new Date(booking.check_in);
	//             current < new Date(booking.check_out);
	//             current.setDate(current.getDate() + 1)
	//           ) {
	//             const formattedDate = current.toISOString().split("T")[0];
	//             folioEntries.push({
	//               folio_id: folio[0].id,
	//               date: formattedDate,
	//               posting_type: "Charge",
	//               debit: room.unit_changed_rate,
	//               room_id: room.room_id,
	//               description: "Room Tariff",
	//               rack_rate: room.unit_base_rate,
	//             });
	//           }
	//         }
	//       }

	//       for (
	//         let current = new Date(booking.check_in);
	//         current < new Date(booking.check_out);
	//         current.setDate(current.getDate() + 1)
	//       ) {
	//         const formattedDate = current.toISOString().split("T")[0];

	//         // VAT (posted once per night)
	//         if (nowVat && nowVat > 0) {
	//           folioEntries.push({
	//             folio_id: folio[0].id,
	//             date: formattedDate,
	//             posting_type: "Charge",
	//             debit: nowVat,
	//             room_id: 0,
	//             description: "VAT",
	//             rack_rate: 0,
	//           });
	//         }

	//         // Service Charge
	//         if (nowServiceCharge && nowServiceCharge > 0) {
	//           folioEntries.push({
	//             folio_id: folio[0].id,
	//             date: formattedDate,
	//             posting_type: "Charge",
	//             debit: nowServiceCharge,
	//             room_id: 0,
	//             description: "Service Charge",
	//             rack_rate: 0,
	//           });
	//         }
	//       }
	//     }

	//     // 3. Remove rooms
	//     if (Array.isArray(body.removed_rooms) && body.removed_rooms.length > 0) {
	//       await model.deleteBookingRooms(body.removed_rooms);

	//       // Void all folio entries for each removed room
	//       for (const room_id of body.removed_rooms) {
	//         await hotelInvModel.updateFolioEntriesByRoom(
	//           { is_void: true },
	//           room_id,
	//           booking_id
	//         );
	//       }
	//     }

	//     // 4. Add new rooms
	//     if (Array.isArray(body.add_room_types)) {
	//       // Availability check per room type
	//       for (const rt of body.add_room_types) {
	//         console.log("here");
	//         const available =
	//           await model.getAllAvailableRoomsTypeWithAvailableRoomCount({
	//             hotel_code,
	//             check_in: booking.check_in,
	//             check_out: booking.check_out,
	//             room_type_id: rt.room_type_id,
	//           });

	//         const available_count = available[0]?.available_rooms || 0;
	//         if (rt.rooms.length > available_count) {
	//           throw new Error(
	//             `Not enough availability for room type ${rt.room_type_id}`
	//           );
	//         }
	//       }

	//       // Insert all rooms (one call)
	//       await sub.insertBookingRoomsForGroupBooking(
	//         body.add_room_types,
	//         booking.id,
	//         total_nights,
	//         hotel_code
	//       );

	//       // Availability update
	//       await sub.updateAvailabilityWhenGroupRoomBooking(
	//         "booked",
	//         body.add_room_types,
	//         booking.check_in,
	//         booking.check_out,
	//         hotel_code
	//       );

	//       // Folio entries
	//       for (
	//         let current = new Date(booking.check_in);
	//         current < new Date(booking.check_out);
	//         current.setDate(current.getDate() + 1)
	//       ) {
	//         const formattedDate = current.toISOString().split("T")[0];

	//         for (const rt of body.add_room_types) {
	//           for (const room of rt.rooms) {
	//             folioEntries.push({
	//               folio_id: folio[0].id,
	//               date: formattedDate,
	//               posting_type: "Charge",
	//               debit: room.rate.changed_rate,
	//               room_id: room.room_id,
	//               description: "Room Tariff",
	//               rack_rate: room.rate.base_rate,
	//             });
	//           }
	//         }
	//       }
	//     }

	//     // 5. Insert folio entries (for updated or added rooms)
	//     if (folioEntries.length > 0) {
	//       await hotelInvModel.insertInFolioEntries(folioEntries);
	//     }

	//     // 6. Recalculate total
	//     const getFolioEntries =
	//       await hotelInvModel.getFoliosEntriesbySingleBooking({
	//         hotel_code,
	//         booking_id,
	//       });

	//     const nowTotalAmount = getFolioEntries.reduce(
	//       (sum, entry) => sum + (Number(entry.debit) || 0),
	//       0
	//     );

	//     await model.updateRoomBooking(
	//       {
	//         total_amount: nowTotalAmount,
	//       },
	//       hotel_code,
	//       booking_id
	//     );

	//     return {
	//       success: true,
	//       code: this.StatusCode.HTTP_OK,
	//       message: "Reservation updated successfully",
	//     };
	//   });
	// }

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
			await this.Model.hotelInvoiceModel().getFoliosbySingleBooking({
				hotel_code: req.hotel_admin.hotel_code,
				booking_id: parseInt(req.params.id),
			});

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
