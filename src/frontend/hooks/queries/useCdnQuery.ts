import { useQuery } from "@tanstack/react-query";
import { fetcher } from "itty-fetcher";
import { CDN_URL, type ImagesResponse } from "../../lib/constants";

const api = fetcher({ base: CDN_URL });

export const useImagesQuery = () => {
	return useQuery({
		queryKey: ["images"],
		queryFn: async () => {
			const res = await api.get<ImagesResponse>("/image");
			return res;
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchInterval: 1000 * 60 * 5, // 5 minutes
		enabled: true,
		retry: 1,
		refetchOnWindowFocus: false, // Don't refetch when window regains focus
		refetchOnMount: false, // Don't refetch when component mounts
		placeholderData: (previousData) => previousData,
	});
};
