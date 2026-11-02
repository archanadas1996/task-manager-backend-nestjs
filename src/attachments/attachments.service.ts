import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { unlink } from 'node:fs/promises';

@Injectable()
export class AttachmentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Upload a file and save its details in PostgreSQL
  async upload(taskId: number, userId: number, file: Express.Multer.File) {
    try {
      const result = await this.databaseService.query(
        `INSERT INTO task_attachments
          (
            task_id,
            uploaded_by,
            original_name,
            stored_name,
            mime_type,
            file_size
          )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING
           id,
           task_id,
           uploaded_by,
           original_name,
           mime_type,
           file_size,
           created_at`,
        [
          taskId,
          userId,
          file.originalname,
          file.filename,
          file.mimetype,
          file.size,
        ],
      );

      return result.rows[0];
    } catch (error) {
      // Remove the physical file if saving its metadata fails
      await unlink(file.path).catch(() => undefined);
      throw error;
    }
  }

  // Get all attachments belonging to a task
  async getByTask(taskId: number) {
    const result = await this.databaseService.query(
      `SELECT
         id,
         task_id,
         uploaded_by,
         original_name,
         mime_type,
         file_size,
         created_at
       FROM task_attachments
       WHERE task_id = $1
       ORDER BY created_at DESC`,
      [taskId],
    );

    return result.rows;
  }

  // Get file details using the attachment ID
  async getFileById(id: number) {
    const result = await this.databaseService.query(
      `SELECT
         id,
         task_id,
         original_name,
         stored_name,
         mime_type,
         file_size
       FROM task_attachments
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Attachment not found');
    }

    return result.rows[0];
  }
}
