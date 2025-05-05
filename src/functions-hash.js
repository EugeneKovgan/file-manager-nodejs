import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { resolve, isAbsolute } from "path";
import { cwd } from "process";

export async function handleHash(filePath) {
  if (!filePath) {
    console.log("Invalid input");
    return;
  }

  try {
    const absolutePath = getAbsolutePath(filePath);
    const fileContent = await readFile(absolutePath);

    const hash = createHash("sha256").update(fileContent).digest("hex");
    console.log(hash);
  } catch (err) {
    console.log("Operation failed");
  }
}

function getAbsolutePath(pathString) {
  return isAbsolute(pathString) ? pathString : resolve(cwd(), pathString);
}
