import {} from "";
import {
  IAdmin,
  IWebToken,
  IhAdmin,
  IhotelUser,
  IrestUser,
} from "./src/common/types/commontypes";

declare global {
  namespace Express {
    interface Request {
      admin: IAdmin;
      hotel_admin: IhAdmin;
      hotel_user: IhotelUser;
      rest_user: IrestUser;
      web_token: IWebToken;
      upFiles: string[];
    }
  }
}
