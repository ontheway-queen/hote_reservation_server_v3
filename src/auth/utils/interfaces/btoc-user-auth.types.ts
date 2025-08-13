export type btocUserTokenPayload = {
	user_id: number;
	name: string;
	email: string;
	phone?: string | null;
	status: "active" | "inactive" | "banned";
	date_of_birth?: string | null;
	gender?: "male" | "female" | "other";
	type: "user";
};
