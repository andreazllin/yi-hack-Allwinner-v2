import { z } from "zod";
import {
	TTS_LANGUAGES,
	VOLUME_MAX_DB,
	VOLUME_MIN_DB,
} from "@/features/speak/constants/audio";

// The text travels as the raw POST body, which the firmware does NOT
// validate — but speak.sh reads it with `read -r` (first line only) and
// splices it back into its JSON reply with a bare printf, so a double quote
// or a backslash produces a malformed response that axios hands over as
// plain text. Both are rejected here; ordinary punctuation is fine.
export const ttsSchema = z.object({
	text: z
		.string()
		.min(1, "Enter the text the camera should say.")
		.refine(
			(value) => !/["\\]/.test(value),
			"Double quotes and backslashes corrupt the camera's reply — remove them.",
		)
		.refine(
			(value) => !value.includes("\n"),
			"The camera speaks the first line only — remove the line breaks.",
		),
	lang: z.enum(TTS_LANGUAGES),
	voldb: z.number().min(VOLUME_MIN_DB).max(VOLUME_MAX_DB),
});

export type TtsFormValues = z.infer<typeof ttsSchema>;
