import createConfig from '@juuso.piikkila/eslint-config-typescript';

export default createConfig(
    {
        tsconfigPath: './tsconfig.json',
        ignores: ['dist/', 'migrations/'],
    },
    {
        rules: {
            'import/no-extraneous-dependencies': 'off',
            // reflect-metadata is a side-effect-only import required by NestJS decorators
            'import/no-unassigned-import': ['error', { allow: ['reflect-metadata'] }],
        },
    },
    {
        // env var names in config.ts must use UPPER_CASE — this is not a naming bug
        files: ['src/config.ts'],
        rules: {
            '@typescript-eslint/naming-convention': 'off',
        },
    },
    {
        // test mock objects for env vars must use UPPER_CASE keys
        files: ['src/**/*.spec.ts'],
        rules: {
            '@typescript-eslint/naming-convention': 'off',
        },
    },
    {
        // seed.ts is a CLI script that legitimately prints output
        files: ['src/seed.ts'],
        rules: {
            'no-console': 'off',
        },
    },
    {
        // format-cv.ts has high complexity due to comprehensive CV formatting logic
        files: ['src/matching/format-cv.ts'],
        rules: {
            complexity: ['error', 45],
        },
    },
);
