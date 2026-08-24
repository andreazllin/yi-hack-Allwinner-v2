import {
	Badge,
	Button,
	Card,
	Divider,
	Group,
	Modal,
	Skeleton,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { HouseLine, Plus, Trash } from "@phosphor-icons/react";
import { type FunctionComponent, useState } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import {
	PRESET_NAME_PATTERN,
	type StoredPreset,
} from "@/features/ptz/helpers/presets";
import { usePtzPreset } from "@/features/ptz/hooks/use-ptz-preset";
import { usePtzPresets } from "@/features/ptz/hooks/use-ptz-presets";

// The three actions that need confirming: they either destroy stored
// positions or overwrite the home position on the camera.
type PendingAction =
	| { kind: "delete"; num: string; name: string }
	| { kind: "delete-all" }
	| { kind: "set-home" };

export const PresetsCard: FunctionComponent = () => {
	const { data: slots, isPending, isError, refetch } = usePtzPresets();
	const preset = usePtzPreset();
	const [name, setName] = useState("");
	const [pendingAction, setPendingAction] = useState<PendingAction | null>(
		null,
	);
	const [confirmOpened, { open: openConfirm, close: closeConfirm }] =
		useDisclosure(false);

	const stored =
		slots?.filter((slot): slot is StoredPreset => slot.name !== null) ?? [];
	const freeSlots = slots?.filter((slot) => slot.name === null).length ?? 0;
	const nameError = validateName(
		name,
		stored.map((slot) => slot.name),
	);

	const ask = (action: PendingAction) => {
		setPendingAction(action);
		openConfirm();
	};

	const confirm = () => {
		if (pendingAction === null) {
			return;
		}
		if (pendingAction.kind === "delete") {
			preset.mutate({ action: "del_preset", num: pendingAction.num });
		} else if (pendingAction.kind === "delete-all") {
			preset.mutate({ action: "del_preset", num: "all" });
		} else {
			preset.mutate({ action: "set_home_position" });
		}
		closeConfirm();
	};

	const add = () => {
		// Clear the field only once the camera accepted it, so a rejected name
		// stays on screen next to its error.
		preset.mutate(
			{ action: "add_preset", name },
			{ onSuccess: () => setName("") },
		);
	};

	return (
		<Card withBorder>
			<Stack gap="md">
				<Stack gap={4}>
					<Title order={4}>Presets</Title>
					<Text size="sm" c="dimmed">
						A preset stores the current lens position. The camera keeps a fixed
						number of slots and returns to a stored position on request.
					</Text>
				</Stack>

				{isPending && (
					<Stack gap="xs">
						<Skeleton height={32} />
						<Skeleton height={32} />
						<Skeleton height={32} />
					</Stack>
				)}

				{isError && (
					<ErrorState
						title="Could not load the PTZ presets"
						description="The camera did not return ptz_presets.conf. It may be busy, or the config file may be missing from the SD card."
						onRetry={() => refetch()}
					/>
				)}

				{slots !== undefined && slots.length === 0 && (
					<Text size="sm" c="dimmed">
						The camera returned no preset slots at all, which means
						ptz_presets.conf is missing from the SD card. Presets cannot be
						stored until the firmware recreates it.
					</Text>
				)}

				{slots !== undefined && slots.length > 0 && (
					<Stack gap="xs">
						{stored.length === 0 && (
							<Text size="sm" c="dimmed">
								No presets stored yet. Aim the camera with the pad, then name
								the position below and add it.
							</Text>
						)}
						{stored.map((slot) => (
							<Group key={slot.num} justify="space-between" wrap="nowrap">
								<Group gap="xs" wrap="nowrap">
									<Badge variant="light">{slot.num}</Badge>
									<Text size="sm">{slot.name}</Text>
								</Group>
								<Group gap="xs" wrap="nowrap">
									<Button
										size="xs"
										variant="light"
										disabled={preset.isPending}
										onClick={() =>
											preset.mutate({ action: "go_preset", num: slot.num })
										}
									>
										Go
									</Button>
									<Button
										size="xs"
										variant="subtle"
										color="red"
										leftSection={<Trash size={14} />}
										disabled={preset.isPending}
										onClick={() =>
											ask({ kind: "delete", num: slot.num, name: slot.name })
										}
									>
										Delete
									</Button>
								</Group>
							</Group>
						))}
						<Text size="xs" c="dimmed">
							{`${stored.length} of ${slots.length} slots in use.`}
						</Text>
					</Stack>
				)}

				<Divider />

				<Group align="flex-end" gap="sm" wrap="nowrap">
					<TextInput
						flex={1}
						label="New preset"
						description="Letters, digits, - and _ only: the camera rejects punctuation and writes the name into its config file unquoted."
						placeholder="front_door"
						value={name}
						error={nameError}
						disabled={freeSlots === 0}
						onChange={(event) => setName(event.currentTarget.value)}
					/>
					<Button
						leftSection={<Plus size={16} />}
						loading={preset.isPending}
						disabled={
							name.length === 0 || nameError !== null || freeSlots === 0
						}
						onClick={add}
					>
						Add
					</Button>
				</Group>
				{freeSlots === 0 && slots !== undefined && slots.length > 0 && (
					<Text size="xs" c="dimmed">
						Every slot is in use. Delete a preset to free one.
					</Text>
				)}

				<Group gap="sm">
					<Button
						variant="default"
						leftSection={<HouseLine size={16} />}
						disabled={preset.isPending}
						onClick={() => ask({ kind: "set-home" })}
					>
						Set home position
					</Button>
					<Button
						variant="subtle"
						color="red"
						disabled={preset.isPending || stored.length === 0}
						onClick={() => ask({ kind: "delete-all" })}
					>
						Delete all presets
					</Button>
				</Group>
			</Stack>

			<Modal
				opened={confirmOpened}
				onClose={closeConfirm}
				title={
					pendingAction === null ? "" : CONFIRM_COPY[pendingAction.kind].title
				}
			>
				<Stack gap="md">
					<Text size="sm">
						{pendingAction === null ? "" : describeConsequence(pendingAction)}
					</Text>
					<Group justify="flex-end" gap="sm">
						<Button variant="default" onClick={closeConfirm}>
							Cancel
						</Button>
						<Button
							color={pendingAction?.kind === "set-home" ? "blue" : "red"}
							onClick={confirm}
						>
							{pendingAction === null
								? ""
								: CONFIRM_COPY[pendingAction.kind].action}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Card>
	);
};

const CONFIRM_COPY: Record<
	PendingAction["kind"],
	{ title: string; action: string }
> = {
	delete: { title: "Delete preset", action: "Delete preset" },
	"delete-all": { title: "Delete all presets", action: "Delete all" },
	"set-home": { title: "Set home position", action: "Set home position" },
};

function describeConsequence(action: PendingAction): string {
	switch (action.kind) {
		case "delete":
			return `Preset ${action.num} ("${action.name}") is removed from the camera. The stored position is lost and cannot be recovered.`;
		case "delete-all":
			return "Every stored preset is cleared in one call. All positions are lost and cannot be recovered.";
		case "set-home":
			// ptz_presets.sh clears slot 0 and re-adds the current position as
			// "Home" before telling the motor about it.
			return "The camera's current lens position becomes the home position, which the centre button of the pad returns to. Preset 0 is cleared and replaced by a preset named Home.";
	}
}

function validateName(name: string, taken: string[]): string | null {
	if (name.length === 0) {
		return null;
	}
	if (!PRESET_NAME_PATTERN.test(name)) {
		return "Use letters, digits, - and _ only (no spaces).";
	}
	// ptz_presets.sh refuses a duplicate name with "Preset already exists".
	if (taken.includes(name)) {
		return "A preset with this name already exists.";
	}
	return null;
}
