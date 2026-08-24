import { useQuery } from "@tanstack/react-query";
import { getLinksOptions } from "@/api/@tanstack/react-query.gen";

export function useLinks() {
	return useQuery(getLinksOptions());
}
