import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IinsertFolioEntriesPayload } from "../utlis/interfaces/invoice.interface";
import {
  BookingRoom,
  IaddRoomInReservationRequestBody,
  IBookingDetails,
  IchangedRateOfARoomInReservationRequestBody,
  IGBGuestInfo,
  IUpdateReservationRequestBody,
  IupdateRoomAndRateOfReservationRequestBody,
} from "../utlis/interfaces/reservation.interface";
import { HelperFunction } from "../utlis/library/helperFunction";
import { SubReservationService } from "./subreservation.service";
import { SubDerivedReservationService } from "./subDerived.reservation.service";

export class ReservationService2 extends AbstractServices {
  constructor() {
    super();
  }

  public async updateOrRemoveGuestFromRoom(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: booking_id, room_id } = req.params;
      const hotel_code = req.hotel_admin.hotel_code;

      const { add_guest, remove_guest } = req.body as {
        add_guest?: IGBGuestInfo[];
        remove_guest?: number[];
      };

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
          message: "Booking not found",
        };
      }

      const { booking_rooms } = booking;

      if (add_guest && add_guest.length) {
        const room = booking_rooms.find((r) => r.room_id === parseInt(room_id));

        if (!room) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Room not found in this booking",
          };
        }

        const hasPrimaryGuest = room.room_guests.some(
          (g) => g.is_room_primary_guest
        );

        if (hasPrimaryGuest && add_guest.some((g) => g.is_room_primary_guest)) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: "You cannot add more than one primary guest in a room",
          };
        }

        //check multiple guest has primary guest
        if (add_guest.filter((g) => g.is_room_primary_guest).length > 1) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: "You cannot add more than one primary guest in a room",
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
            message: "Room not found in this booking",
          };
        }

        const guestsToRemove = room.room_guests.filter((g) =>
          remove_guest.includes(g.guest_id)
        );

        if (!guestsToRemove.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Guests not found in this room",
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
        message: "Successfully updated room guests",
      };
    });
  }

  public async updateRoomAndRateOfReservation(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const body = req.body as IupdateRoomAndRateOfReservationRequestBody;
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

      const hotelModel = this.Model.HotelModel(trx);

      const heads = await hotelModel.getHotelAccConfig(hotel_code, [
        "RECEIVABLE_HEAD_ID",
        "HOTEL_REVENUE_HEAD_ID",
      ]);

      const receivable_head = heads.find(
        (h) => h.config === "RECEIVABLE_HEAD_ID"
      );

      if (!receivable_head) {
        throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
      }

      const sales_head = heads.find(
        (h) => h.config === "HOTEL_REVENUE_HEAD_ID"
      );

      if (!sales_head) {
        throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
      }

      const accountModel = this.Model.accountModel(trx);
      const today = new Date().toISOString().split("T")[0];

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

          // const entryIDs =
          //   roomFolio.folio_entries?.map((e) => e.entries_id) ?? [];
          let prevRoomAmount = 0;
          const folioEntryIDs = roomFolio.folio_entries
            .filter((fe) => {
              if (
                fe.posting_type == "ROOM_CHARGE" ||
                fe.posting_type == "VAT" ||
                fe.posting_type == "SERVICE_CHARGE"
              ) {
                prevRoomAmount += Number(fe.debit);
                return fe;
              }
            })
            .map((fe) => fe.entries_id);

          console.log({ folioEntryIDs });

          if (folioEntryIDs.length) {
            await hotelInvModel.updateFolioEntries(
              { is_void: true },
              folioEntryIDs
            );
          }

          const nights = sub.calculateNights(room.check_in, room.check_out);

          await reservationModel.updateSingleBookingRoom(
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
              description: "Room Tariff",
              posting_type: "ROOM_CHARGE",
              debit: tariff,
              credit: 0,
              date,
              room_id: room.room_id,
              rack_rate: room.base_rate,
            });

            if (vat > 0) {
              newEntries.push({
                folio_id: roomFolio.id,
                description: "VAT",
                posting_type: "VAT",
                debit: vat,
                credit: 0,
                date,
              });
            }
            if (sc > 0) {
              newEntries.push({
                folio_id: roomFolio.id,
                description: "Service Charge",
                posting_type: "SERVICE_CHARGE",
                debit: sc,
                credit: 0,
                date,
              });
            }
          }

          // insert new folio entries
          let newTotalAmount = newEntries.reduce(
            (ac, cu) => ac + Number(cu?.debit ?? 0),
            0
          );

          if (newEntries.length) {
            await hotelInvModel.insertInFolioEntries(newEntries);
          }

          //------------------ Accounting ------------------//

          const difference = Math.abs(newTotalAmount - prevRoomAmount);
          const isIncrease = newTotalAmount > prevRoomAmount;
          const actionText = isIncrease ? "Increased rate" : "Decreased rate";

          const receivableEntry = {
            acc_head_id: receivable_head.head_id,
            created_by: admin_id,
            debit: isIncrease ? difference : 0,
            credit: isIncrease ? 0 : difference,
            description: `Receivable for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
            voucher_date: today,
            voucher_no: booking.voucher_no,
            hotel_code,
          };

          const salesEntry = {
            acc_head_id: sales_head.head_id,
            created_by: admin_id,
            debit: isIncrease ? 0 : difference,
            credit: isIncrease ? difference : 0,
            description: `Sales for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
            voucher_date: today,
            voucher_no: booking.voucher_no,
            hotel_code,
          };

          await accountModel.insertAccVoucher([receivableEntry, salesEntry]);
        }
      }

      if (Array.isArray(body.removed_rooms) && body.removed_rooms.length) {
        const removedIDs = [...new Set(body.removed_rooms)];

        const roomsBeingRemoved = booking_rooms.filter((br) =>
          removedIDs.includes(br.room_id)
        );

        console.log({ removedIDs });

        const bookingRoomIds = roomsBeingRemoved.map((br) => br.id);
        // delete booking room guest
        const res = await reservationModel.deleteBookingRoomGuest({
          booking_room_ids: bookingRoomIds,
        });

        console.log({ res });

        // delete booking rooms
        await reservationModel.deleteBookingRooms(removedIDs, booking_id);

        await sub.updateRoomAvailabilityService({
          reservation_type: "booked_room_decrease",
          rooms: roomsBeingRemoved,
          hotel_code,
        });

        const roomFolios =
          await hotelInvModel.getFolioWithEntriesbySingleBookingAndRoomID({
            hotel_code,
            booking_id,
            room_ids: removedIDs,
          });

        // const allEntryIDs = roomFolios.flatMap(
        //   (f) => f?.folio_entries?.map((e) => e.entries_id) ?? []
        // );

        let total_debit_amount = 0;
        let total_credit_amount = 0;

        const folioEntryIDs = roomFolios.flatMap((f) =>
          f.folio_entries
            .filter((fe) => {
              total_credit_amount += Number(fe.credit ?? 0);
              total_debit_amount += Number(fe.debit ?? 0);
              return fe;
            })
            .map((fe) => fe.entries_id)
        );

        const allFolioIDs: number[] = roomFolios
          .filter((f) => !f?.is_void)
          .map((f) => f.id);

        if (folioEntryIDs.length) {
          await hotelInvModel.updateFolioEntries(
            { is_void: true },
            folioEntryIDs
          );
        }
        if (allFolioIDs.length) {
          await hotelInvModel.updateSingleFolio(
            { is_void: true },
            { folioIds: allFolioIDs, booking_id, hotel_code }
          );
        }

        await accountModel.insertAccVoucher([
          {
            acc_head_id: receivable_head.head_id,
            created_by: admin_id,
            debit: 0,
            credit: total_debit_amount - total_credit_amount,
            description: `Receivable for remove room. Booking Ref ${booking.booking_reference}`,
            voucher_date: today,
            voucher_no: booking.voucher_no,
            hotel_code,
          },
          {
            acc_head_id: sales_head.head_id,
            created_by: admin_id,
            debit: total_debit_amount - total_credit_amount,
            credit: 0,
            description: `Sale for remove room. Booking Ref ${booking.booking_reference}`,
            voucher_date: today,
            voucher_no: booking.voucher_no,
            hotel_code,
          },
        ]);
      }

      /***********************************************************************
       * ADD NEW ROOMS
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
          "booked",
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
          type: "room_primary",
          guest_id,
          folio_number,
          status: "open",
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
              description: "Room Tariff",
              posting_type: "ROOM_CHARGE",
              debit: tariff,
              credit: 0,
              date,
              room_id: br.room_id,
            },
            {
              folio_id: roomFolio.id,
              description: "VAT",
              posting_type: "VAT",
              debit: vat,
              credit: 0,
              date,
            },
            {
              folio_id: roomFolio.id,
              description: "Service Charge",
              posting_type: "SERVICE_CHARGE",
              debit: sc,
              credit: 0,
              date,
            }
          );
        }
        await hotelInvModel.insertInFolioEntries(entries);

        const newTotalAmount = entries.reduce(
          (acc, cu) => acc + Number(cu.debit),
          0
        );

        // acc voucher
        await accountModel.insertAccVoucher([
          {
            acc_head_id: receivable_head.head_id,
            created_by: admin_id,
            debit: newTotalAmount,
            credit: 0,
            description: `Receivable for add new room in reservation. Booking Ref ${booking.booking_reference}`,
            voucher_date: today,
            voucher_no: booking.voucher_no,
            hotel_code,
          },
          {
            acc_head_id: sales_head.head_id,
            created_by: admin_id,
            debit: 0,
            credit: newTotalAmount,
            description: `Sales for add new room in reservation. Booking Ref ${booking.booking_reference}`,
            voucher_date: today,
            voucher_no: booking.voucher_no,
            hotel_code,
          },
        ]);
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
        message: "Group reservation updated",
      };
    });
  }

  public async updateSingleReservation(req: Request) {
    return this.db.transaction(async (trx) => {
      const { source_id } = req.body as IUpdateReservationRequestBody;

      const booking_id = Number(req.params.id);
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
          message: "Booking not found",
        };
      }

      if (source_id) {
        const source = await this.Model.settingModel().getSingleSource({
          id: source_id,
        });

        if (!source) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Source not found",
          };
        }
      }

      await reservationModel.updateRoomBooking(
        { ...req.body, source_id },
        hotel_code,
        booking_id
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Single reservation updated",
      };
    });
  }

  public async changeDatesOfBooking(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { check_in, check_out } = req.body as {
        check_in: string;
        check_out: string;
      };

      const reservationModel = this.Model.reservationModel(trx);
      const invoiceModel = this.Model.hotelInvoiceModel(trx);
      const subDerived = new SubDerivedReservationService(trx);

      const booking = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );
      if (!booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Booking not found",
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
          message: "You have requested the previous date range.",
        };
      }

      const nights = HelperFunction.calculateNights(check_in, check_out);
      if (nights <= 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Invalid check‑in / check‑out date combination.",
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

      const primaryFolio = await invoiceModel.getFoliosbySingleBooking({
        booking_id,
        hotel_code,
        type: "Primary",
      });

      if (!primaryFolio.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Primary folio not found",
        };
      }
      const folioEntries: IinsertFolioEntriesPayload[] = [];

      if (booking.is_individual_booking) {
        await subDerived.changeDateOfBookingForIndividual({
          booking,
          nights,
          booking_id,
          booking_rooms,
          check_in,
          check_out,
          primaryFolio,
          req,
          service_charge_percentage,
          vat_percentage,
        });
      } else {
        await subDerived.changeDateOfBookingForGroupReservation({
          booking,
          nights,
          booking_id,
          booking_rooms,
          check_in,
          check_out,
          primaryFolio,
          req,
          service_charge_percentage,
          vat_percentage,
        });
      }

      const { total_debit } =
        await invoiceModel.getFolioEntriesCalculationByBookingID({
          hotel_code,
          booking_id,
        });

      await reservationModel.updateRoomBooking(
        {
          total_amount: total_debit,
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
        message: "Reservation dates modified successfully.",
      };
    });
  }

  public async changeRoomOfAReservation(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { new_room_id, previous_room_id, base_rate, changed_rate } =
        req.body as {
          previous_room_id: number;
          new_room_id: number;
          base_rate: number;
          changed_rate: number;
        };

      const reservationModel = this.Model.reservationModel(trx);
      const invoiceModel = this.Model.hotelInvoiceModel(trx);
      const subDerived = new SubDerivedReservationService(trx);

      const booking = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );

      if (!booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Booking not found",
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
          message: "You have given an invalid room that you want to change",
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
          message: "New Room not found",
        };
      }

      const { room_type_id: new_rooms_rm_type_id } = checkNewRoom[0];

      const availableRoomList =
        await reservationModel.getAllAvailableRoomsByRoomType({
          hotel_code,
          check_in: previouseRoom.check_in,
          check_out: previouseRoom.check_out,
          room_type_id: new_rooms_rm_type_id,
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

      const nights = HelperFunction.calculateNights(
        previouseRoom.check_in,
        previouseRoom.check_out
      );

      if (booking.is_individual_booking) {
        await subDerived.changeRoomOfAIndividualReservation({
          body: req.body,
          booking,
          booking_id,
          new_rooms_rm_type_id,
          nights,
          previouseRoom,
          req,
        });
      } else {
        await subDerived.changeRoomOfAGroupReservation({
          body: req.body,
          booking,
          booking_id,
          new_rooms_rm_type_id,
          nights,
          previouseRoom,
          req,
          checkNewRoom,
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Successfully Room has been shifted",
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
          message: "Booking not found",
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
        message: "Successfully Updated",
      };
    });
  }

  public async individualRoomDatesChangeOfBooking(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { hotel_code, id: admin_id } = req.hotel_admin;

      const { check_in, check_out, room_id } = req.body as {
        check_in: string;
        check_out: string;
        room_id: number;
      };

      const reservationModel = this.Model.reservationModel(trx);
      const invoiceModel = this.Model.hotelInvoiceModel(trx);
      const subDerived = new SubDerivedReservationService(trx);

      const booking = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );

      if (!booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Booking not found",
        };
      }

      const { vat_percentage, service_charge_percentage } = booking;

      const bookingRoom = (await reservationModel.getSingleBookingRoom({
        booking_id,
        room_id,
      })) as BookingRoom | undefined;

      if (!bookingRoom) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Room not found.",
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
          message: "You submitted the same date range.",
        };
      }

      const nights = HelperFunction.calculateNights(check_in, check_out);
      if (nights <= 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Invalid check‑in / check‑out dates.",
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

      console.log({ booking });
      if (booking.is_individual_booking) {
        await subDerived.individualRoomDatesChangeOfBookingForIndividual({
          booking,
          booking_id,
          bookingRoom,
          check_in,
          check_out,
          nights,
          req,
          room_id,
          service_charge_percentage,
          vat_percentage,
        });
      } else {
        await subDerived.individualRoomDatesChangeOfBookingForGroup({
          booking,
          booking_id,
          bookingRoom,
          check_in,
          check_out,
          nights,
          req,
          room_id,
          service_charge_percentage,
          vat_percentage,
        });
      }

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
        message: "Room dates updated successfully.",
      };
    });
  }

  public async changedRateOfARoomInReservation(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const body = req.body as IchangedRateOfARoomInReservationRequestBody;
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

      const hotelModel = this.Model.HotelModel(trx);

      const heads = await hotelModel.getHotelAccConfig(hotel_code, [
        "RECEIVABLE_HEAD_ID",
        "HOTEL_REVENUE_HEAD_ID",
      ]);

      const receivable_head = heads.find(
        (h) => h.config === "RECEIVABLE_HEAD_ID"
      );

      if (!receivable_head) {
        throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
      }

      const sales_head = heads.find(
        (h) => h.config === "HOTEL_REVENUE_HEAD_ID"
      );

      if (!sales_head) {
        throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
      }

      const accountModel = this.Model.accountModel(trx);
      const today = new Date().toISOString().split("T")[0];

      const {
        vat_percentage: bookingVatPct = 0,
        service_charge_percentage: bookingScPct = 0,
        booking_rooms,
        guest_id,
      } = booking as IBookingDetails;

      if (booking.is_individual_booking) {
        await sub.changeRateForRoomInvidiualReservation({
          body: req.body,
          booking_id,
          booking,
          bookingScPct,
          bookingVatPct,
          receivable_head,
          req,
          sales_head,
        });
      } else {
        await sub.changeRateForRoomInGroupReservation({
          body: req.body,
          booking_id,
          booking,
          bookingScPct,
          bookingVatPct,
          receivable_head,
          req,
          sales_head,
        });
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
        message: "Group reservation updated",
      };
    });
  }

  public async addRoomInReservation(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const body = req.body as IaddRoomInReservationRequestBody;
      const reservationModel = this.Model.reservationModel(trx);
      const hotelInvModel = this.Model.hotelInvoiceModel(trx);

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

      const hotelModel = this.Model.HotelModel(trx);

      const heads = await hotelModel.getHotelAccConfig(hotel_code, [
        "RECEIVABLE_HEAD_ID",
        "HOTEL_REVENUE_HEAD_ID",
      ]);

      const receivable_head = heads.find(
        (h) => h.config === "RECEIVABLE_HEAD_ID"
      );

      if (!receivable_head) {
        throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
      }

      const sales_head = heads.find(
        (h) => h.config === "HOTEL_REVENUE_HEAD_ID"
      );

      if (!sales_head) {
        throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
      }

      const accountModel = this.Model.accountModel(trx);
      const today = new Date().toISOString().split("T")[0];

      const {
        vat_percentage: bookingVatPct = 0,
        service_charge_percentage: bookingScPct = 0,
        booking_rooms,
        guest_id,
      } = booking as IBookingDetails;

      if (booking.is_individual_booking) {
        await sub.addRoomInIndividualReservation({
          body,
          booking_id,
          bookingScPct,
          bookingVatPct,
          booking,
          receivable_head,
          req,
          sales_head,
        });
      } else {
        await sub.addRoomInGroupReservation({
          body,
          booking_id,
          bookingScPct,
          bookingVatPct,
          booking,
          receivable_head,
          req,
          sales_head,
          guest_id,
        });
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
        message: "Group reservation updated",
      };
    });
  }

  public async deleteRoomInReservation(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const body = req.body as {
        removed_rooms: number[];
      };
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

      const hotelModel = this.Model.HotelModel(trx);

      const heads = await hotelModel.getHotelAccConfig(hotel_code, [
        "RECEIVABLE_HEAD_ID",
        "HOTEL_REVENUE_HEAD_ID",
      ]);

      const receivable_head = heads.find(
        (h) => h.config === "RECEIVABLE_HEAD_ID"
      );

      if (!receivable_head) {
        throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
      }

      const sales_head = heads.find(
        (h) => h.config === "HOTEL_REVENUE_HEAD_ID"
      );

      if (!sales_head) {
        throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
      }

      const accountModel = this.Model.accountModel(trx);
      const today = new Date().toISOString().split("T")[0];

      const {
        vat_percentage: bookingVatPct = 0,
        service_charge_percentage: bookingScPct = 0,
        booking_rooms,
        guest_id,
      } = booking as IBookingDetails;

      if (booking.is_individual_booking) {
        await sub.deleteRoomInIndividualReservation({
          body,
          booking_id,
          bookingScPct,
          bookingVatPct,
          booking,
          receivable_head,
          req,
          sales_head,
        });
      } else {
        await sub.deleteRoomInGroupReservation({
          body,
          booking_id,
          bookingScPct,
          bookingVatPct,
          booking,
          receivable_head,
          req,
          sales_head,
        });
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
        message: "Group reservation updated",
      };
    });
  }
}
