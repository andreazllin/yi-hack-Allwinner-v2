import { useQuery } from "@tanstack/react-query";
import { getConfigsOptions } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk, stripNullKey } from "@/lib/cgi";

// The persisted state of the camera. camera_settings.sh applies settings live
// but never writes camera.conf, so this file is the only record of what
// survives a reboot - it is what the form hydrates from and what a save has to
// leave in step with the hardware.
export function useCameraConf() {
	return useQuery({
		...getConfigsOptions({ query: { conf: "camera" } }),
		select: (data) => stripNullKey(assertCgiOk(data)),
	});
}
