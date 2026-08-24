import { useForm } from "@tanstack/react-form";
import type { CameraSettingsDraft } from "../constants/camera-settings";

// Wrapped for one reason: useForm's return type carries a dozen inferred
// generics, and components that take the form as a prop need a name for it.
//
// No validators. Every control here is a closed enumeration whose options come
// from the generated query type, and camera.conf is normalised on the way in by
// parseCameraConf, so an illegal draft value cannot be produced - a validator
// would only ever report errors that the user has no way to cause or fix.
export function useCameraSettingsForm(defaultValues: CameraSettingsDraft) {
	return useForm({ defaultValues });
}

export type CameraSettingsFormApi = ReturnType<typeof useCameraSettingsForm>;
