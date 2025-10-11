import {} from "";

import {
	IAdmin,
	IGBtocUser,
	IWebToken,
	IhAdmin,
} from "./src/common/types/commontypes";

declare global {
	namespace Express {
		interface Request {
			admin: IAdmin;
			hotel_admin: IhAdmin;
			btoc_user: IGBtocUser;
			restaurant_admin: IrestaurantUser;
			web_token: IWebToken;
			upFiles: string[];
		}
	}
}
