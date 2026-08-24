import { useQuery } from "@tanstack/react-query";
import { getStatusOptions } from "@/api/@tanstack/react-query.gen";

// One read per page open and no interval: this page only needs the ESSID the
// camera is currently associated with, and every /cgi-bin hit forks a shell.
// status.json carries no error field, so there is nothing for assertCgiOk here.
export function useCameraStatus() {
	return useQuery(getStatusOptions());
}
