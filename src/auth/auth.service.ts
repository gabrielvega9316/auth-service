import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UsersService } from 'src/users/users.service';
import { SnsEventsPublisher } from 'src/aws/sns-events.publisher';

export interface JwtPayload {
  sub: number;
  email: string;
}

export interface AuthUserResponse {
  id: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly snsEventsPublisher: SnsEventsPublisher,
  ) {}

  async register(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(email, passwordHash);

    await this.snsEventsPublisher.publishUserCreated({
      userId: user.id,
      email: user.email,
    });

    return this.buildAuthResponse(user);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: this.toUserResponse(user),
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async getProfile(userId: number): Promise<AuthUserResponse> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.toUserResponse(user);
  }

  private buildAuthResponse(user: User) {
    return this.toUserResponse(user);
  }

  private toUserResponse(user: User): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
