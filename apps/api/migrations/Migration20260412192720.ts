import { Migration } from '@mikro-orm/migrations';

export class Migration20260412192720 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "job_sources" drop column "language";`);
    this.addSql(`alter table "job_sources" alter column "label" drop not null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "job_sources" add "language" varchar(255) null;`);
    this.addSql(`alter table "job_sources" alter column "label" set not null;`);
  }

}
