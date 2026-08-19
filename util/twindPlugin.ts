// Local drop-in replacement for $fresh/plugins/twind.ts.
//
// The upstream plugin declares its client entrypoint as a `data:` URL:
// https://deno.land/x/fresh@1.6.8/plugins/twind.ts#L11-L14
// esbuild-deno-loader (as pulled in by Fresh 1.6.8) silently fails to bundle
// `data:` URL entrypoints under current Deno versions, so
// `plugin-twind-main.js` never gets written even though the HTML still
// references it — breaking client hydration for the whole app. This mirrors
// the upstream plugin exactly, but points the entrypoint at a real file
// (./twindClientHydrate.ts) instead.
import { virtualSheet } from "twind/sheets";
import { Plugin } from "$fresh/server.ts";
import { Options, setup, STYLE_ELEMENT_ID } from "$fresh/plugins/twind/shared.ts";

export type { Options };

export default function twind(options: Options): Plugin {
  const sheet = virtualSheet();
  setup(options, sheet);
  return {
    name: "twind",
    entrypoints: {
      main: new URL("./twindClientHydrate.ts", import.meta.url).href,
    },
    async renderAsync(ctx) {
      sheet.reset(undefined);
      await ctx.renderAsync();
      const cssTexts = [...sheet.target];
      const snapshot = sheet.reset();
      const precedences = snapshot[1] as number[];

      const cssText = cssTexts.map((cssText, i) =>
        `${cssText}/*${precedences[i].toString(36)}*/`
      ).join("\n");

      const mappings: (string | [string, string])[] = [];
      for (
        const [key, value] of (snapshot[3] as Map<string, string>).entries()
      ) {
        if (key === value) {
          mappings.push(key);
        } else {
          mappings.push([key, value]);
        }
      }

      return {
        scripts: [{ entrypoint: "main", state: mappings }],
        styles: [{ cssText, id: STYLE_ELEMENT_ID }],
      };
    },
  };
}
