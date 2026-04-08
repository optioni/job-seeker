import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        include: ['**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            thresholds: {
                lines: 70,
            },
        },
    },
});
