import { Alert, Card, Select, Stack, Title } from "@mantine/core";
import { Info } from "@phosphor-icons/react";
import { type FunctionComponent, useMemo } from "react";
import type { YesNo } from "@/api";
import {
	CRUISE_OPTIONS,
	SENSITIVITY_OPTIONS,
	SETTING_COPY,
	SOUND_SENSITIVITY_OPTIONS,
} from "../constants/camera-settings";
import {
	estimateApplyMs,
	isFw12Firmware,
	parseCameraConf,
	summarizeChanges,
} from "../helpers/camera-settings";
import { useApplyCameraSettings } from "../hooks/use-apply-camera-settings";
import { useCameraSettingsForm } from "../hooks/use-camera-settings-form";
import { ApplyBar } from "./apply-bar";
import { YesNoSwitchField } from "./yes-no-switch-field";

type Props = {
	conf: Record<string, string>;
	isPtz: boolean;
};

// Verbatim from the stock page, where it replaces the Motion Detection switch
// on firmware that has no such flag.
const ALWAYS_ON_REASON =
	"You don't need to enable motion detection, it's always enabled.";
const NEEDS_FW12_REASON =
	"Only 11 and 12 firmware apply this - camera_settings.sh runs no command for it here.";
const NEEDS_PTZ_REASON =
	"This model has no pan/tilt motor, so there is nothing for the camera to move.";

export const CameraSettingsForm: FunctionComponent<Props> = ({
	conf,
	isPtz,
}) => {
	// camera.conf is the baseline the change count is measured against. Handing
	// it to useForm as defaultValues is enough to hydrate the form: useForm
	// re-applies its options on every render, and adopts new defaults only while
	// the form is untouched - so a refetch cannot overwrite an edit in progress.
	const initialValues = useMemo(() => parseCameraConf(conf), [conf]);
	const isFw12 = isFw12Firmware(conf.HOMEVER);
	const apply = useApplyCameraSettings();
	const form = useCameraSettingsForm(initialValues);

	const applying = apply.isPending;

	const handleApply = () => {
		const draft = form.state.values;
		// Touched is sticky, so nothing hydrates the form again by itself: the
		// reset is what makes the applied draft the new baseline. It matches the
		// conf cache, which the mutation has just written the same values into.
		apply.mutate(draft, { onSuccess: () => form.reset(draft) });
	};

	// Mutual exclusion, client-side only, copied from the stock page: on 11/12
	// firmware camera_settings.sh sends AI detection commands only while generic
	// motion detection is off, so the two cannot both be on.
	const clearAiDetections = (value: YesNo) => {
		if (value !== "yes") {
			return;
		}
		form.setFieldValue("AI_HUMAN_DETECTION", "no");
		form.setFieldValue("AI_VEHICLE_DETECTION", "no");
		form.setFieldValue("AI_ANIMAL_DETECTION", "no");
	};

	const clearMotionDetection = (value: YesNo) => {
		if (value === "yes") {
			form.setFieldValue("MOTION_DETECTION", "no");
		}
	};

	return (
		<Stack gap="md">
			<form.Subscribe
				selector={(state) => ({
					...summarizeChanges(state.fieldMeta, state.values),
					estimatedMs: estimateApplyMs(state.values),
				})}
			>
				{(changes) => (
					<ApplyBar
						changedLabels={changes.labels}
						switchingOff={changes.switchingOff}
						applying={applying}
						estimatedMs={changes.estimatedMs}
						onApply={handleApply}
						onDiscard={() => form.reset()}
					/>
				)}
			</form.Subscribe>

			<Card withBorder>
				<Stack gap="md">
					<Title order={4}>Camera</Title>
					<YesNoSwitchField form={form} name="SWITCH_ON" applying={applying} />
					<YesNoSwitchField form={form} name="LED" applying={applying} />
					<YesNoSwitchField form={form} name="IR" applying={applying} />
					<YesNoSwitchField form={form} name="ROTATE" applying={applying} />
				</Stack>
			</Card>

			<Card withBorder>
				<Stack gap="md">
					<Title order={4}>Motion detection</Title>
					<YesNoSwitchField
						form={form}
						name="SAVE_VIDEO_ON_MOTION"
						applying={applying}
					/>
					<YesNoSwitchField
						form={form}
						name="MOTION_DETECTION"
						applying={applying}
						unsupportedReason={isFw12 ? undefined : ALWAYS_ON_REASON}
						onAfterChange={clearAiDetections}
					/>
					<form.Field name="SENSITIVITY">
						{(field) => (
							<Select
								label={SETTING_COPY.SENSITIVITY.label}
								data={SENSITIVITY_OPTIONS}
								value={field.state.value}
								allowDeselect={false}
								disabled={applying}
								onChange={(value) => {
									if (value) {
										field.handleChange(value);
									}
								}}
							/>
						)}
					</form.Field>
					{isFw12 && (
						<form.Subscribe
							selector={(state) => state.values.MOTION_DETECTION === "yes"}
						>
							{(motionDetectionOn) =>
								motionDetectionOn ? (
									<Alert
										variant="light"
										color="blue"
										icon={<Info size={20} />}
										title="AI detections are ignored right now"
									>
										Generic Motion Detection is on, and on 11/12 firmware
										camera_settings.sh sends the AI detection commands only
										while it is off.
									</Alert>
								) : null
							}
						</form.Subscribe>
					)}
					<YesNoSwitchField
						form={form}
						name="AI_HUMAN_DETECTION"
						applying={applying}
						onAfterChange={clearMotionDetection}
					/>
					<YesNoSwitchField
						form={form}
						name="AI_VEHICLE_DETECTION"
						applying={applying}
						unsupportedReason={isFw12 ? undefined : NEEDS_FW12_REASON}
						onAfterChange={clearMotionDetection}
					/>
					<YesNoSwitchField
						form={form}
						name="AI_ANIMAL_DETECTION"
						applying={applying}
						unsupportedReason={isFw12 ? undefined : NEEDS_FW12_REASON}
						onAfterChange={clearMotionDetection}
					/>
					<YesNoSwitchField
						form={form}
						name="FACE_DETECTION"
						applying={applying}
					/>
					<YesNoSwitchField
						form={form}
						name="MOTION_TRACKING"
						applying={applying}
						unsupportedReason={isPtz ? undefined : NEEDS_PTZ_REASON}
					/>
				</Stack>
			</Card>

			<Card withBorder>
				<Stack gap="md">
					<Title order={4}>Sound</Title>
					<YesNoSwitchField
						form={form}
						name="SOUND_DETECTION"
						applying={applying}
					/>
					<form.Field name="SOUND_SENSITIVITY">
						{(field) => (
							<Select
								label={SETTING_COPY.SOUND_SENSITIVITY.label}
								// Only these nine values exist; the gaps (55, 65, 75, 85) are
								// dropped silently by the firmware.
								data={SOUND_SENSITIVITY_OPTIONS}
								value={field.state.value}
								allowDeselect={false}
								disabled={applying}
								onChange={(value) => {
									if (value) {
										field.handleChange(value);
									}
								}}
							/>
						)}
					</form.Field>
				</Stack>
			</Card>

			<Card withBorder>
				<Stack gap="md">
					<Title order={4}>Cruise</Title>
					<form.Field name="CRUISE">
						{(field) => (
							<Select
								label={SETTING_COPY.CRUISE.label}
								description={isPtz ? undefined : NEEDS_PTZ_REASON}
								data={CRUISE_OPTIONS}
								value={field.state.value}
								allowDeselect={false}
								disabled={applying || !isPtz}
								onChange={(value) => {
									if (value) {
										field.handleChange(value);
									}
								}}
							/>
						)}
					</form.Field>
				</Stack>
			</Card>
		</Stack>
	);
};
