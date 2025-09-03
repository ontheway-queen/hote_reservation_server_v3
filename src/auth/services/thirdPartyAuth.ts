import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import config from "../../config/config";
import CustomError from "../../utils/lib/customEror";

class ThirdPartyAuth {
	private client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

	public async verifyGoogleAccessToken(access_token: string): Promise<any> {
		try {
			const tokenInfo = await this.client.getTokenInfo(access_token);
			const userInfoRes = await axios.get(
				"https://www.googleapis.com/oauth2/v3/userinfo",
				{
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				}
			);

			const profile = userInfoRes.data;

			return {
				...tokenInfo,
				...profile,
			};
		} catch (error: any) {
			console.error("Access token verification failed:", error.message);
			throw new CustomError("Invalid access token", 401);
		}
	}
}

export default ThirdPartyAuth;
