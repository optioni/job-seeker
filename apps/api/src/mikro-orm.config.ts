import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

export default defineConfig({
    clientUrl: process.env.DATABASE_URL,
    entities: ['./dist/src/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    migrations: {
        path: './migrations',
        glob: '!(*.d).{js,ts}',
    },
    extensions: [Migrator],
});
