import { ConflictException, Injectable } from '@nestjs/common';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [];
  private nextId = 1;

  async create(email: string, passwordHash: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user: User = {
      id: this.nextId++,
      email: normalizedEmail,
      passwordHash,
    };

    this.users.push(user);

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = email.trim().toLowerCase();

    return this.users.find((user) => user.email === normalizedEmail);
  }

  async findById(id: number): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }
}
