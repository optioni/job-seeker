import { type EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';

import { JobSourcePresetSeeder } from './job-source-preset.seeder';

export class DatabaseSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        await this.call(em, [JobSourcePresetSeeder]);
    }
}
