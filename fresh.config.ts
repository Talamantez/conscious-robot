import { defineConfig } from "$fresh/server.ts";
import twindPlugin from "./util/twindPlugin.ts";
import twindConfig from "./twind.config.ts";

export default defineConfig({
  plugins: [twindPlugin(twindConfig)],
});
