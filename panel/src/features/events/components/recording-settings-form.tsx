import {
	Button,
	Group,
	PasswordInput,
	Select,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	TextInput,
} from "@mantine/core";
import { FloppyDisk } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { type FunctionComponent, useEffect } from "react";
import {
	EVENTS_TIME_OPTIONS,
	type EventsTime,
	recordingSettingsSchema,
	toRecordingSettings,
} from "@/features/events/helpers/recording-settings";
import { useSaveSystemConfig } from "@/features/events/hooks/use-save-system-config";

type Props = {
	conf: Record<string, string>;
};

export const RecordingSettingsForm: FunctionComponent<Props> = ({ conf }) => {
	const save = useSaveSystemConfig();

	const form = useForm({
		defaultValues: toRecordingSettings(conf),
		validators: {
			onChange: recordingSettingsSchema,
			onSubmit: recordingSettingsSchema,
		},
		onSubmit: ({ value }) => {
			// The whole of system.conf goes back with only these keys replaced.
			save.mutate({ ...conf, ...value });
		},
	});

	// A save can silently no-op (set_configs.sh only rewrites keys that already
	// exist in the file), so re-hydrate from what the camera reports once the
	// refetch lands rather than leaving the typed value on screen.
	useEffect(() => {
		form.reset(toRecordingSettings(conf));
	}, [conf, form]);

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			<Stack gap="md">
				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
					<form.Field name="FREE_SPACE">
						{(field) => (
							<TextInput
								label="SD free space (%)"
								description="Percentage of free space to keep on the SD card. 0 to disable."
								value={field.state.value}
								onChange={(event) =>
									field.handleChange(event.currentTarget.value)
								}
								onBlur={field.handleBlur}
								error={field.state.meta.errors[0]?.message}
							/>
						)}
					</form.Field>
					<form.Field name="EVENTS_TIME">
						{(field) => (
							<Select<EventsTime>
								label="Select the time used by your cam to save the events"
								description="How the camera reads the timestamps in the recording directory names."
								data={EVENTS_TIME_OPTIONS}
								value={field.state.value}
								allowDeselect={false}
								onChange={(value) => {
									if (value !== null) {
										field.handleChange(value);
									}
								}}
							/>
						)}
					</form.Field>
				</SimpleGrid>

				<Stack gap="xs">
					<form.Field name="FTP_UPLOAD">
						{(field) => (
							<Switch
								label="FTP Upload"
								checked={field.state.value === "yes"}
								onChange={(event) =>
									field.handleChange(event.currentTarget.checked ? "yes" : "no")
								}
							/>
						)}
					</form.Field>
					<form.Field name="FTP_FILE_DELETE_AFTER_UPLOAD">
						{(field) => (
							<Switch
								label="FTP Delete (after upload)"
								checked={field.state.value === "yes"}
								onChange={(event) =>
									field.handleChange(event.currentTarget.checked ? "yes" : "no")
								}
							/>
						)}
					</form.Field>
					<form.Field name="FTP_DIR_TREE">
						{(field) => (
							<Switch
								label="Create directory tree"
								checked={field.state.value === "yes"}
								onChange={(event) =>
									field.handleChange(event.currentTarget.checked ? "yes" : "no")
								}
							/>
						)}
					</form.Field>
				</Stack>

				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
					<form.Field name="FTP_HOST">
						{(field) => (
							<TextInput
								label="FTP Host"
								description="DNS name or IP address of the FTP service."
								value={field.state.value}
								onChange={(event) =>
									field.handleChange(event.currentTarget.value)
								}
							/>
						)}
					</form.Field>
					<form.Field name="FTP_DIR">
						{(field) => (
							<TextInput
								label="FTP Directory"
								description="Empty means the FTP root directory."
								value={field.state.value}
								onChange={(event) =>
									field.handleChange(event.currentTarget.value)
								}
							/>
						)}
					</form.Field>
					<form.Field name="FTP_USERNAME">
						{(field) => (
							<TextInput
								label="FTP Username"
								value={field.state.value}
								onChange={(event) =>
									field.handleChange(event.currentTarget.value)
								}
							/>
						)}
					</form.Field>
					<form.Field name="FTP_PASSWORD">
						{(field) => (
							<PasswordInput
								label="FTP Password"
								value={field.state.value}
								onChange={(event) =>
									field.handleChange(event.currentTarget.value)
								}
							/>
						)}
					</form.Field>
				</SimpleGrid>

				<Group justify="space-between" align="flex-end">
					<Text size="sm" c="dimmed">
						This change will take effect after the reboot of the camera.
					</Text>
					<form.Subscribe
						selector={(state) => ({
							canSubmit: state.canSubmit,
							isDefaultValue: state.isDefaultValue,
						})}
					>
						{({ canSubmit, isDefaultValue }) => (
							<Button
								type="submit"
								leftSection={<FloppyDisk size={16} />}
								loading={save.isPending}
								disabled={!canSubmit || isDefaultValue}
							>
								Save
							</Button>
						)}
					</form.Subscribe>
				</Group>
			</Stack>
		</form>
	);
};
