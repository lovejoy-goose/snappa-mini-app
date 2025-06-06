import { cloudflare } from "@cloudflare/vite-plugin";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [preact({}), cloudflare(), tailwindcss()],
	ssr: {
		noExternal: ["@farcaster/frame-sdk"],
	},
});
