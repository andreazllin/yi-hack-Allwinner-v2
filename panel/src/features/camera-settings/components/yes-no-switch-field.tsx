import { Switch } from "@mantine/core";
import type { FunctionComponent } from "react";
import type { YesNo } from "@/api";
import { SETTING_COPY, type YesNoKey } from "../constants/camera-settings";
import type { CameraSettingsFormApi } from "../hooks/use-camera-settings-form";

type Props = {
	form: CameraSettingsFormApi;
	name: YesNoKey;
	applying: boolean;
	// Why this camera cannot act on the setting. When set, the control is
	// disabled and the reason is shown after the stock description - the stock
	// page hides such rows outright, which leaves the reader guessing.
	unsupportedReason?: string;
	onAfterChange?: (value: YesNo) => void;
};

export const YesNoSwitchField: FunctionComponent<Props> = ({
	form,
	name,
	applying,
	unsupportedReason,
	onAfterChange,
}) => {
	const copy = SETTING_COPY[name];
	const description = unsupportedReason
		? `${copy.description ?? ""} ${unsupportedReason}`.trim()
		: copy.description;

	return (
		<form.Field name={name}>
			{(field) => (
				<Switch
					label={copy.label}
					description={description}
					// Yes/no values are the strings "yes"/"no" end to end; the firmware
					// does not recognise true/1/on.
					checked={field.state.value === "yes"}
					disabled={applying || unsupportedReason !== undefined}
					onChange={(event) => {
						const value: YesNo = event.currentTarget.checked ? "yes" : "no";
						field.handleChange(value);
						onAfterChange?.(value);
					}}
				/>
			)}
		</form.Field>
	);
};
