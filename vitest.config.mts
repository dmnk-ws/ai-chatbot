import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // MSW probes localStorage on import; Node >= 25 warns unless it is disabled.
    execArgv: ["--no-experimental-webstorage"],
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["lib/**/*.test.ts", "app/api/**/*.test.ts"],
          setupFiles: ["test/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          environment: "jsdom",
          include: [
            "components/**/*.test.{ts,tsx}",
            "hooks/**/*.test.{ts,tsx}",
            "contexts/**/*.test.{ts,tsx}",
            "app/**/*.test.tsx",
          ],
          exclude: ["app/api/**"],
          setupFiles: ["test/setup.ts", "test/setup-browser.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "live",
          environment: "node",
          include: ["test/live/**/*.test.ts"],
          env: loadEnv("", process.cwd(), ""),
        },
      },
    ],
  },
});
