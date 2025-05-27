export interface IcreateHallBody {
  name: string;
  hotel_code: number;
  capacity: string;
  size: number;
  rate_per_hour: number;
  location: string;
  hall_amenities?: string | null;
}

export interface IcreateHallPayload {
  name: string;
  hotel_code: number;
  capacity: string;
  location: string;
  hall_status: "available" | "booked" | "maintenance";
}

export interface IHallName {
  id: number;
  name: string;
}

export interface IHallImage {
  hotel_code: number;
  hall_id: number;
  photo: string;
}

export interface IHallAmenities {
  hall_id: number;
  amenity_id: number;
}

export interface IgetAllHall {
  id: number;
  hotel_code: number;
  name: string;
  rate_per_hour: number;
  halls?: number[];
  hall_status: "available" | "booked" | "maintenance";
}

export interface ICheckHallAmenities {
  hall_id: number;
  amenity_id: number;
}

export interface IupdateHallPayload {
  hotel_code?: number;
  name?: string;
  capacity?: string;
  location?: string;
  size?: number;
  rate_per_hour?: number;
  hall_amenities?: string;
  remove_amenities?: string;
  remove_photos?: string;
  hall_status?: "available" | "booked" | "maintenance";
}

// export interface IcreateHallBody {
//     name: string;
//     hotel_code:number;
//     capacity: string;
//     size: number;
//     rate_per_hour: number;
//     location: string;
//     hall_amenities?: string | null;
// }

// export interface IcreateHallPayload {
//     name: string;
//     hotel_code:number;
//     capacity: string;
//     location: string;
//     hall_status: "available" | "booked" | "maintenance";
// }

// export interface IHallName {
//     id: number;
//     name: string;
// }

// export interface IHallImage {
//     hotel_code: number;
//     hall_id: number;
//     photo: string;
// }

// export interface IHallAmenities {
//     hall_id: number;
//     amenity_id: number;
// }

// export interface IgetAllHall {
//     id:number;
//     hotel_code: number;
//     name: string;
//     rate_per_hour:number;
//     halls?: number[];
//     hall_status: "available" | "booked" | "maintenance";
// }

// export interface ICheckHallAmenities {
//     hall_id: number;
//     amenity_id: number;
// }

// export interface IupdateHallPayload {
//     hotel_code?:number;
//     name?: string;
//     capacity?: string;
//     location?: string;
//     size?: number;
//     rate_per_hour?: number;
//     hall_amenities?: string;
//     remove_amenities?: string;
//     remove_photos?: string;
//     hall_status?: "available" | "booked" | "maintenance";
// }
