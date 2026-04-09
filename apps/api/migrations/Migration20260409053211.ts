import { Migration } from '@mikro-orm/migrations';

export class Migration20260409053211 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "job_source_presets" drop column "default_polling_interval";`);

    this.addSql(`alter table "job_sources" drop column "language", drop column "polling_interval";`);

    this.addSql(`alter table "job_sources" alter column "label" drop not null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "job_source_presets" add "default_polling_interval" int4 not null;`);

    this.addSql(`alter table "job_sources" add "language" varchar(255) null, add "polling_interval" int4 not null;`);

    this.addSql(`alter table "job_sources" alter column "label" set not null;`);
  }

}
