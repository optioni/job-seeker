import { Migration } from '@mikro-orm/migrations';

export class Migration20260412191728 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "job_sources" add "language" varchar(255) null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "job_sources" drop column "language";`);
  }

}
