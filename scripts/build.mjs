import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.env.DATABASE_URL) {
  run("npx", ["prisma", "migrate", "deploy"]);
} else {
  console.warn("[build] DATABASE_URL is not set; skipping prisma migrate deploy");
}

run("npx", ["prisma", "generate"]);
run("npx", ["next", "build"]);
