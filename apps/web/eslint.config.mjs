import createConfig from '@juuso.piikkila/eslint-config-typescript';

export default createConfig(
    {
        vue: true,
        tsconfigPath: './tsconfig.json',
        ignores: ['.nuxt/', '.output/', 'dist/'],
    },
    {
        rules: {
            'import/no-extraneous-dependencies': 'off',
            'canonical/filename-match-regex': 'off',
            'vue/component-name-in-template-casing': 'off',
        },
    },
    {
        files: ['**/*.spec.ts'],
        rules: {
            '@typescript-eslint/naming-convention': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
    {
        // nuxt.config.ts uses Google Font family names as object keys (PascalCase / spaced)
        files: ['nuxt.config.ts'],
        rules: {
            '@typescript-eslint/naming-convention': 'off',
        },
    },
);
