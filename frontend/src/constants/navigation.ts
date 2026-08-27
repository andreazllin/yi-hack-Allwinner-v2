import {
	ArrowsLeftRight,
	ArrowsOutCardinal,
	Broadcast,
	Camera,
	FilmStrip,
	Gauge,
	GearSix,
	Globe,
	type Icon,
	PlugsConnected,
	SlidersHorizontal,
	SpeakerHigh,
	Timer,
	TreeStructure,
	WifiHigh,
	Wrench,
} from "@phosphor-icons/react";
import type { LinkProps } from "@tanstack/react-router";

export type NavItem = {
	label: string;
	to: LinkProps["to"];
	icon: Icon;
};

export type NavSection = {
	label: string;
	items: NavItem[];
};

// One entry per page of the stock UI (src/www/httpd/htdocs/pages/), grouped
// for the sidebar. eventsdir/eventsfile collapse into the single Events
// section (/events -> /events/$dir).
export const NAV_SECTIONS: NavSection[] = [
	{
		label: "Monitoring",
		items: [
			{ label: "Status", to: "/status", icon: Gauge },
			{ label: "Snapshot", to: "/snapshot", icon: Camera },
			{ label: "Events", to: "/events", icon: FilmStrip },
		],
	},
	{
		label: "Camera",
		items: [
			{
				label: "Camera Settings",
				to: "/camera-settings",
				icon: SlidersHorizontal,
			},
			{ label: "PTZ", to: "/ptz", icon: ArrowsOutCardinal },
			{ label: "Speak", to: "/speak", icon: SpeakerHigh },
			{ label: "Timelapse", to: "/timelapse", icon: Timer },
		],
	},
	{
		label: "Configuration",
		items: [
			{ label: "System", to: "/configurations", icon: GearSix },
			{ label: "ONVIF", to: "/configurations-onvif", icon: PlugsConnected },
			{ label: "MQTT", to: "/mqtt", icon: Broadcast },
			{ label: "MQTT Advanced", to: "/mqtt-adv", icon: TreeStructure },
		],
	},
	{
		label: "Network",
		items: [
			{ label: "Static IP", to: "/static-ip", icon: Globe },
			{ label: "WiFi", to: "/wifi", icon: WifiHigh },
			{ label: "Proxy", to: "/proxy", icon: ArrowsLeftRight },
		],
	},
	{
		label: "System",
		items: [{ label: "Maintenance", to: "/maintenance", icon: Wrench }],
	},
];
