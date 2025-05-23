import { createInterface } from "readline";
import { homedir } from "os";
import { chdir, cwd } from "process";
import {
  handleUp,
  handleLs,
  handleCd,
  handleCat,
  handleAdd,
  handleMkdir,
  handleRename,
  handleCopy,
  handleMove,
  handleRemove,
} from "./src/functions-fs.js";
import { handleOsInfo } from "./src/functions-os.js";
import { handleHash } from "./src/functions-hash.js";
import { handleCompress, handleDecompress } from "./src/functions-compress.js";

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
  const parts = input.split(" ");
  const command = parts[0];
  const args = parts.slice(1);

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
    case "cat":
      await handleCat(args[0]);
      break;
    case "add":
      await handleAdd(args[0]);
      break;
    case "mkdir":
      await handleMkdir(args[0]);
      break;
    case "rn":
      await handleRename(args[0], args[1]);
      break;
    case "cp":
      await handleCopy(args[0], args[1]);
      break;
    case "mv":
      await handleMove(args[0], args[1]);
      break;
    case "rm":
      await handleRemove(args[0]);
      break;
    case "os":
      if (args.length > 0) {
        handleOsInfo(args[0]);
      } else {
        console.log("Invalid input");
      }
      break;
    case "hash":
      await handleHash(args[0]);
      break;
    case "compress":
      await handleCompress(args[0], args[1]);
      break;
    case "decompress":
      await handleDecompress(args[0], args[1]);
      break;
    default:
      console.log("Invalid input");
      break;
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
