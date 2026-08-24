import {
	Button,
	Card,
	FileInput,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { FileAudio, Play } from "@phosphor-icons/react";
import { type FunctionComponent, useState } from "react";
import { VolumeSlider } from "@/features/speak/components/volume-slider";
import {
	DEFAULT_VOLUME_DB,
	MAX_AUDIO_BYTES,
} from "@/features/speak/constants/audio";
import { usePlayAudio } from "@/features/speak/hooks/use-play-audio";

export const AudioCard: FunctionComponent = () => {
	const play = usePlayAudio();
	const [file, setFile] = useState<File | null>(null);
	const [voldb, setVoldb] = useState(DEFAULT_VOLUME_DB);

	// The cap is checked before upload so a clip that the camera would answer
	// "File is too big" to never crosses the wire.
	const tooBig = file !== null && file.size > MAX_AUDIO_BYTES;

	return (
		<Card withBorder>
			<Stack gap="md">
				<Stack gap={4}>
					<Title order={4}>Play an audio clip</Title>
					<Text size="sm" c="dimmed">
						{`The clip goes straight to the speaker, so it has to be PCM S16LE, 16 kHz, mono — anything else plays as noise. The camera accepts at most ${MAX_AUDIO_BYTES.toLocaleString("en-US")} bytes, about 16 seconds.`}
					</Text>
				</Stack>

				<FileInput
					label="WAV file"
					placeholder="Choose a .wav file"
					accept=".wav,audio/wav,audio/x-wav"
					clearable
					leftSection={<FileAudio size={16} />}
					value={file}
					error={
						tooBig
							? `That file is ${file.size.toLocaleString("en-US")} bytes, over the ${MAX_AUDIO_BYTES.toLocaleString("en-US")} byte limit. Shorten the clip.`
							: null
					}
					onChange={setFile}
				/>

				<VolumeSlider value={voldb} onChange={setVoldb} />

				<Group justify="flex-end">
					<Button
						leftSection={<Play size={16} />}
						loading={play.isPending}
						disabled={file === null || tooBig}
						onClick={() => {
							if (file === null) {
								return;
							}
							// voldb has to be the only query param: speaker.sh parses
							// the first one and ignores the rest.
							play.mutate({
								body: { file },
								query: { voldb: String(voldb) },
							});
						}}
					>
						Play
					</Button>
				</Group>
			</Stack>
		</Card>
	);
};
