import {
    Body,
    Controller,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

class AuthDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8)
    password!: string;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() body: AuthDto): Promise<{ accessToken: string }> {
        if (process.env.REGISTRATION_ENABLED === 'false') {
            throw new ForbiddenException('Registration is disabled');
        }
        return this.authService.register(body.email, body.password);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: AuthDto): Promise<{ accessToken: string }> {
        return this.authService.login(body.email, body.password);
    }
}
