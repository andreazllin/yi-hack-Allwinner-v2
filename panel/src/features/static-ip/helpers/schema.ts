import { z } from "zod";

// set_configs stores these values verbatim and the firmware never parses them,
// so a malformed address is written happily and only shows up as a camera that
// never comes back on the network. Validate here or not at all.
const IPV4_PATTERN =
	/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

const blankOrIpv4 = (label: string) =>
	z.string().refine((value) => value === "" || IPV4_PATTERN.test(value), {
		error: `${label} must be an IPv4 address such as 192.168.1.20, or blank.`,
	});

export const staticIpSchema = z
	.object({
		STATIC_IP: blankOrIpv4("IP address"),
		STATIC_MASK: blankOrIpv4("Subnet mask"),
		STATIC_GW: blankOrIpv4("Gateway"),
		STATIC_DNS1: blankOrIpv4("DNS 1"),
		STATIC_DNS2: blankOrIpv4("DNS 2"),
	})
	// Both blank means DHCP. Exactly one of the two blank is the combination the
	// stock UI refuses to send: the firmware would bring up a half-configured
	// interface with no way back in.
	.refine((value) => value.STATIC_IP !== "" || value.STATIC_MASK === "", {
		error:
			"Blank IP address needs a blank subnet mask too (that pair means DHCP).",
		path: ["STATIC_IP"],
	})
	.refine((value) => value.STATIC_MASK !== "" || value.STATIC_IP === "", {
		error: "A static IP address needs a subnet mask.",
		path: ["STATIC_MASK"],
	});

export type StaticIpForm = z.infer<typeof staticIpSchema>;

export const EMPTY_STATIC_IP: StaticIpForm = {
	STATIC_IP: "",
	STATIC_MASK: "",
	STATIC_GW: "",
	STATIC_DNS1: "",
	STATIC_DNS2: "",
};

export function pickStaticIp(config: Record<string, string>): StaticIpForm {
	return {
		STATIC_IP: config.STATIC_IP ?? "",
		STATIC_MASK: config.STATIC_MASK ?? "",
		STATIC_GW: config.STATIC_GW ?? "",
		STATIC_DNS1: config.STATIC_DNS1 ?? "",
		STATIC_DNS2: config.STATIC_DNS2 ?? "",
	};
}
