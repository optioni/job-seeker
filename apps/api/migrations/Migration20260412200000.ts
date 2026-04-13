import { Migration } from '@mikro-orm/migrations';

export class Migration20260412200000 extends Migration {

    override up(): void | Promise<void> {
        this.addSql(`alter table "job_source_presets" add "last_polled_at" timestamptz null;`);
    }

    override down(): void | Promise<void> {
        this.addSql(`alter table "job_source_presets" drop column "last_polled_at";`);
    }

}
