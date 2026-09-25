const { spawn } = require("node:child_process");

const migration = spawn(process.execPath, [require.resolve("./migrate.js")], {
  env: process.env,
  stdio: ["ignore", "pipe", "pipe"],
});

migration.stdout.on("data", (chunk) => process.stdout.write(`[migration] ${chunk}`));
migration.stderr.on("data", (chunk) => process.stderr.write(`[migration] ${chunk}`));
migration.on("error", (error) => console.error("[migration] could not start:", error));
migration.on("exit", (code) => {
  if (code !== 0) console.error(`[migration] exited with code ${code}`);
});

const next = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start"], {
  env: process.env,
  stdio: "inherit",
});

const forwardSignal = (signal) => {
  migration.kill(signal);
  next.kill(signal);
};

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

next.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
