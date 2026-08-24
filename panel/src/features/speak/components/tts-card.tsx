import {
	Button,
	Card,
	Group,
	Select,
	Stack,
	Text,
	Textarea,
	Title,
} from "@mantine/core";
import { SpeakerHigh } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import type { FunctionComponent } from "react";
import { VolumeSlider } from "@/features/speak/components/volume-slider";
import {
	DEFAULT_TTS_LANGUAGE,
	DEFAULT_VOLUME_DB,
	TTS_LANGUAGES,
	type TtsLanguage,
} from "@/features/speak/constants/audio";
import {
	type TtsFormValues,
	ttsSchema,
} from "@/features/speak/helpers/tts-schema";
import { useSpeakText } from "@/features/speak/hooks/use-speak-text";

const DEFAULT_VALUES: TtsFormValues = {
	text: "",
	lang: DEFAULT_TTS_LANGUAGE,
	voldb: DEFAULT_VOLUME_DB,
};

export const TtsCard: FunctionComponent = () => {
	const speak = useSpeakText();
	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onChange: ttsSchema },
		// mutate, not mutateAsync: handleSubmit rethrows whatever onSubmit
		// throws, and a rejected CGI call is already reported by the hook's
		// error toast — rethrowing it would only surface as an unhandled
		// rejection.
		onSubmit: ({ value }) => {
			speak.mutate({
				// The text is the raw POST body, not a query param; lang and
				// voldb are the only two query params speak.sh parses.
				body: value.text,
				query: { lang: value.lang, voldb: String(value.voldb) },
			});
		},
	});

	return (
		<Card withBorder>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					void form.handleSubmit();
				}}
			>
				<Stack gap="md">
					<Stack gap={4}>
						<Title order={4}>Text to speech</Title>
						<Text size="sm" c="dimmed">
							The camera synthesises the text with nanotts and plays it through
							its speaker. Only the first line is spoken, and the chosen
							language pack has to be installed on the camera.
						</Text>
					</Stack>

					<form.Field name="text">
						{(field) => (
							<Textarea
								label="Text"
								placeholder="Someone is at the front door"
								autosize
								minRows={2}
								maxRows={4}
								value={field.state.value}
								error={field.state.meta.errors[0]?.message}
								onBlur={field.handleBlur}
								onChange={(event) =>
									field.handleChange(event.currentTarget.value)
								}
							/>
						)}
					</form.Field>

					<Group grow align="flex-start">
						<form.Field name="lang">
							{(field) => (
								<Select<TtsLanguage>
									label="Language"
									description="Five-character codes only — the firmware refuses anything else."
									data={[...TTS_LANGUAGES]}
									value={field.state.value}
									allowDeselect={false}
									error={field.state.meta.errors[0]?.message}
									onChange={(value) => {
										if (value !== null) {
											field.handleChange(value);
										}
									}}
								/>
							)}
						</form.Field>
						<form.Field name="voldb">
							{(field) => (
								<VolumeSlider
									value={field.state.value}
									onChange={field.handleChange}
								/>
							)}
						</form.Field>
					</Group>

					<Group justify="flex-end">
						<form.Subscribe
							selector={(state) =>
								state.canSubmit && state.values.text.length > 0
							}
						>
							{(canSend) => (
								<Button
									type="submit"
									leftSection={<SpeakerHigh size={16} />}
									loading={speak.isPending}
									disabled={!canSend}
								>
									Speak
								</Button>
							)}
						</form.Subscribe>
					</Group>
				</Stack>
			</form>
		</Card>
	);
};
