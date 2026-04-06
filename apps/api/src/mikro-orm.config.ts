import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

const clientUrl = process.env.DATABASE_URL;
if (!clientUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
    clientUrl,
    entities: ['./dist/src/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    migrations: {
        path: './migrations',
        glob: '!(*.d).{js,ts}',
    },
    extensions: [Migrator],
});
