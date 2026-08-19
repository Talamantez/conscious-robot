import hydrate from "$fresh/plugins/twind/main.ts";
import options from "../twind.config.ts";

export default function (state: [string, string][]) {
  hydrate(options, state);
}
