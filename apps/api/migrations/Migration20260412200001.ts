import { Migration } from '@mikro-orm/migrations';

export class Migration20260412200001 extends Migration {

    override async up(): Promise<void> {
        // Drop unique constraint on (source_id, external_id)
        this.addSql(`alter table "job_listings" drop constraint "job_listings_source_id_external_id_unique";`);

        // Add preset_id column (nullable for backfill)
        this.addSql(`alter table "job_listings" add "preset_id" uuid null;`);

        // Backfill preset_id from job_sources
        this.addSql(`update "job_listings" jl set "preset_id" = js."preset_id" from "job_sources" js where jl."source_id" = js."id";`);

        // Add FK constraint on preset_id
        this.addSql(`alter table "job_listings" add constraint "job_listings_preset_id_foreign" foreign key ("preset_id") references "job_source_presets" ("id");`);

        // Add unique constraint on (preset_id, external_id)
        this.addSql(`alter table "job_listings" add constraint "job_listings_preset_id_external_id_unique" unique ("preset_id", "external_id");`);

        // Drop old FK constraint on source_id
        this.addSql(`alter table "job_listings" drop constraint "job_listings_source_id_foreign";`);

        // Drop source_id column
        this.addSql(`alter table "job_listings" drop column "source_id";`);
    }

    override down(): void | Promise<void> {
        this.addSql(`alter table "job_listings" drop constraint "job_listings_preset_id_external_id_unique";`);
        this.addSql(`alter table "job_listings" drop constraint "job_listings_preset_id_foreign";`);
        this.addSql(`alter table "job_listings" drop column "preset_id";`);
        this.addSql(`alter table "job_listings" add "source_id" uuid not null;`);
        this.addSql(`alter table "job_listings" add constraint "job_listings_source_id_foreign" foreign key ("source_id") references "job_sources" ("id");`);
        this.addSql(`alter table "job_listings" add constraint "job_listings_source_id_external_id_unique" unique ("source_id", "external_id");`);
    }

}
