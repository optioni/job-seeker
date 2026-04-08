import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.spec.ts', 'src/**/*.module.ts', 'src/main.ts', 'src/mikro-orm.config.ts', 'src/seed.ts'],
            thresholds: {
                lines: 80,
                branches: 75,
            },
        },
    },
    oxc: false,
    plugins: [
        swc.vite({
            module: {
                type: 'es6',
            },
            jsc: {
                parser: {
                    syntax: 'typescript',
                    decorators: true,
                },
                transform: {
                    decoratorMetadata: true,
                    legacyDecorator: true,
                },
                target: 'es2021',
            },
        }),
    ],
});
