import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async register(email: string, password: string): Promise<{ accessToken: string }> {
        const existing = await this.userRepository.findOne({ email });
        if (existing) {
            throw new ConflictException('Email already in use');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({ email, passwordHash, createdAt: new Date() });
        const em = this.userRepository.getEntityManager();
        em.persist(user);
        await em.flush();

        const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
        return { accessToken };
    }

    async login(email: string, password: string): Promise<{ accessToken: string }> {
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
        return { accessToken };
    }
}
