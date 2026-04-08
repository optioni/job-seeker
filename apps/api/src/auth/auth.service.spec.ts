import { getRepositoryToken } from '@mikro-orm/nestjs';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';

vi.mock('bcrypt', () => ({
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
}));

const mockUser: Partial<User> = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
};

const mockUserRepo = {
    findOne: vi.fn(),
    create: vi.fn(),
    getEntityManager: vi.fn().mockReturnValue({
        persistAndFlush: vi.fn(),
    }),
};

const mockJwtService = {
    sign: vi.fn().mockReturnValue('signed_jwt_token'),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        vi.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getRepositoryToken(User), useValue: mockUserRepo },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe('login', () => {
        it('returns access token for valid credentials', async () => {
            mockUserRepo.findOne.mockResolvedValue(mockUser);
            vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

            const result = await service.login('test@example.com', 'correct_password');

            expect(result).toEqual({ accessToken: 'signed_jwt_token' });
            expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: 'user-1', email: 'test@example.com' });
        });

        it('throws UnauthorizedException when user not found', async () => {
            mockUserRepo.findOne.mockResolvedValue(null);

            await expect(service.login('unknown@example.com', 'password')).rejects.toThrow(UnauthorizedException);
        });

        it('throws UnauthorizedException when password does not match', async () => {
            mockUserRepo.findOne.mockResolvedValue(mockUser);
            vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

            await expect(service.login('test@example.com', 'wrong_password')).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('register', () => {
        it('creates user and returns access token', async () => {
            mockUserRepo.findOne.mockResolvedValue(null);
            mockUserRepo.create.mockReturnValue({ ...mockUser });

            const result = await service.register('new@example.com', 'password123');

            expect(result).toEqual({ accessToken: 'signed_jwt_token' });
            expect(mockUserRepo.create).toHaveBeenCalled();
            expect(mockUserRepo.getEntityManager().persistAndFlush).toHaveBeenCalled();
        });

        it('throws ConflictException when email already in use', async () => {
            mockUserRepo.findOne.mockResolvedValue(mockUser);

            await expect(service.register('test@example.com', 'password123')).rejects.toThrow(ConflictException);
        });
    });
});
