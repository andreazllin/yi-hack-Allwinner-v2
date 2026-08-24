import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { type Options, type SpeakTextData, speakText } from "@/api";
import { speakTextMutation } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk } from "@/lib/cgi";

export function useSpeakText() {
	return useMutation({
		...speakTextMutation(),
		// The generated mutationFn resolves on logical failures too (every CGI
		// error is HTTP 200), so the checking happens here.
		mutationFn: async (options: Options<SpeakTextData>) => {
			const response = await speakText({ ...options, throwOnError: true });
			const data = response.data;
			// speak.sh echoes the spoken text into its reply unescaped, so an
			// unbalanced quote makes the body unparseable and axios hands over
			// the raw text instead of an object.
			if (typeof data !== "object") {
				throw new Error(
					"The camera replied with malformed JSON. Remove quotes and backslashes from the text.",
				);
			}
			if (data.error === "true" && data.description) {
				// The real reason: "Speaker busy", "TTS engine not found",
				// "Audio input disabled", "Invalid language", "Invalid volume (dB)".
				throw new Error(data.description);
			}
			return assertCgiOk(data);
		},
		onSuccess: (_data, options) => {
			notifications.show({
				title: "Speaking now",
				message: `The camera is saying: ${options.body}`,
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not speak the text",
				message: error.message,
				color: "red",
			});
		},
	});
}
