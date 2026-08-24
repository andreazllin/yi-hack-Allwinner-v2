import { Anchor, Stack, Text, Title } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { type FunctionComponent, useEffect } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { ConfigField } from "@/features/mqtt/components/config-field";
import { ConfigFormSkeleton } from "@/features/mqtt/components/config-form-skeleton";
import { ConfigSection } from "@/features/mqtt/components/config-section";
import { SaveBar } from "@/features/mqtt/components/save-bar";
import { MQTT_SECTIONS } from "@/features/mqtt/constants/mqtt-fields";
import {
	MQTT_FORM_DEFAULTS,
	mqttFormSchema,
	toMqttConfBody,
	toMqttFormValues,
} from "@/features/mqtt/helpers/mqtt-form";
import { useMqttConf } from "@/features/mqtt/hooks/use-mqtt-conf";
import { useMqttEnabled } from "@/features/mqtt/hooks/use-mqtt-enabled";
import { useSaveMqtt } from "@/features/mqtt/hooks/use-save-mqtt";

export const MqttPage: FunctionComponent = () => {
	const conf = useMqttConf();
	const enabled = useMqttEnabled();
	const save = useSaveMqtt();

	const form = useForm({
		defaultValues: MQTT_FORM_DEFAULTS,
		validators: { onChange: mqttFormSchema },
		onSubmit: ({ value }) => {
			// The body carries every key the camera returned, not only the edited
			// ones, so keys without a control keep their value.
			save.mutate({
				body: toMqttConfBody(conf.data ?? {}, value),
				enabled: value.MQTT,
			});
		},
	});

	// Both reads have to land before hydrating: resetting on each of them alone
	// would drop the other one out of the form defaults. Only a save refetches
	// these queries, so this cannot overwrite an edit in progress.
	useEffect(() => {
		if (conf.data && enabled.data) {
			form.reset(toMqttFormValues(conf.data, enabled.data));
		}
	}, [conf.data, enabled.data, form]);

	const header = (
		<>
			<Title order={2}>MQTT</Title>
			<Text c="dimmed" size="sm">
				The camera publishes its motion and sound events to an MQTT broker.
				Advertise messages and Home Assistant discovery live on the MQTT
				Advanced page — with the{" "}
				<Anchor
					href="https://github.com/roleoroleo/yi-hack_ha_integration"
					target="_blank"
					rel="noreferrer"
				>
					yi-hack Home Assistant integration
				</Anchor>{" "}
				you need neither of them.
			</Text>
		</>
	);

	if (conf.isError || enabled.isError) {
		return (
			<Stack gap="md">
				{header}
				<ErrorState
					title="Could not load the MQTT configuration"
					description="The camera did not return mqttv4.conf or the system config. Check that it is reachable and try again."
					onRetry={() => {
						void conf.refetch();
						void enabled.refetch();
					}}
				/>
			</Stack>
		);
	}

	if (conf.isPending || enabled.isPending) {
		return (
			<Stack gap="md">
				{header}
				<ConfigFormSkeleton sections={MQTT_SECTIONS} />
			</Stack>
		);
	}

	if (Object.keys(conf.data).length === 0) {
		return (
			<Stack gap="md">
				{header}
				<Text>
					The camera returned an empty MQTT configuration, so etc/mqttv4.conf is
					missing. Saving would write nothing: the camera only rewrites keys
					that already exist in that file.
				</Text>
			</Stack>
		);
	}

	return (
		<Stack gap="md">
			{header}
			{MQTT_SECTIONS.map((section) => (
				<ConfigSection
					key={section.title}
					title={section.title}
					description={section.description}
				>
					{section.fields.map((spec) => (
						<form.Field key={spec.name} name={spec.name}>
							{(field) => (
								<ConfigField
									spec={spec}
									value={field.state.value}
									error={field.state.meta.errors[0]?.message}
									onChange={field.handleChange}
									onBlur={field.handleBlur}
								/>
							)}
						</form.Field>
					))}
				</ConfigSection>
			))}
			<form.Subscribe
				// isDirty stays true once a field has been edited; isDefaultValue goes
				// back to true when the value returns to the stored one.
				selector={(state) =>
					Object.values(state.fieldMeta).filter(
						(meta) => meta?.isDefaultValue === false,
					).length
				}
			>
				{(changedCount) => (
					<SaveBar
						changedCount={changedCount}
						saving={save.isPending}
						onSave={() => {
							void form.handleSubmit();
						}}
					/>
				)}
			</form.Subscribe>
		</Stack>
	);
};
