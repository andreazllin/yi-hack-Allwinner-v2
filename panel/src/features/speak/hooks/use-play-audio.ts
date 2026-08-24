import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { type Options, type PlayAudioData, playAudio } from "@/api";
import { playAudioMutation } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk } from "@/lib/cgi";

export function usePlayAudio() {
	return useMutation({
		...playAudioMutation(),
		// The generated mutationFn resolves on logical failures too (every CGI
		// error is HTTP 200), so the checking happens here.
		mutationFn: async (options: Options<PlayAudioData>) => {
			const response = await playAudio({ ...options, throwOnError: true });
			const data = response.data;
			if (data.error === "true" && data.description) {
				// The real reason: "File is too big", "Audio input is not
				// available", "Invalid volume (dB)".
				throw new Error(data.description);
			}
			return assertCgiOk(data);
		},
		onSuccess: () => {
			notifications.show({
				title: "Clip sent to the speaker",
				message:
					"The camera accepted the clip. With an SD card it answers before playback finishes, so listen for it.",
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not play the clip",
				message: error.message,
				color: "red",
			});
		},
	});
}
