export interface hotelSearchAvailabilityReqPayload {
  client_nationality: string;
  checkin: string;
  checkout: string;
  rooms: {
    adults: number;
    no_of_infants: number;
    children_ages: number[];
  }[];
}
