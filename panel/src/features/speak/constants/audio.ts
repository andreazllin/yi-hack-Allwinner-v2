// The stock UI's language list. Every code is exactly five characters, which
// is what speak.sh's validateLang requires (5 chars from [A-Za-z-], so `en`
// and `en_US` are both refused).
export const TTS_LANGUAGES = [
	"en-US",
	"en-GB",
	"de-DE",
	"es-ES",
	"fr-FR",
	"it-IT",
] as const;

export type TtsLanguage = (typeof TTS_LANGUAGES)[number];

export const DEFAULT_TTS_LANGUAGE: TtsLanguage = "en-US";

// voldb is only charset-validated by the firmware (validateNumber, no range).
// These bounds are the stock UI's own choices: +12dB..-12dB in 2dB steps.
export const VOLUME_MIN_DB = -12;
export const VOLUME_MAX_DB = 12;
export const VOLUME_STEP_DB = 2;
export const DEFAULT_VOLUME_DB = 0;

// speaker.sh compares CONTENT_LENGTH against this and answers
// "File is too big" above it (about 16 s of 16 kHz mono PCM).
export const MAX_AUDIO_BYTES = 512_000;
