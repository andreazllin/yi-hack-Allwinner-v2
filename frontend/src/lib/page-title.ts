// Tab titles, most specific part first: "Camera Settings · yi-hack". Browsers
// truncate tab labels hard, so the page name has to come before the app name
// to survive it.
export const pageTitle = (...parts: string[]): string =>
	[...parts, "yi-hack"].join(" · ");
