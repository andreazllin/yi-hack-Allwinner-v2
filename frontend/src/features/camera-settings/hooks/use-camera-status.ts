import { useQuery } from "@tanstack/react-query";
import { getStatusOptions } from "@/api/@tanstack/react-query.gen";

// Only status.json knows whether the camera has a pan/tilt motor: it matches
// the model suffix against an allowlist and reports ptz=yes|no, which is the
// same test the stock page runs by hand. Read once per visit - no interval,
// the stock camera_settings page fetches it exactly once too.
export function useCameraStatus() {
	return useQuery(getStatusOptions());
}
