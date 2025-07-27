import { Request } from 'express';
import AbstractServices from '../../abstarcts/abstract.service';
import { IinsertFolioEntriesPayload } from '../utlis/interfaces/invoice.interface';
import {
  addPaymentReqBody,
  BookingRoom,
  IBookingDetails,
  IGBGuestInfo,
  IGBookingRequestBody,
  IGBRoomGuest,
  IUpdateReservationRequestBody,
} from '../utlis/interfaces/reservation.interface';
import { HelperFunction } from '../utlis/library/helperFunction';
import { SubReservationService } from './subreservation.service';

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

  public async getAllAvailableRoomsTypeForEachDateAvailableRoom(req: Request) {
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
          message: 'Check-in date must be before check-out date',
        };
      }

      const reservationModel = this.Model.reservationModel(trx);

      // Validate room availability
      for (const rt of booked_room_types) {
        // check how many rooms available by room types
        const availableRooms =
          await reservationModel.getAllAvailableRoomsTypeWithAvailableRoomCount(
            {
              hotel_code,
              check_in,
              check_out,
              room_type_id: rt.room_type_id,
            }
          );

        if (rt.rooms.length > (availableRooms[0]?.available_rooms || 0)) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'Room Assigned is more than available rooms',
          };
        }

        // check rooms available or not
        const availableRoomList =
          await reservationModel.getAllAvailableRoomsByRoomType({
            hotel_code,
            check_in,
            check_out,
            room_type_id: rt.room_type_id,
          });

        for (const room of rt.rooms) {
          const isRoomAvailable = availableRoomList.some((avr) => {
            return avr.room_id === room.room_id;
          });

          if (!isRoomAvailable) {
            // get single room which is not available
            const getSingleRoom = await this.Model.RoomModel().getSingleRoom(
              hotel_code,
              room.room_id
            );

            return {
              success: false,
              code: this.StatusCode.HTTP_BAD_REQUEST,
              message: `Room No ${getSingleRoom[0]?.room_name} not available`,
            };
          }
        }
      }

      // Find lead guest
      // let leadGuest: IguestReqBody | null = null;

      // outer: for (const rt of booked_room_types) {
      //   for (const room of rt.rooms) {
      //     for (const guest of room.guest_info) {
      //       if (guest.is_lead_guest) {
      //         leadGuest = guest;
      //         break outer;
      //       }
      //     }
      //   }
      // }

      // if (!leadGuest) {
      //   return {
      //     success: false,
      //     code: this.StatusCode.HTTP_BAD_REQUEST,
      //     message: "Lead guest information is required",
      //   };
      // }

      // Insert or get lead guest
      const guest_id = await sub.findOrCreateGuest(
        body.lead_guest_info,
        hotel_code
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
          booking_type: reservation_type === 'booked' ? 'B' : 'H',
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
        guest_id,
        is_checked_in,
        total_nights,
      });

      // Insert booking rooms
      await sub.insertBookingRooms({
        booked_room_types,
        booking_id: booking.id,
        nights: total_nights,
        hotel_code,
        is_checked_in,
      });

      // Update availability
      await sub.updateAvailabilityWhenRoomBooking(
        reservation_type,
        booked_room_types,
        hotel_code
      );

      // Create folio and ledger entries
      await sub.createRoomBookingFolioWithEntries({
        body,
        guest_id,
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
        req,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Booking created successfully',
        data: {
          booking_id: booking.id,
        },
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
          message: 'Check-in date must be before check-out date',
        };
      }
      const reservationModel = this.Model.reservationModel(trx);
      // Validate room availability
      for (const rt of booked_room_types) {
        const availableRooms =
          await reservationModel.getAllAvailableRoomsTypeWithAvailableRoomCount(
            {
              hotel_code,
              check_in,
              check_out,
              room_type_id: rt.room_type_id,
            }
          );

        if (rt.rooms.length > (availableRooms[0]?.available_rooms || 0)) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'Room Assigned is more than available rooms',
          };
        }

        // check rooms available or not
        const availableRoomList =
          await reservationModel.getAllAvailableRoomsByRoomType({
            hotel_code,
            check_in,
            check_out,
            room_type_id: rt.room_type_id,
          });

        for (const room of rt.rooms) {
          const isRoomAvailable = availableRoomList.some((avr) => {
            return avr.room_id === room.room_id;
          });

          // get single room which is not available
          const getSingleRoom = await this.Model.RoomModel().getSingleRoom(
            hotel_code,
            room.room_id
          );

          if (!isRoomAvailable) {
            return {
              success: false,
              code: this.StatusCode.HTTP_BAD_REQUEST,
              message: `Room No ${getSingleRoom[0]?.room_name} not available`,
            };
          }
        }
      }

      // Find lead guest
      // let leadGuest: IguestReqBody | null = null;

      // outer: for (const rt of booked_room_types) {
      //   for (const room of rt.rooms) {
      //     for (const guest of room.guest_info) {
      //       if (guest.is_lead_guest) {
      //         leadGuest = guest;
      //         break outer;
      //       }
      //     }
      //   }
      // }

      // if (!leadGuest) {
      //   return {
      //     success: false,
      //     code: this.StatusCode.HTTP_BAD_REQUEST,
      //     message: "Lead guest information is required",
      //   };
      // }

      // Insert or get lead guest
      const guest_id = await sub.findOrCreateGuest(
        body.lead_guest_info,
        hotel_code
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
          booking_type: reservation_type === 'booked' ? 'B' : 'H',
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
        guest_id,
        is_checked_in,
        total_nights,
      });

      // Insert booking rooms
      await sub.insertBookingRoomsForGroupBooking({
        booked_room_types,
        booking_id: booking.id,
        hotel_code,
        is_checked_in,
      });

      // Update availability
      await sub.updateAvailabilityWhenRoomBooking(
        reservation_type,
        booked_room_types,
        hotel_code
      );

      // Create folio and ledger entries
      await sub.createGroupRoomBookingFolios({
        body,
        guest_id,
        booking_id: booking.id,
        req,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Booking created successfully',
        data: {
          booking_id: booking.id,
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

    const { data, total } = await this.Model.reservationModel().getAllBooking({
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

  public async getAllIndividualBooking(req: Request) {
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
      await this.Model.reservationModel().getAllIndividualBooking({
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

  public async getAllGroupBooking(req: Request) {
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
      await this.Model.reservationModel().getAllGroupBooking({
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

  public async updatePartialReservation(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { hotel_code } = req.hotel_admin;
      const body = req.body as IUpdateReservationRequestBody;
      const reservationModel = this.Model.reservationModel(trx);
      const hotelInvModel = this.Model.hotelInvoiceModel(trx);

      const roomModel = this.Model.RoomModel(trx);
      const sub = new SubReservationService(trx);

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
        vat_percentage: bookingVatPct = 0,
        service_charge_percentage: bookingScPct = 0,
        booking_rooms,
        guest_id,
      } = booking as IBookingDetails;

      if (
        Array.isArray(body.changed_rate_of_booking_rooms) &&
        body.changed_rate_of_booking_rooms.length
      ) {
        for (const change of body.changed_rate_of_booking_rooms) {
          const room = await reservationModel.getSingleBookingRoom({
            booking_id,
            room_id: change.room_id,
          });

          if (!room) continue;

          const [roomFolio] =
            await hotelInvModel.getFolioWithEntriesbySingleBookingAndRoomID({
              hotel_code,
              booking_id,
              room_ids: [room.room_id],
            });

          if (!roomFolio) continue;

          const entryIDs =
            roomFolio.folio_entries?.map((e) => e.entries_id) ?? [];

          if (entryIDs.length) {
            await hotelInvModel.updateFolioEntries({ is_void: true }, entryIDs);
          }

          const nights = sub.calculateNights(room.check_in, room.check_out);
          const res = await reservationModel.updateSingleBookingRoom(
            {
              unit_changed_rate: change.unit_changed_rate,
              unit_base_rate: change.unit_base_rate,
              changed_rate: change.unit_changed_rate * nights,
              base_rate: change.unit_base_rate * nights,
            },
            { room_id: room.room_id, booking_id }
          );

          const newEntries: IinsertFolioEntriesPayload[] = [];
          for (let i = 0; i < nights; i++) {
            const date = sub.addDays(room.check_in, i);
            const tariff = change.unit_changed_rate;
            const vat = (tariff * bookingVatPct) / 100;
            const sc = (tariff * bookingScPct) / 100;

            newEntries.push({
              folio_id: roomFolio.id,
              description: 'Room Tariff',
              posting_type: 'Charge',
              debit: tariff,
              credit: 0,
              date,
              room_id: room.room_id,
              rack_rate: room.base_rate,
            });

            if (vat > 0) {
              newEntries.push({
                folio_id: roomFolio.id,
                description: 'VAT',
                posting_type: 'Charge',
                debit: vat,
                credit: 0,
                date,
              });
            }
            if (sc > 0) {
              newEntries.push({
                folio_id: roomFolio.id,
                description: 'Service Charge',
                posting_type: 'Charge',
                debit: sc,
                credit: 0,
                date,
              });
            }
          }
          if (newEntries.length) {
            await hotelInvModel.insertInFolioEntries(newEntries);
          }
        }
      }

      if (Array.isArray(body.removed_rooms) && body.removed_rooms.length) {
        const removedIDs = [...new Set(body.removed_rooms)];

        const roomsBeingRemoved = booking_rooms.filter((br) =>
          removedIDs.includes(br.room_id)
        );

        await reservationModel.deleteBookingRooms(removedIDs);

        await sub.updateRoomAvailabilityService({
          reservation_type: 'booked_room_decrease',
          rooms: roomsBeingRemoved,
          hotel_code,
        });

        const roomFolios =
          await hotelInvModel.getFolioWithEntriesbySingleBookingAndRoomID({
            hotel_code,
            booking_id,
            room_ids: removedIDs,
          });

        const allEntryIDs = roomFolios.flatMap(
          (f) => f?.folio_entries?.map((e) => e.entries_id) ?? []
        );
        const allFolioIDs: number[] = roomFolios
          .filter((f) => !f?.is_void)
          .map((f) => f.id);

        if (allEntryIDs.length) {
          await hotelInvModel.updateFolioEntries(
            { is_void: true },
            allEntryIDs
          );
        }
        if (allFolioIDs.length) {
          await hotelInvModel.updateSingleFolio(
            { is_void: true },
            { folioIds: allFolioIDs, booking_id, hotel_code }
          );
        }
      }

      /***********************************************************************
       * 4. ADD NEW ROOMS
       **********************************************************************/
      let newlyAddedRooms: {
        room_id: number;
        room_type_id: number;
        unit_changed_rate: number;
        unit_base_rate: number;
        check_in: string;
        check_out: string;
      }[] = [];

      if (Array.isArray(body.add_room_types) && body.add_room_types.length) {
        await sub.insertBookingRoomsForGroupBooking({
          booked_room_types: body.add_room_types,
          booking_id,
          hotel_code,
          is_checked_in: false,
        });

        await sub.updateAvailabilityWhenRoomBooking(
          'booked',
          body.add_room_types,
          hotel_code
        );

        const { booking_rooms: freshRooms } =
          (await reservationModel.getSingleBooking(
            hotel_code,
            booking_id
          )) as IBookingDetails;

        const addedIDs = body.add_room_types.flatMap((rt) =>
          rt.rooms.map((r) => r.room_id)
        );

        const freshMap = new Map(
          freshRooms.map((br) => [br.room_id, br] as const)
        );

        newlyAddedRooms = addedIDs
          .map((id) => freshMap.get(id))
          .filter(Boolean)
          .map((room) => ({
            room_id: room!.room_id,
            room_type_id: room!.room_type_id,
            unit_changed_rate: room!.unit_changed_rate,
            unit_base_rate: room!.unit_base_rate,
            check_in: room!.check_in,
            check_out: room!.check_out,
          }));
      }

      for (const br of newlyAddedRooms) {
        const [roomRow] = await roomModel.getSingleRoom(hotel_code, br.room_id);
        const roomName = roomRow?.room_name ?? br.room_id.toString();

        const [lastFolio] = await hotelInvModel.getLasFolioId();
        const folio_number = HelperFunction.generateFolioNumber(lastFolio?.id);

        const [roomFolio] = await hotelInvModel.insertInFolio({
          hotel_code,
          booking_id,
          room_id: br.room_id,
          type: 'room_primary',
          guest_id,
          folio_number,
          status: 'open',
          name: `Room ${roomName} Folio`,
        });

        const nights = sub.calculateNights(br.check_in, br.check_out);
        const entries: IinsertFolioEntriesPayload[] = [];

        for (let i = 0; i < nights; i++) {
          const date = sub.addDays(br.check_in, i);
          const tariff = br.unit_changed_rate;
          const vat = (tariff * bookingVatPct) / 100;
          const sc = (tariff * bookingScPct) / 100;

          entries.push(
            {
              folio_id: roomFolio.id,
              description: 'Room Tariff',
              posting_type: 'Charge',
              debit: tariff,
              credit: 0,
              date,
              room_id: br.room_id,
            },
            {
              folio_id: roomFolio.id,
              description: 'VAT',
              posting_type: 'Charge',
              debit: vat,
              credit: 0,
              date,
            },
            {
              folio_id: roomFolio.id,
              description: 'Service Charge',
              posting_type: 'Charge',
              debit: sc,
              credit: 0,
              date,
            }
          );
        }
        await hotelInvModel.insertInFolioEntries(entries);
      }

      const { total_debit } =
        await hotelInvModel.getFolioEntriesCalculationByBookingID({
          hotel_code,
          booking_id,
        });

      await reservationModel.updateRoomBooking(
        { total_amount: total_debit },
        hotel_code,
        booking_id
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Group reservation updated',
      };
    });
  }

  public async changeDatesOfBooking(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { hotel_code } = req.hotel_admin;
      const { check_in, check_out } = req.body as {
        check_in: string;
        check_out: string;
      };

      const reservationModel = this.Model.reservationModel(trx);
      const invoiceModel = this.Model.hotelInvoiceModel(trx);
      const sub = new SubReservationService(trx);

      const booking = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );
      if (!booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Booking not found',
        };
      }

      const {
        booking_rooms,
        check_in: prev_checkin,
        check_out: prev_checkout,
        vat_percentage = 0,
        service_charge_percentage = 0,
      } = booking;

      if (prev_checkin === check_in && prev_checkout === check_out) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'You have requested the previous date range.',
        };
      }

      const nights = sub.calculateNights(check_in, check_out);
      if (nights <= 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Invalid check‑in / check‑out date combination.',
        };
      }

      const byType = new Map<number, BookingRoom[]>();
      for (const r of booking_rooms) {
        if (!byType.has(r.room_type_id)) byType.set(r.room_type_id, []);
        byType.get(r.room_type_id)!.push(r);
      }

      for (const [room_type_id, roomsOfType] of byType) {
        const availableRoomList =
          await reservationModel.getAvailableRoomsByRoomType({
            hotel_code,
            check_in,
            check_out,
            room_type_id,
            exclude_booking_id: booking_id,
          });

        const idSet = new Set(availableRoomList.map((r) => r.room_id));

        for (const r of roomsOfType) {
          if (!idSet.has(r.room_id)) {
            return {
              success: false,
              code: this.StatusCode.HTTP_CONFLICT,
              message: `Room ${r.room_name} is not available for the new dates.`,
            };
          }
        }
      }

      const folioEntries: IinsertFolioEntriesPayload[] = [];
      for (const room of booking_rooms) {
        for (let i = 0; i < nights; i++) {
          const date = sub.addDays(check_in, i);
          const tariff = room.unit_changed_rate;
          const vat = (tariff * vat_percentage) / 100;
          const sc = (tariff * service_charge_percentage) / 100;

          folioEntries.push({
            folio_id: 0,
            date,
            posting_type: 'Charge',
            debit: tariff,
            credit: 0,
            room_id: room.room_id,
            description: 'Room Tariff',
            rack_rate: room.unit_base_rate,
          });

          if (vat > 0) {
            folioEntries.push({
              folio_id: 0,
              date,
              posting_type: 'Charge',
              debit: vat,
              credit: 0,
              room_id: room.room_id,
              description: 'VAT',
              rack_rate: 0,
            });
          }

          if (sc > 0) {
            folioEntries.push({
              folio_id: 0,
              date,
              posting_type: 'Charge',
              debit: sc,
              credit: 0,
              room_id: room.room_id,
              description: 'Service Charge',
              rack_rate: 0,
            });
          }
        }
      }

      const roomFolios = await invoiceModel.getFoliosbySingleBooking({
        booking_id,
        hotel_code,
        type: 'room_primary',
      });

      if (!roomFolios.length) {
        return {
          success: false,
          code: 404,
          message: 'No room-primary folios found.',
        };
      }

      const entryIdsToVoid: number[] = [];
      const roomIdToFolioId = new Map<number, number>();

      for (const f of roomFolios) {
        roomIdToFolioId.set(f.room_id, f.id);

        const folioEntriesByFolio = await invoiceModel.getFolioEntriesbyFolioID(
          hotel_code,
          f.id
        );

        entryIdsToVoid.push(...folioEntriesByFolio.map((fe) => fe.id));
      }

      if (entryIdsToVoid.length) {
        await invoiceModel.updateFolioEntries(
          { is_void: true },
          entryIdsToVoid
        );
      }

      for (const e of folioEntries) {
        const fid = roomIdToFolioId.get(e.room_id as number);
        if (!fid)
          throw new Error(
            `No room_primary folio found for room_id ${e.room_id}`
          );
        e.folio_id = fid;
      }
      await invoiceModel.insertInFolioEntries(folioEntries);

      await sub.updateRoomAvailabilityService({
        reservation_type: 'booked_room_decrease',
        rooms: booking_rooms,
        hotel_code,
      });

      const updateRooms: BookingRoom[] = [];
      for (const r of booking_rooms) {
        updateRooms.push({
          ...r,
          check_in,
          check_out,
          changed_rate: r.unit_changed_rate * nights,
          base_rate: r.unit_base_rate * nights,
        });
      }

      const roomsUpdate = updateRooms.map((r) => {
        return reservationModel.updateSingleBookingRoom(
          {
            check_in,
            check_out,
            changed_rate: r.unit_changed_rate * nights,
            base_rate: r.unit_base_rate * nights,
          },
          { room_id: r.room_id, booking_id }
        );
      });
      await Promise.all(roomsUpdate);

      //  Block inventory for new range
      await sub.updateRoomAvailabilityService({
        reservation_type: 'booked_room_increase',
        rooms: updateRooms,
        hotel_code,
      });

      const totalAmount = folioEntries.reduce(
        (sum, e) => sum + (e.debit ?? 0),
        0
      );
      await reservationModel.updateRoomBooking(
        {
          total_amount: totalAmount,
          total_nights: nights,
          check_in,
          check_out,
        },
        hotel_code,
        booking_id
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Reservation dates modified successfully.',
      };
    });
  }

  public async changeRoomOfAReservation(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { hotel_code } = req.hotel_admin;
      const { new_room_id, previous_room_id } = req.body as {
        previous_room_id: number;
        new_room_id: number;
      };

      const reservationModel = this.Model.reservationModel(trx);
      const invoiceModel = this.Model.hotelInvoiceModel(trx);
      const sub = new SubReservationService(trx);

      const booking = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );
      if (!booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Booking not found',
        };
      }

      const { booking_rooms } = booking;

      const previouseRoom = booking_rooms.find(
        (room) => room.room_id === previous_room_id
      );

      if (!previouseRoom) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'You have given an invalid room that you want to change',
        };
      }

      // const get single room
      const checkNewRoom = await this.Model.RoomModel(trx).getSingleRoom(
        hotel_code,
        new_room_id
      );

      if (!checkNewRoom.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'New Room not found',
        };
      }

      const { room_type_id } = checkNewRoom[0];

      const availableRoomList =
        await reservationModel.getAllAvailableRoomsByRoomType({
          hotel_code,
          check_in: previouseRoom.check_in,
          check_out: previouseRoom.check_out,
          room_type_id,
          exclude_booking_id: booking_id,
        });

      const isNewRoomAvailable = availableRoomList.find(
        (room) => room.room_id === new_room_id
      );

      if (!isNewRoomAvailable) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: `Room ${checkNewRoom[0].room_name} is not available for the new dates.`,
        };
      }

      const roomFolios = await invoiceModel.getFoliosbySingleBooking({
        booking_id,
        hotel_code,
        type: 'room_primary',
      });

      if (!roomFolios.length) {
        return {
          success: false,
          code: 404,
          message: 'No room-primary folios found.',
        };
      }

      console.log({ roomFolios });
      const prevRoomFolio = roomFolios.find(
        (rf) => rf.room_id === previous_room_id
      );

      if (!prevRoomFolio) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Previous rooms folio not found',
        };
      }

      const folioEntriesByFolio = await invoiceModel.getFolioEntriesbyFolioID(
        hotel_code,
        prevRoomFolio.id
      );

      const folioEntryIDs = folioEntriesByFolio
        .filter((fe) => fe.room_id === previous_room_id)
        .map((fe) => fe.id);

      if (!folioEntryIDs.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Folio entries not found by previous room ID',
        };
      }
      console.log({ folioEntryIDs });

      // update folio entries
      await invoiceModel.updateFolioEntries(
        { room_id: new_room_id },
        folioEntryIDs as number[]
      );

      // update folio
      await invoiceModel.updateSingleFolio(
        {
          room_id: new_room_id,
          name: `Room ${checkNewRoom[0].room_name} Folio`,
        },
        { hotel_code, booking_id, folio_id: prevRoomFolio.id }
      );

      // update single booking rooms
      await reservationModel.updateSingleBookingRoom(
        { room_id: new_room_id, room_type_id },
        { booking_id, room_id: previous_room_id }
      );

      await sub.updateRoomAvailabilityService({
        reservation_type: 'booked_room_decrease',
        rooms: [previouseRoom],
        hotel_code,
      });

      await sub.updateRoomAvailabilityService({
        reservation_type: 'booked_room_increase',
        rooms: [
          {
            check_in: previouseRoom.check_in,
            check_out: previouseRoom.check_out,
            room_type_id,
          },
        ],
        hotel_code,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Successfully Room has been shifted',
      };
    });
  }

  public async updateOthersOfARoomByBookingID(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.booking_id);
      const { hotel_code } = req.hotel_admin;

      const reservationModel = this.Model.reservationModel(trx);

      const booking = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );
      if (!booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Booking not found',
        };
      }

      // update single booking rooms
      await reservationModel.updateSingleBookingRoom(req.body, {
        booking_id,
        room_id: Number(req.params.room_id),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Successfully Updated',
      };
    });
  }

  public async individualRoomDatesChangeOfBooking(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { hotel_code } = req.hotel_admin;
      const { check_in, check_out, room_id } = req.body as {
        check_in: string;
        check_out: string;
        room_id: number;
      };

      const reservationModel = this.Model.reservationModel(trx);
      const invoiceModel = this.Model.hotelInvoiceModel(trx);
      const sub = new SubReservationService(trx);

      const getSingleBooking = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );

      if (!getSingleBooking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Booking not found',
        };
      }

      const { vat_percentage, service_charge_percentage } = getSingleBooking;

      const bookingRoom = (await reservationModel.getSingleBookingRoom({
        booking_id,
        room_id,
      })) as BookingRoom | undefined;

      if (!bookingRoom) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Room not found.',
        };
      }

      const {
        check_in: prevCheckIn,
        check_out: prevCheckOut,
        unit_base_rate,
        unit_changed_rate,
        room_type_id,
      } = bookingRoom;

      if (prevCheckIn === check_in && prevCheckOut === check_out) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'You submitted the same date range.',
        };
      }

      const nights = sub.calculateNights(check_in, check_out);
      if (nights <= 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Invalid check‑in / check‑out dates.',
        };
      }

      // Is the exact room free?
      const roomList = await reservationModel.getAllAvailableRoomsByRoomType({
        hotel_code,
        check_in,
        check_out,
        room_type_id,
        exclude_booking_id: booking_id,
      });

      if (!roomList.some((r) => r.room_id === room_id)) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: `Room #${room_id} is not free for the new dates.`,
        };
      }

      const folioEntries: IinsertFolioEntriesPayload[] = [];

      for (let i = 0; i < nights; i++) {
        const date = sub.addDays(check_in, i);
        const tariff = unit_changed_rate;
        const vat = (tariff * vat_percentage) / 100;
        const sc = (tariff * service_charge_percentage) / 100;

        // Tariff
        folioEntries.push({
          folio_id: 0,
          date,
          posting_type: 'Charge',
          debit: tariff,
          credit: 0,
          room_id,
          description: 'Room Tariff',
          rack_rate: unit_base_rate,
        });

        // VAT
        if (vat > 0) {
          folioEntries.push({
            folio_id: 0,
            date,
            posting_type: 'Charge',
            debit: vat,
            credit: 0,
            room_id,
            description: 'VAT',
            rack_rate: 0,
          });
        }

        // Service Charge
        if (sc > 0) {
          folioEntries.push({
            folio_id: 0,
            date,
            posting_type: 'Charge',
            debit: sc,
            credit: 0,
            room_id,
            description: 'Service Charge',
            rack_rate: 0,
          });
        }
      }

      /* ─── 5. Void OLD folio entries for this room ───────────────────────── */
      const roomFolios =
        await invoiceModel.getFolioWithEntriesbySingleBookingAndRoomID({
          booking_id,
          hotel_code,
          room_ids: [room_id],
        });

      if (!roomFolios.length) {
        return { success: false, code: 404, message: 'No room‑primary folio.' };
      }

      const entryIdsToVoid: number[] = [];
      for (const f of roomFolios) {
        const oldEntries = await invoiceModel.getFolioEntriesbyFolioID(
          hotel_code,
          f.id
        );
        entryIdsToVoid.push(...oldEntries.map((fe) => fe.id));

        // Tag new entries with correct folio_id right here
        folioEntries.forEach((e) => {
          e.folio_id = f.id;
        });
      }

      if (entryIdsToVoid.length) {
        await invoiceModel.updateFolioEntries(
          { is_void: true },
          entryIdsToVoid
        );
      }

      await sub.updateRoomAvailabilityService({
        reservation_type: 'booked_room_decrease',
        rooms: [bookingRoom], // uses previous dates
        hotel_code,
      });

      await invoiceModel.insertInFolioEntries(folioEntries);

      await reservationModel.updateSingleBookingRoom(
        {
          check_in,
          check_out,
          changed_rate: unit_changed_rate * nights,
          base_rate: unit_base_rate * nights,
        },
        { room_id, booking_id }
      );

      await sub.updateRoomAvailabilityService({
        reservation_type: 'booked_room_increase',
        rooms: [
          {
            ...bookingRoom,
            check_in,
            check_out,
          },
        ],
        hotel_code,
      });

      //get folio entries calculation
      const { total_debit } =
        await invoiceModel.getFolioEntriesCalculationByBookingID({
          booking_id,
          hotel_code,
        });

      await reservationModel.updateRoomBooking(
        {
          total_amount: total_debit,
        },
        hotel_code,
        booking_id
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Room dates updated successfully.',
      };
    });
  }

  public async checkIn(req: Request) {
    const hotel_code = req.hotel_admin.hotel_code;
    const booking_id = parseInt(req.params.id);
    const model = this.Model.reservationModel();
    const data = await model.getSingleBooking(hotel_code, booking_id);

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const { status, check_in } = data;

    if (status != 'confirmed') {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'This booking has other status. So, you cannot checkin',
      };
    }

    if (check_in > new Date().toISOString()) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: `You can only check in when the check-in date is or after ${check_in}`,
      };
    }

    // update
    await model.updateRoomBooking(
      {
        status: 'checked_in',
      },
      hotel_code,
      booking_id
    );

    // update booking rooms
    await model.updateAllBookingRoomsByBookingID(
      { status: 'checked_in', checked_in_at: new Date().toISOString() },
      { booking_id, exclude_checkout: true }
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Successfully Cheked in',
    };
  }

  public async individualRoomCheckIn(req: Request) {
    const hotel_code = req.hotel_admin.hotel_code;
    const booking_id = parseInt(req.params.id);
    const model = this.Model.reservationModel();
    const data = await model.getSingleBooking(hotel_code, booking_id);

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    if (data.check_in > new Date().toISOString()) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: `You can only check in when the check-in date is or after ${data.check_in}`,
      };
    }

    // update booking rooms
    await model.updateSingleBookingRoom(
      { status: 'checked_in', checked_in_at: new Date().toISOString() },
      { booking_id, room_id: Number(req.params.room_id) }
    );

    // check all booking rooms are check in or not
    const getSingleBookingRoom = await model.getSingleBooking(
      hotel_code,
      booking_id
    );

    if (getSingleBookingRoom) {
      const { booking_rooms } = getSingleBookingRoom;

      const isAllCheckIn = booking_rooms.every(
        (room) => room.status === 'checked_in'
      );

      if (isAllCheckIn) {
        // update main booking
        await model.updateRoomBooking(
          { status: 'checked_in' },
          hotel_code,
          booking_id
        );
      }
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Successfully Cheked in',
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

      const { status, booking_type, booking_rooms, check_in, check_out } = data;

      if (booking_type != 'B' && status != 'checked_in') {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'This booking has other status. So, you cannot checkout',
        };
      }

      if (check_out > new Date().toISOString()) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: `You can only check out when the check-out date is or after ${check_out}`,
        };
      }

      // check  due balance exist or not
      // const hotelInvoiceModel = this.Model.hotelInvoiceModel(trx);

      // const checkDueAmount = await hotelInvoiceModel.getDueAmountByBookingID({
      //   booking_id,
      //   hotel_code,
      // });

      // if (checkDueAmount > 0) {
      //   return {
      //     success: false,
      //     code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
      //     message: `This guest has ${checkDueAmount} due. So you cannot checkout`,
      //   };
      // }

      const remainCheckOutRooms: BookingRoom[] = booking_rooms?.filter(
        (room) => room.status !== 'checked_out'
      );

      if (remainCheckOutRooms?.length) {
        await sub.updateRoomAvailabilityService({
          reservation_type: 'booked_room_decrease',
          rooms: remainCheckOutRooms,
          hotel_code,
        });
      }

      // update reservation
      await reservationModel.updateRoomBooking(
        {
          status: 'checked_out',
        },
        hotel_code,
        booking_id
      );

      // update booking rooms status
      await reservationModel.updateAllBookingRoomsByBookingID(
        { status: 'checked_out', checked_out_at: new Date().toISOString() },
        { booking_id }
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Successfully Checked out',
      };
    });
  }

  public async individualCheckOut(req: Request) {
    return await this.db.transaction(async (trx) => {
      const hotel_code = req.hotel_admin.hotel_code;
      const booking_id = parseInt(req.params.id);
      const roomID = parseInt(req.params.room_id);

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

      const { status, booking_type, booking_rooms, check_in, check_out } = data;

      if (booking_type != 'B' && status != 'checked_in') {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'This booking has other status. So, you cannot checkout',
        };
      }

      if (check_out > new Date().toISOString()) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: `You can only check out when the check-out date is or after ${check_out}`,
        };
      }

      // check  due balance exist or not
      // const hotelInvoiceModel = this.Model.hotelInvoiceModel(trx);

      // const checkDueAmount = await hotelInvoiceModel.getDueAmountByBookingID({
      //   booking_id,
      //   hotel_code,
      // });

      // if (checkDueAmount > 0) {
      //   return {
      //     success: false,
      //     code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
      //     message: `This guest has ${checkDueAmount} due. So you cannot checkout`,
      //   };
      // }

      const checkoutRoom = booking_rooms.find((room) => room.room_id == roomID);

      if (!checkoutRoom) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Room not found by this booking ID',
        };
      }
      // room avaibility decrease
      await sub.updateRoomAvailabilityService({
        reservation_type: 'booked_room_decrease',
        rooms: [checkoutRoom],
        hotel_code,
      });

      // update booking rooms status
      await reservationModel.updateSingleBookingRoom(
        { status: 'checked_out', checked_out_at: new Date().toISOString() },
        { booking_id, room_id: checkoutRoom.room_id }
      );

      // check all booking rooms are check in or not
      const getSingleBookingRoom = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );

      if (getSingleBookingRoom) {
        const { booking_rooms } = getSingleBookingRoom;

        const isAllCheckout = booking_rooms.every(
          (room) => room.status === 'checked_out'
        );

        if (isAllCheckout) {
          // update main booking
          await reservationModel.updateRoomBooking(
            { status: 'checked_out' },
            hotel_code,
            booking_id
          );
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Successfully Cheked out',
      };
    });
  }

  public async updateReservationHoldStatus(req: Request) {
    return await this.db.transaction(async (trx) => {
      const hotel_code = req.hotel_admin.hotel_code;
      const booking_id = parseInt(req.params.id);

      const { status: reservation_type_status } = req.body;

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

      const { booking_type, status, booking_rooms, check_in, check_out } = data;

      if (booking_type != 'H' && status !== 'confirmed') {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'This booking has other status. So, you cannot changed',
        };
      }

      if (reservation_type_status == 'confirmed') {
        // update
        await this.Model.reservationModel().updateRoomBooking(
          {
            booking_type: 'B',
            status: 'confirmed',
          },
          hotel_code,
          booking_id
        );
        // Availability
        await sub.updateRoomAvailabilityService({
          reservation_type: 'hold_decrease',
          rooms: booking_rooms,
          hotel_code,
        });

        await sub.updateRoomAvailabilityService({
          reservation_type: 'booked_room_increase',
          rooms: booking_rooms,
          hotel_code,
        });

        // update room availability
      } else if (reservation_type_status == 'canceled') {
        // update
        await this.Model.reservationModel().updateRoomBooking(
          {
            booking_type: 'H',
            status: 'canceled',
          },
          hotel_code,
          booking_id
        );

        // Availability
        await sub.updateRoomAvailabilityService({
          reservation_type: 'hold_decrease',
          rooms: booking_rooms,
          hotel_code,
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Successfully updated',
      };
    });
  }

  public async getFoliosbySingleBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const invModel = this.Model.hotelInvoiceModel(trx);

      const data = await invModel.getFoliosbySingleBooking({
        hotel_code: req.hotel_admin.hotel_code,
        booking_id: parseInt(req.params.id),
      });

      const { total_credit, total_debit } =
        await invModel.getFolioEntriesCalculationByBookingID({
          hotel_code: req.hotel_admin.hotel_code,
          booking_id: parseInt(req.params.id),
        });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        total_credit,
        total_debit,
        data,
      };
    });
  }

  public async getFoliosWithEntriesbySingleBooking(req: Request) {
    const data =
      await this.Model.hotelInvoiceModel().getFoliosWithEntriesbySingleBooking({
        hotel_code: req.hotel_admin.hotel_code,
        booking_id: parseInt(req.params.id),
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getFolioEntriesbyFolioID(req: Request) {
    const data = await this.Model.hotelInvoiceModel().getFolioEntriesbyFolioID(
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
        payment_for: 'ADD MONEY',
        remarks,
        req,
        payment_date,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Payment has been added',
      };
    });
  }

  public async refundPaymentByFolioID(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { acc_id, amount, folio_id, payment_date, payment_type, remarks } =
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
      await sub.handlePaymentAndFolioForRefundPayment({
        acc_id,
        amount,
        folio_id,
        guest_id: checkSingleFolio.guest_id,
        payment_for: 'REFUND',
        remarks,
        req,
        payment_date,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Payment has been refunded',
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
        posting_type: 'Adjustment',
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
        posting_type: 'Charge',
        description: remarks,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async updateOrRemoveGuestFromRoom(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: booking_id, room_id } = req.params;
      const hotel_code = req.hotel_admin.hotel_code;

      const { add_guest, remove_guest } = req.body as {
        add_guest?: IGBGuestInfo[];
        remove_guest?: number[];
      };
      console.log(req.body);
      const reservationModel = this.Model.reservationModel();
      const guestModel = this.Model.guestModel(trx);

      const booking = await reservationModel.getSingleBooking(
        req.hotel_admin.hotel_code,
        parseInt(booking_id)
      );

      if (!booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Booking not found',
        };
      }

      const { booking_rooms } = booking;

      if (add_guest && add_guest.length) {
        const room = booking_rooms.find((r) => r.room_id === parseInt(room_id));

        if (!room) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'Room not found in this booking',
          };
        }

        const hasPrimaryGuest = room.room_guests.some(
          (g) => g.is_room_primary_guest
        );

        if (hasPrimaryGuest && add_guest.some((g) => g.is_room_primary_guest)) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'You cannot add more than one primary guest in a room',
          };
        }

        //check multiple guest has primary guest
        if (add_guest.filter((g) => g.is_room_primary_guest).length > 1) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'You cannot add more than one primary guest in a room',
          };
        }

        await Promise.all(
          add_guest.map(async (guest) => {
            const [guestRes] = await guestModel.createGuestForGroupBooking({
              first_name: guest.first_name,
              last_name: guest.last_name,
              email: guest.email,
              address: guest.address,
              country_id: guest.country_id,
              phone: guest.phone,
              passport_no: guest.passport_no,
              hotel_code,
            });

            await this.Model.reservationModel(trx).insertBookingRoomGuest({
              guest_id: guestRes.id,
              hotel_code,
              booking_room_id: room.id,
              is_room_primary_guest: guest.is_room_primary_guest,
            });
          })
        );
      }

      if (remove_guest && remove_guest.length) {
        const room = booking_rooms.find((r) => r.room_id === parseInt(room_id));

        if (!room) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'Room not found in this booking',
          };
        }

        const guestsToRemove = room.room_guests.filter((g) =>
          remove_guest.includes(g.guest_id)
        );

        if (!guestsToRemove.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'Guests not found in this room',
          };
        }

        await this.Model.reservationModel(trx).deleteBookingRoomGuest({
          booking_room_id: room.id,
          guest_ids: guestsToRemove.map((g) => g.guest_id),
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Successfully updated room guests',
      };
    });
  }
}
export default ReservationService;
