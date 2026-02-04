import sharp from "sharp";

export type Metadata = {
  file: string;
  camera: string;
  date: string | null;
  width: number;
  height: number;
  format: keyof sharp.FormatEnum;
  hasAlpha: boolean;
  orientation: number | undefined;
};
