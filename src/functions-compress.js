import { createBrotliCompress, createBrotliDecompress } from "zlib";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { resolve, isAbsolute, basename } from "path";
import { cwd } from "process";

export async function handleCompress(filePath, destinationPath) {
  if (!filePath || !destinationPath) {
    console.log("Invalid input");
    return;
  }

  try {
    const absoluteSourcePath = getAbsolutePath(filePath);
    const absoluteDestPath = getAbsolutePath(destinationPath);

    const readStream = createReadStream(absoluteSourcePath);
    const brotliStream = createBrotliCompress();
    const writeStream = createWriteStream(absoluteDestPath);

    await pipeline(readStream, brotliStream, writeStream);
    console.log(`File compressed successfully to ${absoluteDestPath}`);
  } catch (err) {
    console.log("Operation failed");
  }
}

export async function handleDecompress(filePath, destinationPath) {
  if (!filePath || !destinationPath) {
    console.log("Invalid input");
    return;
  }

  try {
    const absoluteSourcePath = getAbsolutePath(filePath);
    const absoluteDestPath = getAbsolutePath(destinationPath);

    const readStream = createReadStream(absoluteSourcePath);
    const brotliStream = createBrotliDecompress();
    const writeStream = createWriteStream(absoluteDestPath);

    await pipeline(readStream, brotliStream, writeStream);
    console.log(`File decompressed successfully to ${absoluteDestPath}`);
  } catch (err) {
    console.log("Operation failed");
  }
}

function getAbsolutePath(pathString) {
  return isAbsolute(pathString) ? pathString : resolve(cwd(), pathString);
}
