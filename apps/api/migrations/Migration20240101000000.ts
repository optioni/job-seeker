import { Migration } from '@mikro-orm/migrations';

export class Migration20240101000000 extends Migration {
    async up(): Promise<void> {
        this.addSql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

        this.addSql(`
            CREATE TABLE "users" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "email" varchar NOT NULL UNIQUE,
                "password_hash" varchar NOT NULL,
                "created_at" timestamptz NOT NULL DEFAULT now()
            );
        `);

        this.addSql(`
            CREATE TABLE "cv_profiles" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
                "personal_info" jsonb,
                "summary" text
            );
        `);

        this.addSql(`
            CREATE TABLE "work_experiences" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "cv_profile_id" uuid NOT NULL REFERENCES "cv_profiles" ("id") ON DELETE CASCADE,
                "company" varchar NOT NULL,
                "role" varchar NOT NULL,
                "start_date" varchar NOT NULL,
                "end_date" varchar,
                "current" boolean,
                "description" text NOT NULL,
                "highlights" jsonb
            );
        `);

        this.addSql(`
            CREATE TABLE "educations" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "cv_profile_id" uuid NOT NULL REFERENCES "cv_profiles" ("id") ON DELETE CASCADE,
                "institution" varchar NOT NULL,
                "degree" varchar NOT NULL,
                "field" varchar NOT NULL,
                "start_date" varchar NOT NULL,
                "end_date" varchar,
                "current" boolean
            );
        `);

        this.addSql(`
            CREATE TABLE "skills" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "cv_profile_id" uuid NOT NULL REFERENCES "cv_profiles" ("id") ON DELETE CASCADE,
                "name" varchar NOT NULL,
                "level" varchar,
                "category" varchar
            );
        `);

        this.addSql(`
            CREATE TABLE "languages" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "cv_profile_id" uuid NOT NULL REFERENCES "cv_profiles" ("id") ON DELETE CASCADE,
                "language" varchar NOT NULL,
                "proficiency" varchar NOT NULL
            );
        `);

        this.addSql(`
            CREATE TABLE "certifications" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "cv_profile_id" uuid NOT NULL REFERENCES "cv_profiles" ("id") ON DELETE CASCADE,
                "name" varchar NOT NULL,
                "issuer" varchar NOT NULL,
                "date" varchar NOT NULL,
                "url" varchar
            );
        `);

        this.addSql(`
            CREATE TABLE "projects" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "cv_profile_id" uuid NOT NULL REFERENCES "cv_profiles" ("id") ON DELETE CASCADE,
                "name" varchar NOT NULL,
                "description" text NOT NULL,
                "url" varchar,
                "technologies" jsonb
            );
        `);

        this.addSql(`
            CREATE TABLE "job_preferences" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "user_id" uuid NOT NULL UNIQUE REFERENCES "users" ("id") ON DELETE CASCADE,
                "locations" jsonb NOT NULL,
                "job_type" varchar,
                "target_role" varchar,
                "seniority" varchar,
                "salary_min" int,
                "salary_max" int,
                "desired_industries" jsonb,
                "excluded_industries" jsonb,
                "default_language" varchar NOT NULL DEFAULT 'fi'
            );
        `);

        this.addSql(`
            CREATE TABLE "job_source_presets" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "name" varchar NOT NULL UNIQUE,
                "base_url" varchar NOT NULL,
                "filter_config" jsonb NOT NULL,
                "default_language" varchar NOT NULL,
                "default_polling_interval" int NOT NULL
            );
        `);

        this.addSql(`
            CREATE TABLE "job_sources" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
                "preset_id" uuid NOT NULL REFERENCES "job_source_presets" ("id") ON DELETE RESTRICT,
                "label" varchar NOT NULL,
                "filters" jsonb NOT NULL,
                "language" varchar,
                "polling_interval" int NOT NULL,
                "active" boolean NOT NULL DEFAULT true,
                "created_at" timestamptz NOT NULL DEFAULT now()
            );
        `);

        this.addSql(`
            CREATE TABLE "job_listings" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "source_id" uuid NOT NULL REFERENCES "job_sources" ("id") ON DELETE CASCADE,
                "external_id" varchar NOT NULL,
                "url" text NOT NULL,
                "title" varchar NOT NULL,
                "company" varchar NOT NULL,
                "description" text NOT NULL,
                "scraped_at" timestamptz NOT NULL,
                "published_at" timestamptz,
                UNIQUE ("source_id", "external_id")
            );
        `);

        this.addSql(`
            CREATE TABLE "job_applications" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "listing_id" uuid NOT NULL UNIQUE REFERENCES "job_listings" ("id") ON DELETE CASCADE,
                "matched" boolean NOT NULL,
                "match_score" int,
                "match_rationale" text,
                "tailored_cv_snapshot" jsonb,
                "cover_letter_text" text,
                "emailed_at" timestamptz,
                "created_at" timestamptz NOT NULL DEFAULT now()
            );
        `);
    }

    async down(): Promise<void> {
        this.addSql(`DROP TABLE IF EXISTS "job_applications";`);
        this.addSql(`DROP TABLE IF EXISTS "job_listings";`);
        this.addSql(`DROP TABLE IF EXISTS "job_sources";`);
        this.addSql(`DROP TABLE IF EXISTS "job_source_presets";`);
        this.addSql(`DROP TABLE IF EXISTS "job_preferences";`);
        this.addSql(`DROP TABLE IF EXISTS "projects";`);
        this.addSql(`DROP TABLE IF EXISTS "certifications";`);
        this.addSql(`DROP TABLE IF EXISTS "languages";`);
        this.addSql(`DROP TABLE IF EXISTS "skills";`);
        this.addSql(`DROP TABLE IF EXISTS "educations";`);
        this.addSql(`DROP TABLE IF EXISTS "work_experiences";`);
        this.addSql(`DROP TABLE IF EXISTS "cv_profiles";`);
        this.addSql(`DROP TABLE IF EXISTS "users";`);
    }
}
