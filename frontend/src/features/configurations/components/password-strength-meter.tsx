import { Progress, Stack, Text } from "@mantine/core";
import { type FunctionComponent, useEffect, useState } from "react";

// zxcvbn's common-password list is ~220KB gzipped — more dictionary than the
// whole app, on a UI BusyBox httpd serves with no Cache-Control. So it is the
// app's one dynamic import: the chunk is fetched when someone actually types a
// password and no other visit pays for it. The promise is cached module-level,
// so the second password field on the page reuses the first field's load.
let scorer: Promise<(password: string) => number> | undefined;

const loadScorer = () => {
	scorer ??= Promise.all([
		import("@zxcvbn-ts/core"),
		import("@zxcvbn-ts/language-common"),
	]).then(([{ ZxcvbnFactory }, common]) => {
		// No @zxcvbn-ts/language-en: another ~600KB gzipped, and all it adds is
		// English wordlists and feedback strings. Without it zxcvbn returns
		// feedback as untranslated keys, so nothing but `score` is read here and
		// the wording below is ours.
		const zxcvbn = new ZxcvbnFactory({
			dictionary: common.dictionary,
			graphs: common.adjacencyGraphs,
		});
		return (password: string) => zxcvbn.check(password).score;
	});
	return scorer;
};

// zxcvbn scores 0-4 by estimated guess count, not by character classes: 0-2 is
// a password an offline attacker gets through, 3-4 is not.
const LEVELS = [
	{ label: "very weak", color: "red" },
	{ label: "weak", color: "red" },
	{ label: "fair", color: "yellow" },
	{ label: "strong", color: "teal" },
	{ label: "very strong", color: "teal" },
];

type Props = {
	value: string;
};

export const PasswordStrengthMeter: FunctionComponent<Props> = ({ value }) => {
	const [score, setScore] = useState<number | null>(null);

	useEffect(() => {
		// An empty password is how these fields disable auth altogether, which
		// the field description already says — scoring it would read as an error.
		if (value === "") {
			setScore(null);
			return;
		}
		let current = true;
		loadScorer().then((check) => {
			if (current) {
				setScore(check(value));
			}
		});
		return () => {
			current = false;
		};
	}, [value]);

	// Nothing until the chunk lands, rather than a placeholder bar that would
	// flash on the first keystroke and settle a few hundred milliseconds later.
	if (score === null) {
		return null;
	}

	const level = LEVELS[score];
	return (
		<Stack gap={4} mt={6}>
			<Progress value={(score + 1) * 20} color={level.color} size="xs" />
			<Text size="xs" c="dimmed">
				Password strength: {level.label}
			</Text>
		</Stack>
	);
};
