import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

export const UPLOAD_DIRECTORY = join(process.cwd(), 'uploads');

mkdirSync(UPLOAD_DIRECTORY, { recursive: true });

const allowedTypes: Record<string, string[]> = {
  '.pdf': ['application/pdf'],

  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],

  '.doc': ['application/msword'],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],

  '.txt': ['text/plain'],
  '.csv': ['text/csv', 'application/vnd.ms-excel'],
};

export const AttachmentUploadInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: UPLOAD_DIRECTORY,

    filename: (_req, file, callback) => {
      const extension = extname(file.originalname).toLowerCase();

      callback(null, `${randomUUID()}${extension}`);
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },

  fileFilter: (_req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();
    const validMimes = allowedTypes[extension];

    if (!validMimes || !validMimes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          'Unsupported file type. Allowed: PDF, images, DOC, DOCX, TXT and CSV.',
        ),
        false,
      );
    }

    callback(null, true);
  },
});
