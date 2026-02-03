import fs from "node:fs/promises";
import path from "node:path";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export async function scanDir(dirPath: string): Promise<string[]> {
  const files = [];

  try {
    const entries = await fs.readdir(dirPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        files.push(...(await scanDir(fullPath)));
      } else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(error);
  }

  return files;
}
