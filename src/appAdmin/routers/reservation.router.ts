import { Router } from 'express';
import AuthChecker from '../../common/middleware/authChecker/authChecker';
import { ReservationController } from './../controllers/reservation.controller';

export class ReservationRouter {
  public router = Router();
  public authChecker = new AuthChecker();
  private controller = new ReservationController();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/calendar').get(this.controller.calendar);

    this.router
      .route('/room-type/availability/search')
      .get(this.controller.getAllAvailableRoomsTypeWithAvailableRoomCount);

    this.router
      .route('/room-type/by/availabity-room-count')
      .get(this.controller.getAllAvailableRoomsTypeForEachDateAvailableRoom);

    this.router
      .route('/available-room/by/room-type/:id')
      .get(this.controller.getAllAvailableRoomsByRoomType);

    this.router
      .route('/booking')
      .post(this.controller.createBooking)
      .get(this.controller.getAllBooking);

    this.router.route('/booking/:id').get(this.controller.getSingleBooking);

    this.router
      .route('/folios-by/booking_id/:id')
      .get(this.controller.getFoliosbySingleBooking);

    this.router
      .route('/folio-entries/by/folio-id/:id')
      .get(this.controller.getFolioEntriesbyFolioID);

    this.router.route('/add-payment').post(this.controller.addPaymentByFolioID);

    this.router
      .route('/refund-payment')
      .post(this.controller.refundPaymentByFolioID);

    this.router.route('/checkin/by/booking/:id').patch(this.controller.checkIn);

    this.router
      .route('/checkout/by/booking/:id')
      .patch(this.controller.checkOut);

    this.router
      .route('/reservation-type/by/booking/:id')
      .patch(this.controller.updateReservationHoldStatus);
  }
}
