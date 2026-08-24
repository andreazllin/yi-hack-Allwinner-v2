import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { ptzMove } from "@/api";
import { assertCgiOk } from "@/lib/cgi";

// The directions the stock UI sends. `dir` reaches ipc_cmd unquoted and a `_`
// is executed as two sequential moves, so the diagonals are real firmware
// values, not a client-side composition of two calls.
export type PtzDirection =
	| "up"
	| "down"
	| "left"
	| "right"
	| "up_left"
	| "up_right"
	| "down_left"
	| "down_right";

export const DIRECTION_LABELS: Record<PtzDirection, string> = {
	up: "up",
	down: "down",
	left: "left",
	right: "right",
	up_left: "up and left",
	up_right: "up and right",
	down_left: "down and left",
	down_right: "down and right",
};

// ptz.sh is a MUTATING GET, so the generator emits only a queryOptions
// factory for it — the SDK function has to be wrapped by hand.
export function usePtzMove() {
	return useMutation({
		mutationFn: async (dir: PtzDirection) => {
			// Only `dir` is sent, exactly like the stock UI: action defaults to
			// `step` (move, then stop) and `time` to 0.3s. `time` is an
			// unbounded client-driven sleep on the camera — leave it alone.
			const response = await ptzMove({ query: { dir }, throwOnError: true });
			return assertCgiOk(response.data);
		},
		// No success toast: ptz.sh answers error=false whenever the query string
		// validates, even when nothing moved, so "moved" is a claim the response
		// cannot back. The preview image is the honest feedback.
		onError: (error, dir) => {
			notifications.show({
				title: "Move rejected",
				message: `The camera refused to move ${DIRECTION_LABELS[dir]}: ${error.message}`,
				color: "red",
			});
		},
	});
}
