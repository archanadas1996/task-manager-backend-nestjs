import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import type { Task } from './interfaces/task.interface';

const allowedStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

@Injectable()
export class TasksService {
  constructor(private readonly databaseService: DatabaseService) {}

  // GET /api/tasks
  async getTasks(): Promise<Task[]> {
    const result = await this.databaseService.query<Task>(
      `SELECT id, title, description, status,
              project_id, assigned_to, created_at
       FROM tasks
       ORDER BY id`,
    );

    return result.rows;
  }

  // GET /api/tasks/:id
  async getTaskById(id: number): Promise<Task> {
    const result = await this.databaseService.query<Task>(
      `SELECT id, title, description, status,
              project_id, assigned_to, created_at
       FROM tasks
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return result.rows[0];
  }

  // POST /api/tasks
  async createTask(body: Partial<Task>): Promise<Task> {
    const {
      title,
      description = null,
      status = 'TODO',
      project_id = null,
      assigned_to = null,
    } = body;

    if (!title || !title.trim()) {
      throw new BadRequestException('Task title is required');
    }

    if (!allowedStatuses.includes(status as string)) {
      throw new BadRequestException('Invalid task status');
    }

    const result = await this.databaseService.query<Task>(
      `INSERT INTO tasks
         (title, description, status, project_id, assigned_to)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, status,
                 project_id, assigned_to, created_at`,
      [title.trim(), description, status, project_id, assigned_to],
    );

    return result.rows[0];
  }

  // PUT /api/tasks/:id
  async updateTask(id: number, body: Partial<Task>): Promise<Task> {
    const existingTask = await this.getTaskById(id);

    const title = body.title ?? existingTask.title;
    const description = body.description ?? existingTask.description;
    const status = body.status ?? existingTask.status;
    const project_id = body.project_id ?? existingTask.project_id;
    const assigned_to = body.assigned_to ?? existingTask.assigned_to;

    if (!title || !title.trim()) {
      throw new BadRequestException('Task title is required');
    }

    if (status !== null && !allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid task status');
    }

    const result = await this.databaseService.query<Task>(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           project_id = $4,
           assigned_to = $5
       WHERE id = $6
       RETURNING id, title, description, status,
                 project_id, assigned_to, created_at`,
      [title.trim(), description, status, project_id, assigned_to, id],
    );

    return result.rows[0];
  }

  // DELETE /api/tasks/:id
  async deleteTask(id: number): Promise<void> {
    const result = await this.databaseService.query(
      `DELETE FROM tasks WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
}
