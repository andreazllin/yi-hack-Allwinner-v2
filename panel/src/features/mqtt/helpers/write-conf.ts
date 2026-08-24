import { type SetConfigsData, setConfigs } from "@/api";
import { assertCgiOk, assertSavableConf } from "@/lib/cgi";

type Conf = NonNullable<SetConfigsData["query"]>["conf"];

// A rejected write is HTTP 200 with {"error":"true"}, so the check has to run
// inside the mutationFn — the generated setConfigsMutation() resolves such a
// body as a success. The body is one flat KEY->value map, which axios
// stringifies to the single line that set_configs' `read -r` requires.
export async function writeConf(conf: Conf, body: Record<string, string>) {
	assertSavableConf(body);
	const response = await setConfigs({
		query: { conf },
		body,
		throwOnError: true,
	});
	return assertCgiOk(response.data);
}
