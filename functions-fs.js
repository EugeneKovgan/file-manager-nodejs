import * as path from "path";
import { readdir, stat } from "fs/promises";

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
