import {
	Button,
	Card,
	Group,
	PasswordInput,
	Select,
	Skeleton,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type StandardSchemaV1, useForm } from "@tanstack/react-form";
import {
	type FunctionComponent,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { RebootPromptModal } from "@/features/configurations/components/reboot-prompt-modal";
import {
	type CardSpec,
	type ConfigFormValues,
	configFormValues,
	type FieldSpec,
} from "@/features/configurations/helpers/config-fields";
import { useSaveSystemConfig } from "@/features/configurations/hooks/use-save-system-config";
import {
	type SystemConfigRecord,
	useSystemConfig,
} from "@/features/configurations/hooks/use-system-config";

type Props = {
	title: string;
	description: string;
	cards: CardSpec[];
	// Names this page in the save toast — both pages write conf=system.
	surface: string;
	// Only the keys the firmware constrains are validated, so a page whose
	// fields are all switches and selects passes no schema at all.
	schema?: StandardSchemaV1<ConfigFormValues, unknown>;
};

export const SystemConfigForm: FunctionComponent<Props> = ({
	title,
	description,
	cards,
	surface,
	schema,
}) => {
	const { data, isPending, isError, refetch } = useSystemConfig();
	const save = useSaveSystemConfig({ surface });
	const [rebootPromptOpen, rebootPrompt] = useDisclosure(false);

	// defaultValues has to track the loaded record: useForm re-applies its
	// options on every render, so a fixed placeholder here would fight
	// form.reset() and blank the fields right after hydration.
	const values = useMemo(
		() => configFormValues(cards, data ?? {}),
		[cards, data],
	);

	const form = useForm({
		defaultValues: values,
		validators: { onChange: schema },
		onSubmit: ({ value }) => {
			if (!data) {
				return;
			}
			// Neither page owns the whole file, so the edited fields are merged
			// over the record get_configs returned: keys no page renders
			// (FTP_*, STATIC_*, EVENTS_TIME, ONVIF_FAULT_IF_SET…) survive the
			// round-trip instead of being dropped from system.conf. Resending an
			// unchanged key is a no-op write, and HOSTNAME — the one key with a
			// side effect — is always echoed back with the camera's live value.
			save.mutate(
				{ query: { conf: "system" }, body: { ...data, ...value } },
				{ onSuccess: rebootPrompt.open },
			);
		},
	});

	// Hydrate once per fetched record. TanStack Query keeps the object identity
	// stable while nothing changed, and resetting again would discard edits in
	// progress — the go2rtc probe rebuilds `cards` after the conf has landed.
	const hydratedFrom = useRef<SystemConfigRecord | null>(null);
	useEffect(() => {
		if (!data || hydratedFrom.current === data) {
			return;
		}
		hydratedFrom.current = data;
		form.reset(configFormValues(cards, data));
	}, [cards, data, form]);

	const renderField = (spec: FieldSpec): ReactNode => (
		<form.Field key={spec.key} name={spec.key}>
			{(field) => {
				// Standard-schema issues, not strings: the message is on the object.
				const [issue] = field.state.meta.errors;
				const inputProps = {
					label: spec.label,
					description: spec.description,
					value: field.state.value,
					error: issue?.message,
					onBlur: field.handleBlur,
				};

				switch (spec.kind) {
					case "switch":
						return (
							<Switch
								label={spec.label}
								description={spec.description}
								checked={field.state.value === "yes"}
								onChange={(event) =>
									field.handleChange(event.currentTarget.checked ? "yes" : "no")
								}
							/>
						);
					case "select":
						return (
							<Select
								{...inputProps}
								data={spec.options}
								allowDeselect={false}
								onChange={(value) => {
									if (value !== null) {
										field.handleChange(value);
									}
								}}
							/>
						);
					case "password":
						return (
							<PasswordInput
								{...inputProps}
								onChange={(event) =>
									field.handleChange(event.currentTarget.value)
								}
							/>
						);
					case "textarea":
						return (
							<Textarea
								{...inputProps}
								rows={spec.rows}
								onChange={(event) =>
									field.handleChange(event.currentTarget.value)
								}
							/>
						);
					case "text":
						return (
							<TextInput
								{...inputProps}
								onChange={(event) =>
									field.handleChange(event.currentTarget.value)
								}
							/>
						);
				}
			}}
		</form.Field>
	);

	const body = (): ReactNode => {
		if (isError) {
			return (
				<ErrorState
					title="Could not load the system configuration"
					description="get_configs.sh did not return system.conf. Check that the camera is reachable (and CAM_HOST in dev)."
					onRetry={() => refetch()}
				/>
			);
		}

		if (isPending) {
			return (
				<Stack gap="md">
					{cards.map((card) => (
						<Card key={card.title} withBorder>
							<Stack gap="lg">
								<Title order={4}>{card.title}</Title>
								{card.fields.map((field) => (
									<Stack key={field.key} gap={6}>
										<Skeleton height={12} width={180} />
										<Skeleton height={field.kind === "textarea" ? 88 : 36} />
									</Stack>
								))}
							</Stack>
						</Card>
					))}
				</Stack>
			);
		}

		if (data && Object.keys(data).length === 0) {
			return (
				<Text size="sm" c="dimmed">
					The camera has no system.conf to edit: get_configs.sh answered with
					the empty-file sentinel. Restore a backup or reset to defaults from
					the Maintenance page, then reload this page.
				</Text>
			);
		}

		return (
			<form
				onSubmit={(event) => {
					event.preventDefault();
					void form.handleSubmit();
				}}
			>
				<Stack gap="md">
					{cards.map((card) => (
						<Card key={card.title} withBorder>
							<Stack gap="lg">
								<Title order={4}>{card.title}</Title>
								{card.fields.map(renderField)}
							</Stack>
						</Card>
					))}
					<Group justify="space-between" gap="md">
						<Text size="sm" c="dimmed">
							Any change takes effect after the camera reboots.
						</Text>
						<form.Subscribe
							selector={(state) => ({
								// isDefaultValue, not isDirty: isDirty stays true once a
								// field has been edited even if it is edited back.
								changed: Object.values(state.fieldMeta).filter(
									(meta) => meta?.isDefaultValue === false,
								).length,
								canSubmit: state.canSubmit,
							})}
						>
							{({ changed, canSubmit }) => (
								<Group gap="sm">
									<Text size="sm" c="dimmed">
										{changed === 0
											? "No changes"
											: `${changed} changed field${changed === 1 ? "" : "s"}`}
									</Text>
									<Button
										type="submit"
										loading={save.isPending}
										disabled={changed === 0 || !canSubmit}
									>
										Save configuration
									</Button>
								</Group>
							)}
						</form.Subscribe>
					</Group>
				</Stack>
			</form>
		);
	};

	return (
		<Stack gap="md">
			<Stack gap={4}>
				<Title order={2}>{title}</Title>
				<Text size="sm" c="dimmed">
					{description}
				</Text>
			</Stack>
			{body()}
			<RebootPromptModal
				opened={rebootPromptOpen}
				onClose={rebootPrompt.close}
			/>
		</Stack>
	);
};
