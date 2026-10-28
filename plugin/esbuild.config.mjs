import esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "cjs",
  target: "es2020",
  outfile: "main.js",
  external: ["obsidian", "electron", "@codemirror/*", "@lezer/*"],
  logLevel: "info"
});

if (watch) await ctx.watch();
else { await ctx.rebuild(); await ctx.dispose(); }