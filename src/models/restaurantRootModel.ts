import { Knex } from "knex";
import { BtocReservationModel } from "./reservationPanel/BtocModel/btoc.reservation.model";

export class RestaurantModels {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  //   public btocReservationModel(trx?: Knex.Transaction) {
  //     return new BtocReservationModel(trx || this.db);
  //   }
}
