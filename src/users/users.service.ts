import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import type { User } from './interfaces/user.interface';

type PublicUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  // GET /api/users
  async getUsers(): Promise<PublicUser[]> {
    const result = await this.databaseService.query<PublicUser>(
      `SELECT id, name, email, created_at
     FROM users
     ORDER BY id`,
    );

    return result.rows;
  }

  // GET /api/users/:id
  async getUserById(id: number): Promise<PublicUser> {
    const result = await this.databaseService.query<PublicUser>(
      `SELECT id, name, email, created_at
     FROM users
     WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return result.rows[0];
  }

  // POST /api/users
  async createUser(body: {
    name: string;
    email: string;
    password: string;
  }): Promise<PublicUser> {
    const { name, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      throw new BadRequestException('Name, email and password are required');
    }

    // Check whether the email already exists
    const existingUser = await this.databaseService.query(
      `SELECT id FROM users WHERE email = $1`,
      [email.trim()],
    );

    if (existingUser.rows.length > 0) {
      throw new BadRequestException('Email already exists');
    }

    // Hash the password before storing it
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and return only public fields
    const result = await this.databaseService.query<PublicUser>(
      `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
      [name.trim(), email.trim(), hashedPassword],
    );

    return result.rows[0];
  }

  // PUT /api/users/:id
  async updateUser(
    id: number,
    body: { name?: string; email?: string },
  ): Promise<PublicUser> {
    const existingUser = await this.getUserById(id);

    const name = body.name ?? existingUser.name;
    const email = body.email ?? existingUser.email;

    if (!name.trim() || !email.trim()) {
      throw new BadRequestException('Name and email cannot be empty');
    }

    const result = await this.databaseService.query<PublicUser>(
      `UPDATE users
       SET name = $1, email = $2
       WHERE id = $3
       RETURNING id, name, email, created_at`,
      [name.trim(), email.trim(), id],
    );

    return result.rows[0];
  }

  // DELETE /api/users/:id
  async deleteUser(id: number): Promise<void> {
    const result = await this.databaseService.query(
      `DELETE FROM users WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
