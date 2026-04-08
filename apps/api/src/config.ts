import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
    DATABASE_HOST: Joi.string().required(),
    DATABASE_PORT: Joi.number().default(5432),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    REDIS_URL: Joi.string().default('redis://localhost:6379'),
    ANTHROPIC_API_KEY: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    PORT: Joi.number().default(3000),
    REGISTRATION_ENABLED: Joi.boolean().default(true),
    GOTENBERG_URL: Joi.string().default('http://gotenberg:3000'),
    SMTP_HOST: Joi.string().required(),
    SMTP_PORT: Joi.number().default(587),
    SMTP_USER: Joi.string().required(),
    SMTP_PASS: Joi.string().required(),
    SMTP_FROM: Joi.string().required(),
});

export interface AppConfig {
    DATABASE_HOST: string
    DATABASE_PORT: number
    DATABASE_USER: string
    DATABASE_PASSWORD: string
    DATABASE_NAME: string
    REDIS_URL: string
    ANTHROPIC_API_KEY: string
    JWT_SECRET: string
    PORT: number
    REGISTRATION_ENABLED: boolean
    GOTENBERG_URL: string
    SMTP_HOST: string
    SMTP_PORT: number
    SMTP_USER: string
    SMTP_PASS: string
    SMTP_FROM: string
}
