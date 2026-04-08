import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { JobPreferences } from '../entities/job-preferences.entity';

@Injectable()
export class PreferencesService {
    constructor(
        @InjectRepository(JobPreferences)
        private readonly preferencesRepo: EntityRepository<JobPreferences>,
        private readonly em: EntityManager,
    ) {}

    async get(userId: string): Promise<JobPreferences | null> {
        return this.preferencesRepo.findOne({ user: userId });
    }

    async upsert(userId: string, data: Partial<JobPreferences>): Promise<JobPreferences> {
        let preferences = await this.preferencesRepo.findOne({ user: userId });
        if (preferences) {
            this.preferencesRepo.assign(preferences, data);
        } else {
            preferences = this.preferencesRepo.create({ ...data, user: userId } as unknown as JobPreferences);
            this.em.persist(preferences);
        }

        await this.em.flush();
        return preferences;
    }
}
