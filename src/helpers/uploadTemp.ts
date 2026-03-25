import fs from "fs/promises";
import path from "path";

type MulterFile = Express.Multer.File;

export const saveTempFile = async (
  buffer: Buffer,
  filename?: string
) => {
  const tempDir = path.join(process.cwd(), "public/temp");

  await fs.mkdir(tempDir, { recursive: true });

  const filePath = path.join(
    tempDir,
    filename ?? `upload_${Date.now()}`
  );

  await fs.writeFile(filePath, buffer);

  return filePath;
};

export const deleteTempFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.error("Failed to delete temp file:", err);
  }
};
