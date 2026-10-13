import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Project } from './interfaces/project.interface';

@Injectable()
export class ProjectsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getProjects(): Promise<Project[]> {
    const result = await this.databaseService.query<Project>(
      `SELECT id, name, description, created_at
       FROM projects
       ORDER BY id`,
    );

    return result.rows;
  }

  async getProjectById(id: number): Promise<Project> {
    const result = await this.databaseService.query<Project>(
      `SELECT id, name, description, created_at
       FROM projects
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Project not found');
    }

    return result.rows[0];
  }

  async createProject(data: {
    name: string;
    description?: string;
  }): Promise<Project> {
    const result = await this.databaseService.query<Project>(
      `INSERT INTO projects (name, description)
       VALUES ($1, $2)
       RETURNING id, name, description, created_at`,
      [data.name, data.description ?? null],
    );

    return result.rows[0];
  }

  async updateProject(
    id: number,
    data: {
      name?: string;
      description?: string;
    },
  ): Promise<Project> {
    const current = await this.getProjectById(id);

    const name = data.name ?? current.name;
    const description =
      data.description === undefined ? current.description : data.description;

    const result = await this.databaseService.query<Project>(
      `UPDATE projects
       SET name = $1, description = $2
       WHERE id = $3
       RETURNING id, name, description, created_at`,
      [name, description, id],
    );

    return result.rows[0];
  }

  async deleteProject(id: number): Promise<{ message: string }> {
    await this.getProjectById(id);

    await this.databaseService.query('DELETE FROM projects WHERE id = $1', [
      id,
    ]);

    return { message: 'Project deleted successfully' };
  }
}
