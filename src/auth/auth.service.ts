import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(username: string, password: string) {
    const existing = await this.usersService.findByUsername(username);
    if (existing) {
      throw new UnauthorizedException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser(
      username,
      passwordHash,
      UserRole.USER,
    );

    return this.signToken(user.id, user.username, user.role);
  }

  private async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    return user;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user.id, user.username, user.role);
  }

  private signToken(userId: number, username: string, role: UserRole) {
    const payload = { sub: userId, username, role };
    return {
      access_token: this.jwt.sign(payload),
    };
  }
}
