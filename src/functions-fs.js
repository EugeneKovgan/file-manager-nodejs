import * as path from "path";
import { readdir, stat, writeFile, mkdir, rename, rm } from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { chdir, cwd } from "process";
import { join, basename, dirname, resolve, isAbsolute } from "path";

export function handleUp() {
  const parentDir = path.dirname(cwd());

  if (parentDir === cwd()) {
    return;
  }

  chdir(parentDir);
}

export function handleCd(targetPath) {
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

export async function handleLs() {
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

export async function handleCat(filePath) {
  if (!filePath) {
    console.log("Invalid input");
    return;
  }

  try {
    const absolutePath = getAbsolutePath(filePath);
    const readStream = createReadStream(absolutePath, { encoding: "utf8" });

    readStream.on("data", (chunk) => {
      console.log(chunk);
    });

    readStream.on("error", () => {
      console.log("Operation failed");
    });
  } catch (err) {
    console.log("Operation failed");
  }
}

// Creating an empty file
export async function handleAdd(fileName) {
  if (!fileName) {
    console.log("Invalid input");
    return;
  }

  try {
    const filePath = join(cwd(), fileName);
    await writeFile(filePath, "", { flag: "wx" }); // 'wx' - create the file if it does not exist, otherwise throw an error
  } catch (err) {
    console.log("Operation failed");
  }
}

export async function handleMkdir(dirName) {
  if (!dirName) {
    console.log("Invalid input");
    return;
  }

  try {
    const dirPath = join(cwd(), dirName);
    await mkdir(dirPath);
  } catch (err) {
    console.log("Operation failed");
  }
}

export async function handleRename(oldPath, newFileName) {
  if (!oldPath || !newFileName) {
    console.log("Invalid input");
    return;
  }

  try {
    const absoluteOldPath = getAbsolutePath(oldPath);
    const newPath = join(dirname(absoluteOldPath), newFileName);

    await rename(absoluteOldPath, newPath);
  } catch (err) {
    console.log("Operation failed");
  }
}

export async function handleCopy(sourcePath, destDir) {
  if (!sourcePath || !destDir) {
    console.log("Invalid input");
    return;
  }

  try {
    const absoluteSourcePath = getAbsolutePath(sourcePath);
    const absoluteDestDir = getAbsolutePath(destDir);

    const destStats = await stat(absoluteDestDir).catch(() => null);
    if (!destStats || !destStats.isDirectory()) {
      console.log("Destination is not a directory");
      return;
    }

    const fileName = basename(absoluteSourcePath);
    const destPath = join(absoluteDestDir, fileName);

    const readStream = createReadStream(absoluteSourcePath);
    const writeStream = createWriteStream(destPath);

    await pipeline(readStream, writeStream);
  } catch (err) {
    console.log("Operation failed");
  }
}

export async function handleMove(sourcePath, destDir) {
  if (!sourcePath || !destDir) {
    console.log("Invalid input");
    return;
  }

  try {
    await handleCopy(sourcePath, destDir);

    await handleRemove(sourcePath);
  } catch (err) {
    console.log("Operation failed");
  }
}

export async function handleRemove(filePath) {
  if (!filePath) {
    console.log("Invalid input");
    return;
  }

  try {
    const absolutePath = getAbsolutePath(filePath);
    await rm(absolutePath);
  } catch (err) {
    console.log("Operation failed");
  }
}

function getAbsolutePath(pathString) {
  return isAbsolute(pathString) ? pathString : resolve(cwd(), pathString);
}
