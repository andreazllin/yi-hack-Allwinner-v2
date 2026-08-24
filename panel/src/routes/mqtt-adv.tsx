import { Anchor, Stack, Text, Title } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { type FunctionComponent, useEffect } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { ConfigField } from "@/features/mqtt/components/config-field";
import { ConfigFormSkeleton } from "@/features/mqtt/components/config-form-skeleton";
import { ConfigSection } from "@/features/mqtt/components/config-section";
import { SaveBar } from "@/features/mqtt/components/save-bar";
import { MQTT_ADVERTISE_SECTIONS } from "@/features/mqtt/constants/mqtt-advertise-fields";
import {
	MQTT_ADVERTISE_FORM_DEFAULTS,
	mqttAdvertiseFormSchema,
	toMqttAdvertiseConfBody,
	toMqttAdvertiseFormValues,
} from "@/features/mqtt/helpers/mqtt-advertise-form";
import { useMqttAdvertiseConf } from "@/features/mqtt/hooks/use-mqtt-advertise-conf";
import { useSaveMqttAdvertise } from "@/features/mqtt/hooks/use-save-mqtt-advertise";

const MqttAdvPage: FunctionComponent = () => {
	const conf = useMqttAdvertiseConf();
	const save = useSaveMqttAdvertise();

	const form = useForm({
		defaultValues: MQTT_ADVERTISE_FORM_DEFAULTS,
		validators: { onChange: mqttAdvertiseFormSchema },
		onSubmit: ({ value }) => {
			save.mutate(toMqttAdvertiseConfBody(conf.data ?? {}, value));
		},
	});

	// Hydrate when the config lands. Only a save refetches this query, so this
	// cannot overwrite an edit in progress.
	useEffect(() => {
		if (conf.data) {
			form.reset(toMqttAdvertiseFormValues(conf.data));
		}
	}, [conf.data, form]);

	const header = (
		<>
			<Title order={2}>MQTT Advanced</Title>
			<Text c="dimmed" size="sm">
				Four advertise services publish the camera's information, links,
				settings and telemetry on a schedule, and the Home Assistant service
				publishes{" "}
				<Anchor
					href="https://www.home-assistant.io/docs/mqtt/discovery/"
					target="_blank"
					rel="noreferrer"
				>
					MQTT discovery
				</Anchor>{" "}
				messages. They all use the broker configured on the MQTT page.
			</Text>
		</>
	);

	if (conf.isError) {
		return (
			<Stack gap="md">
				{header}
				<ErrorState
					title="Could not load the MQTT advertise configuration"
					description="The camera did not return mqtt_advertise.conf. Check that it is reachable and try again."
					onRetry={() => {
						void conf.refetch();
					}}
				/>
			</Stack>
		);
	}

	if (conf.isPending) {
		return (
			<Stack gap="md">
				{header}
				<ConfigFormSkeleton sections={MQTT_ADVERTISE_SECTIONS} />
			</Stack>
		);
	}

	if (Object.keys(conf.data).length === 0) {
		return (
			<Stack gap="md">
				{header}
				<Text>
					The camera returned an empty advertise configuration, so
					etc/mqtt_advertise.conf is missing. Saving would write nothing: the
					camera only rewrites keys that already exist in that file.
				</Text>
			</Stack>
		);
	}

	return (
		<Stack gap="md">
			{header}
			{MQTT_ADVERTISE_SECTIONS.map((section) => (
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

export const Route = createFileRoute("/mqtt-adv")({
	component: MqttAdvPage,
});
