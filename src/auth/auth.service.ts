import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const result = await this.databaseService.query(
      `SELECT id, name, email, password, role
   FROM users
   WHERE email = $1`,
      [email.trim()],
    );

    const user = result.rows[0];

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const role = String(user.role).toUpperCase();

    if (!['ADMIN', 'USER'].includes(role)) {
      throw new UnauthorizedException('Invalid user role');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
      },
    };
  }
}
