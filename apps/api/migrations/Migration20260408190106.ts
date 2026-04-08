import { Migration } from '@mikro-orm/migrations';

export class Migration20260408190106 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "job_source_presets" ("id" uuid not null, "name" varchar(255) not null, "base_url" varchar(255) not null, "filter_config" jsonb not null, "default_language" varchar(255) not null, "default_polling_interval" int not null, primary key ("id"));`);
    this.addSql(`alter table "job_source_presets" add constraint "job_source_presets_name_unique" unique ("name");`);

    this.addSql(`create table "users" ("id" uuid not null, "email" varchar(255) not null, "password_hash" varchar(255) not null, "created_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`create table "job_sources" ("id" uuid not null, "user_id" uuid not null, "preset_id" uuid not null, "label" varchar(255) not null, "filters" jsonb not null, "language" varchar(255) null, "polling_interval" int not null, "active" boolean not null default true, "created_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`create table "job_listings" ("id" uuid not null, "source_id" uuid not null, "external_id" varchar(255) not null, "url" text not null, "title" varchar(255) not null, "company" varchar(255) not null, "description" text not null, "scraped_at" timestamptz not null, "published_at" timestamptz null, primary key ("id"));`);
    this.addSql(`alter table "job_listings" add constraint "job_listings_source_id_external_id_unique" unique ("source_id", "external_id");`);

    this.addSql(`create table "job_applications" ("id" uuid not null, "listing_id" uuid not null, "matched" boolean not null, "match_score" int null, "match_rationale" text null, "tailored_cv_snapshot" jsonb null, "cover_letter_text" text null, "emailed_at" timestamptz null, "created_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "job_applications" add constraint "job_applications_listing_id_unique" unique ("listing_id");`);

    this.addSql(`create table "job_preferences" ("id" uuid not null, "user_id" uuid not null, "locations" jsonb not null, "job_type" varchar(255) null, "target_role" varchar(255) null, "seniority" varchar(255) null, "salary_min" int null, "salary_max" int null, "desired_industries" jsonb null, "excluded_industries" jsonb null, "default_language" varchar(255) not null default 'fi', primary key ("id"));`);
    this.addSql(`alter table "job_preferences" add constraint "job_preferences_user_id_unique" unique ("user_id");`);

    this.addSql(`create table "cv_profiles" ("id" uuid not null, "user_id" uuid not null, "personal_info" jsonb null, "summary" text null, primary key ("id"));`);

    this.addSql(`create table "skills" ("id" uuid not null, "cv_profile_id" uuid not null, "name" varchar(255) not null, "level" varchar(255) null, "category" varchar(255) null, primary key ("id"));`);

    this.addSql(`create table "projects" ("id" uuid not null, "cv_profile_id" uuid not null, "name" varchar(255) not null, "description" text not null, "url" varchar(255) null, "technologies" jsonb null, primary key ("id"));`);

    this.addSql(`create table "languages" ("id" uuid not null, "cv_profile_id" uuid not null, "language" varchar(255) not null, "proficiency" varchar(255) not null, primary key ("id"));`);

    this.addSql(`create table "educations" ("id" uuid not null, "cv_profile_id" uuid not null, "institution" varchar(255) not null, "degree" varchar(255) not null, "field" varchar(255) not null, "start_date" varchar(255) not null, "end_date" varchar(255) null, "current" boolean null, primary key ("id"));`);

    this.addSql(`create table "certifications" ("id" uuid not null, "cv_profile_id" uuid not null, "name" varchar(255) not null, "issuer" varchar(255) not null, "date" varchar(255) not null, "url" varchar(255) null, primary key ("id"));`);

    this.addSql(`create table "work_experiences" ("id" uuid not null, "cv_profile_id" uuid not null, "company" varchar(255) not null, "role" varchar(255) not null, "start_date" varchar(255) not null, "end_date" varchar(255) null, "current" boolean null, "description" text not null, "highlights" jsonb null, primary key ("id"));`);

    this.addSql(`alter table "job_sources" add constraint "job_sources_user_id_foreign" foreign key ("user_id") references "users" ("id");`);
    this.addSql(`alter table "job_sources" add constraint "job_sources_preset_id_foreign" foreign key ("preset_id") references "job_source_presets" ("id");`);

    this.addSql(`alter table "job_listings" add constraint "job_listings_source_id_foreign" foreign key ("source_id") references "job_sources" ("id");`);

    this.addSql(`alter table "job_applications" add constraint "job_applications_listing_id_foreign" foreign key ("listing_id") references "job_listings" ("id");`);

    this.addSql(`alter table "job_preferences" add constraint "job_preferences_user_id_foreign" foreign key ("user_id") references "users" ("id");`);

    this.addSql(`alter table "cv_profiles" add constraint "cv_profiles_user_id_foreign" foreign key ("user_id") references "users" ("id");`);

    this.addSql(`alter table "skills" add constraint "skills_cv_profile_id_foreign" foreign key ("cv_profile_id") references "cv_profiles" ("id");`);

    this.addSql(`alter table "projects" add constraint "projects_cv_profile_id_foreign" foreign key ("cv_profile_id") references "cv_profiles" ("id");`);

    this.addSql(`alter table "languages" add constraint "languages_cv_profile_id_foreign" foreign key ("cv_profile_id") references "cv_profiles" ("id");`);

    this.addSql(`alter table "educations" add constraint "educations_cv_profile_id_foreign" foreign key ("cv_profile_id") references "cv_profiles" ("id");`);

    this.addSql(`alter table "certifications" add constraint "certifications_cv_profile_id_foreign" foreign key ("cv_profile_id") references "cv_profiles" ("id");`);

    this.addSql(`alter table "work_experiences" add constraint "work_experiences_cv_profile_id_foreign" foreign key ("cv_profile_id") references "cv_profiles" ("id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "job_sources" drop constraint "job_sources_preset_id_foreign";`);
    this.addSql(`alter table "job_sources" drop constraint "job_sources_user_id_foreign";`);
    this.addSql(`alter table "job_preferences" drop constraint "job_preferences_user_id_foreign";`);
    this.addSql(`alter table "cv_profiles" drop constraint "cv_profiles_user_id_foreign";`);
    this.addSql(`alter table "job_listings" drop constraint "job_listings_source_id_foreign";`);
    this.addSql(`alter table "job_applications" drop constraint "job_applications_listing_id_foreign";`);
    this.addSql(`alter table "skills" drop constraint "skills_cv_profile_id_foreign";`);
    this.addSql(`alter table "projects" drop constraint "projects_cv_profile_id_foreign";`);
    this.addSql(`alter table "languages" drop constraint "languages_cv_profile_id_foreign";`);
    this.addSql(`alter table "educations" drop constraint "educations_cv_profile_id_foreign";`);
    this.addSql(`alter table "certifications" drop constraint "certifications_cv_profile_id_foreign";`);
    this.addSql(`alter table "work_experiences" drop constraint "work_experiences_cv_profile_id_foreign";`);

    this.addSql(`drop table if exists "job_source_presets" cascade;`);
    this.addSql(`drop table if exists "users" cascade;`);
    this.addSql(`drop table if exists "job_sources" cascade;`);
    this.addSql(`drop table if exists "job_listings" cascade;`);
    this.addSql(`drop table if exists "job_applications" cascade;`);
    this.addSql(`drop table if exists "job_preferences" cascade;`);
    this.addSql(`drop table if exists "cv_profiles" cascade;`);
    this.addSql(`drop table if exists "skills" cascade;`);
    this.addSql(`drop table if exists "projects" cascade;`);
    this.addSql(`drop table if exists "languages" cascade;`);
    this.addSql(`drop table if exists "educations" cascade;`);
    this.addSql(`drop table if exists "certifications" cascade;`);
    this.addSql(`drop table if exists "work_experiences" cascade;`);
  }

}
