import { SimpleGrid, Stack, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { AudioCard } from "@/features/speak/components/audio-card";
import { TtsCard } from "@/features/speak/components/tts-card";

const SpeakPage: FunctionComponent = () => (
	<Stack gap="md">
		<Title order={2}>Speak</Title>
		{/* Nothing to load: both actions are one-shot POSTs and the page
		    reads no config, exactly like the stock page. */}
		<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
			<TtsCard />
			<AudioCard />
		</SimpleGrid>
	</Stack>
);

export const Route = createFileRoute("/speak")({
	component: SpeakPage,
});
