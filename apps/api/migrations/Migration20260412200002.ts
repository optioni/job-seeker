import { Migration } from '@mikro-orm/migrations';

// NOTE: user_id is added as nullable. Existing job_application rows will have user_id = null
// and will be invisible to ApplicationsService queries until re-processed.
// Backfill via job_listings.source_id → job_sources.user_id is not possible here because
// Migration20260412200001 already dropped source_id. This migration assumes a greenfield
// deployment with no pre-existing application rows.
export class Migration20260412200002 extends Migration {

    override up(): void | Promise<void> {
        this.addSql(`alter table "job_applications" add "user_id" uuid null;`);
        this.addSql(`alter table "job_applications" add constraint "job_applications_user_id_foreign" foreign key ("user_id") references "users" ("id");`);
    }

    override down(): void | Promise<void> {
        this.addSql(`alter table "job_applications" drop constraint "job_applications_user_id_foreign";`);
        this.addSql(`alter table "job_applications" drop column "user_id";`);
    }

}
