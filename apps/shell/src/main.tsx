import { initializeI18n } from "@ldc/i18n";
import { setupMFInfra } from "./infra/setup";

void initializeI18n();

setupMFInfra({
  remotes: [
    { name: "dashboard", entry: "http://localhost:3001", enabled: true },
    { name: "docs", entry: "http://localhost:3002", enabled: true },
  ],
  timeout: { defaultTimeoutMs: 8000 },
  errorSuppressor: {
    onSuppressed: (_, msg) => console.log(msg, "warning"),
  },
});

void import("./bootstrap");
