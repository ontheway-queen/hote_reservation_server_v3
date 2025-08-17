import {} from "";
import {
	IAdmin,
	IBtocUser,
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
			btoc_user: IBtocUser;
			rest_user: IrestUser;
			web_token: IWebToken;
			upFiles: string[];
		}
	}
}
