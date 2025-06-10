import { fetcher } from "itty-fetcher";
import type { Cast, User } from "../../shared/types";

const shimApi = fetcher({ base: "https://shim.artlu.xyz" });

export const getHydratedUser = async (
	fid: number,
): Promise<{ user: User } | undefined> => {
	const res = await shimApi.get<{ user: User }>(`/user/${fid}`);
	return res;
};

export const getHydratedCast = async (
	fid: number,
	castHash: `0x${string}`,
): Promise<{ cast: Cast } | undefined> => {
	const res = await shimApi.get<{ cast: Cast }>(`/i/${fid}/${castHash}`);
	return res;
};

export const getHydratedCastByUsernameShortHash = async (
	username: string,
	shortHash: `0x${string}`,
): Promise<{ cast: Cast } | undefined> => {
	const res = await shimApi.get<{ cast: Cast }>(`/wc/${username}/${shortHash}`);
	return res;
};
