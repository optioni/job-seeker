/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';

import { JobSourcePreset } from '../entities/job-source-preset.entity';

const presets = [
    {
        name: 'TE-palvelut',
        baseUrl: 'https://paikat.te-palvelut.fi/tpt-web/feeds/rss/list',
        filterConfig: { keyword: 'keyword', location: 'municipality', type: 'employmentType' },
        defaultLanguage: 'fi' as const,
        defaultPollingInterval: 60,
    },
    {
        name: 'Duunitori',
        baseUrl: 'https://duunitori.fi/tyopaikat/rss',
        filterConfig: { keyword: 'haku', location: 'sijainti' },
        defaultLanguage: 'fi' as const,
        defaultPollingInterval: 60,
    },
    {
        name: 'Oikotie Työpaikat',
        baseUrl: 'https://tyopaikat.oikotie.fi/rss',
        filterConfig: { keyword: 'q', location: 'location' },
        defaultLanguage: 'fi' as const,
        defaultPollingInterval: 60,
    },
    {
        name: 'Indeed Finland',
        baseUrl: 'https://fi.indeed.com/rss',
        filterConfig: { keyword: 'q', location: 'l' },
        defaultLanguage: 'fi' as const,
        defaultPollingInterval: 120,
    },
    {
        name: 'Kuntarekry',
        baseUrl: 'https://www.kuntarekry.fi/fi/rss',
        filterConfig: { keyword: 'searchText', location: 'municipality' },
        defaultLanguage: 'fi' as const,
        defaultPollingInterval: 60,
    },
    {
        name: 'Valtiolle.fi',
        baseUrl: 'https://www.valtiolle.fi/rss',
        filterConfig: { keyword: 'keyword' },
        defaultLanguage: 'fi' as const,
        defaultPollingInterval: 120,
    },
];

export class JobSourcePresetSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        for (const presetData of presets) {
            const existing = await em.findOne(JobSourcePreset, { name: presetData.name });

            if (existing) {
                console.log(`Preset already exists, skipping: ${presetData.name}`);
            } else {
                em.create(JobSourcePreset, presetData);
                console.log(`Created preset: ${presetData.name}`);
            }
        }
    }
}
