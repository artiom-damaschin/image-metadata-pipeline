import sharp from "sharp";
import exifr from "exifr";
import type { Metadata } from "./types.ts";

interface ExifData {
  Make?: string;
  Model?: string;
  DateTimeOriginal?: string;
}

export async function extractMetadata(filePath: string): Promise<Metadata> {
  const metadata = await sharp(filePath).metadata();
  let exifData: ExifData = {};

  if (metadata.exif) {
    exifData = await exifr.parse("temp/photo-1.jpg", {
      pick: ["Model", "DateTimeOriginal"],
    });
  }

  return {
    file: filePath,
    camera: exifData.Model ?? "Unknown",
    date: exifData.DateTimeOriginal ?? null,
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    hasAlpha: metadata.hasAlpha,
    orientation: metadata.orientation,
  };
}
