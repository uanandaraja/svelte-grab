import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "..");
const packageDir = join(repoRoot, "packages", "svelte-grab");
const packageJsonPath = join(packageDir, "package.json");

type ReleaseType = "patch" | "minor" | "major";
type Command = ReleaseType | "check" | "version";

const usage = `
Usage:
  bun run scripts/release.ts version
  bun run scripts/release.ts check
  bun run scripts/release.ts <patch|minor|major> [--dry-run]
`.trim();

const parseArgs = (): { command: Command; dryRun: boolean } => {
  const [commandArg, ...rest] = process.argv.slice(2);
  const dryRun = rest.includes("--dry-run");

  switch (commandArg) {
    case "version":
    case "check":
    case "patch":
    case "minor":
    case "major":
      return { command: commandArg, dryRun };
    default:
      throw new Error(usage);
  }
};

const readPackageJson = async (): Promise<Record<string, unknown>> => {
  const file = await readFile(packageJsonPath, "utf8");
  return JSON.parse(file) as Record<string, unknown>;
};

const writePackageJson = async (packageJson: Record<string, unknown>): Promise<void> => {
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
};

const getVersion = (packageJson: Record<string, unknown>): string => {
  const version = packageJson.version;

  if (typeof version !== "string") {
    throw new Error("Package version is missing or invalid");
  }

  return version;
};

const bumpVersion = (version: string, releaseType: ReleaseType): string => {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  switch (releaseType) {
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "major":
      return `${major + 1}.0.0`;
  }
};

const runCommand = async (cmd: string[], cwd = repoRoot): Promise<void> => {
  const processHandle = Bun.spawn({
    cmd,
    cwd,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await processHandle.exited;

  if (exitCode !== 0) {
    throw new Error(`Command failed: ${cmd.join(" ")}`);
  }
};

const runChecks = async (): Promise<void> => {
  await runCommand(["bun", "run", "build"]);
  await runCommand(["bun", "run", "check"]);
  await runCommand(["bun", "run", "test:e2e"]);
};

const main = async (): Promise<void> => {
  const { command, dryRun } = parseArgs();
  const packageJson = await readPackageJson();
  const currentVersion = getVersion(packageJson);

  switch (command) {
    case "version": {
      console.log(currentVersion);
      return;
    }
    case "check": {
      await runChecks();
      return;
    }
    case "patch":
    case "minor":
    case "major": {
      const nextVersion = bumpVersion(currentVersion, command);

      console.log(`Current version: ${currentVersion}`);
      console.log(`Next version: ${nextVersion}`);
      await runChecks();

      if (dryRun) {
        console.log("Dry run complete. Version not changed and nothing was published.");
        return;
      }

      packageJson.version = nextVersion;
      await writePackageJson(packageJson);
      await runCommand(["bun", "publish", "--access", "public"], packageDir);
      console.log(`Published @uanandaraja/sveltegrab@${nextVersion}`);
      return;
    }
  }
};

await main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
