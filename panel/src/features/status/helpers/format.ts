// uptime arrives as fractional seconds from /proc/uptime (e.g. "12345.67").
export function formatUptime(uptime: string): string {
	const total = Number.parseInt(uptime, 10);
	if (Number.isNaN(total)) {
		return uptime;
	}
	const days = Math.floor(total / 86_400);
	const hours = Math.floor((total % 86_400) / 3_600);
	const minutes = Math.floor((total % 3_600) / 60);
	return `${days}d ${hours}h ${minutes}m`;
}

// The stock UI maps the /proc/net/wireless link quality (0..70) to a
// percentage as value*100/70; keep the same math so numbers match.
export function wifiStrengthPercent(strength: string): number | null {
	const value = Number.parseInt(strength, 10);
	if (Number.isNaN(value)) {
		return null;
	}
	return Math.min(100, Math.max(0, Math.round((value * 100) / 70)));
}

export function formatMemory(free: string, total: string): string {
	return `${free} / ${total} KB`;
}
