import {} from "";

import {
	IAdmin,
	IGBtocUser,
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
			btoc_user: IGBtocUser;
			rest_user: IrestUser;
			web_token: IWebToken;
			upFiles: string[];
		}
	}
}
