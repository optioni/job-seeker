import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '../../.env') });

const host = process.env.DATABASE_HOST;
const port = process.env.DATABASE_PORT ? Number.parseInt(process.env.DATABASE_PORT, 10) : 5432;
const user = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const databaseName = process.env.DATABASE_NAME;

if (!host || !user || !password || !databaseName) {
    throw new Error('DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD and DATABASE_NAME environment variables are required');
}

export default defineConfig({
    host,
    port,
    user,
    password,
    dbName: databaseName,
    metadataProvider: ReflectMetadataProvider,
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    migrations: {
        path: './migrations',
        glob: '!(*.d).{js,ts}',
    },
    extensions: [Migrator],
});
