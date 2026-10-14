import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import type { Comment } from './interfaces/comment.interface';

@Injectable()
export class CommentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // GET /api/comments
  async getComments(): Promise<Comment[]> {
    const result = await this.databaseService.query<Comment>(
      `SELECT id, task_id, user_id, content, created_at
       FROM comments
       ORDER BY id`,
    );

    return result.rows;
  }

  // GET /api/comments/:id
  async getCommentById(id: number): Promise<Comment> {
    const result = await this.databaseService.query<Comment>(
      `SELECT id, task_id, user_id, content, created_at
       FROM comments
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return result.rows[0];
  }

  // POST /api/comments
  async createComment(body: {
    task_id: number;
    user_id: number;
    content: string;
  }): Promise<Comment> {
    const { task_id, user_id, content } = body;

    if (
      !Number.isInteger(task_id) ||
      task_id <= 0 ||
      !Number.isInteger(user_id) ||
      user_id <= 0 ||
      !content?.trim()
    ) {
      throw new BadRequestException(
        'Valid task_id, user_id and content are required',
      );
    }

    const result = await this.databaseService.query<Comment>(
      `INSERT INTO comments (task_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, task_id, user_id, content, created_at`,
      [task_id, user_id, content.trim()],
    );

    return result.rows[0];
  }

  // PUT /api/comments/:id
  async updateComment(id: number, body: { content: string }): Promise<Comment> {
    if (!body.content?.trim()) {
      throw new BadRequestException('Comment content is required');
    }

    const result = await this.databaseService.query<Comment>(
      `UPDATE comments
       SET content = $1
       WHERE id = $2
       RETURNING id, task_id, user_id, content, created_at`,
      [body.content.trim(), id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return result.rows[0];
  }

  // DELETE /api/comments/:id
  async deleteComment(id: number): Promise<void> {
    const result = await this.databaseService.query(
      `DELETE FROM comments WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }
}
