import { createInterface } from "readline";
import { homedir } from "os";
import * as path from "path";
import { chdir, cwd } from "process";
import { readdir, stat } from "fs/promises";

const args = process.argv.slice(2);
const usernameArg = args.find((arg) => arg.startsWith("--username="));
const username = usernameArg ? usernameArg.split("=")[1] : "Anonymous";

let currentDir = homedir();
chdir(currentDir);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

console.log(`Welcome to the File Manager, ${username}!`);
console.log(`You are currently in ${currentDir}`);
rl.prompt();

rl.on("line", async (line) => {
  const input = line.trim();

  if (input === ".exit") {
    exitProgram();
    return;
  }

  try {
    await handleCommand(input);
  } catch (err) {
    console.error("Operation failed");
  }

  console.log(`You are currently in ${cwd()}`);
  rl.prompt();
});

async function handleCommand(input) {
  const [command, ...args] = input.split(" ");

  switch (command) {
    case "up":
      handleUp();
      break;
    case "cd":
      handleCd(args[0]);
      break;
    case "ls":
      await handleLs();
      break;
    default:
      console.log("Invalid input");
      break;
  }
}

function handleUp() {
  const parentDir = path.dirname(cwd());

  if (parentDir === cwd()) {
    return;
  }

  chdir(parentDir);
}

function handleCd(targetPath) {
  if (!targetPath) {
    console.log("Invalid input");
    return;
  }

  try {
    const absolutePath = path.isAbsolute(targetPath)
      ? targetPath
      : path.resolve(cwd(), targetPath);

    chdir(absolutePath);
  } catch (err) {
    console.log("Operation failed");
  }
}

async function handleLs() {
  try {
    const dirEntries = await readdir(cwd());
    const filesInfo = await Promise.all(
      dirEntries.map(async (entry) => {
        const entryPath = join(cwd(), entry);
        const stats = await stat(entryPath);
        return {
          name: entry,
          isDirectory: stats.isDirectory(),
          size: stats.size,
        };
      })
    );

    const sortedEntries = filesInfo.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    console.log(`\nType\tName\tSize`);
    console.log(`------------------------`);

    for (const entry of sortedEntries) {
      const type = entry.isDirectory ? "Directory" : "File";
      const size = entry.isDirectory ? "-" : `${entry.size} bytes`;
      console.log(`${type}\t${entry.name}\t${size}`);
    }
  } catch (error) {
    console.error("Operation failed");
  }
}

function exitProgram() {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  rl.close();
  process.exit(0);
}

rl.on("SIGINT", () => {
  exitProgram();
});

process.on("uncaughtException", (err) => {
  console.error("Operation failed:", err.message);
  console.log(`You are currently in ${cwd()}`);
  rl.prompt();
});
