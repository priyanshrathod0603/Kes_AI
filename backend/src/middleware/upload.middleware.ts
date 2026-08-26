import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { randomUUID } from 'crypto';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'file' ? 'pdfs' : 'worksheets';
    // process.cwd() is the backend directory, so storage is at backend/storage
    const storagePath = path.join(process.cwd(), 'storage', dir);
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    cb(null, storagePath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = randomUUID() + ext;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'file' && file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
});
