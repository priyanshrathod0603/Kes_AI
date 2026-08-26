import fs from 'fs';
import path from 'path';
import { statSync } from 'fs';

export const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const getFileInfo = (filePath: string) => {
  const stats = statSync(filePath);
  return {
    size: stats.size,
    name: path.basename(filePath),
    path: filePath,
  };
};
