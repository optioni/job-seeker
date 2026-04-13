/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';

import { type FilterConfigField, JobSourcePreset } from '../entities/job-source-preset.entity';

const presets: Array<{
    name: string
    baseUrl: string
    filterConfig: FilterConfigField[]
    defaultLanguage: 'fi' | 'en'
}> = [
    {
        name: 'TE-palvelut',
        baseUrl: 'https://paikat.te-palvelut.fi/tpt-web/feeds/rss/list',
        filterConfig: [
            { key: 'keyword', label: 'Keyword', type: 'text', urlParam: 'keyword' },
            { key: 'location', label: 'Location', type: 'text', urlParam: 'municipality' },
            { key: 'type', label: 'Employment Type', type: 'text', urlParam: 'employmentType' },
        ],
        defaultLanguage: 'fi',
    },
    {
        name: 'Duunitori',
        baseUrl: 'https://duunitori.fi/tyopaikat/rss',
        filterConfig: [
            { key: 'keyword', label: 'Keyword', type: 'text', urlParam: 'haku' },
            { key: 'location', label: 'Location', type: 'text', urlParam: 'sijainti' },
        ],
        defaultLanguage: 'fi',
    },
    {
        name: 'Oikotie Työpaikat',
        baseUrl: 'https://tyopaikat.oikotie.fi/rss',
        filterConfig: [
            { key: 'keyword', label: 'Keyword', type: 'text', urlParam: 'q' },
            { key: 'location', label: 'Location', type: 'text', urlParam: 'location' },
        ],
        defaultLanguage: 'fi',
    },
    {
        name: 'Indeed Finland',
        baseUrl: 'https://fi.indeed.com/rss',
        filterConfig: [
            { key: 'keyword', label: 'Keyword', type: 'text', urlParam: 'q' },
            { key: 'location', label: 'Location', type: 'text', urlParam: 'l' },
        ],
        defaultLanguage: 'fi',
    },
    {
        name: 'Kuntarekry',
        baseUrl: 'https://www.kuntarekry.fi/fi/rss',
        filterConfig: [
            { key: 'keyword', label: 'Keyword', type: 'text', urlParam: 'searchText' },
            { key: 'location', label: 'Location', type: 'text', urlParam: 'municipality' },
        ],
        defaultLanguage: 'fi',
    },
    {
        name: 'Valtiolle.fi',
        baseUrl: 'https://www.valtiolle.fi/rss',
        filterConfig: [
            { key: 'keyword', label: 'Keyword', type: 'text', urlParam: 'keyword' },
        ],
        defaultLanguage: 'fi',
    },
];

export class JobSourcePresetSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        for (const presetData of presets) {
            const existing = await em.findOne(JobSourcePreset, { name: presetData.name });

            if (existing) {
                existing.baseUrl = presetData.baseUrl;
                existing.filterConfig = presetData.filterConfig;
                existing.defaultLanguage = presetData.defaultLanguage;
                console.log(`Updated preset: ${presetData.name}`);
            } else {
                em.create(JobSourcePreset, presetData);
                console.log(`Created preset: ${presetData.name}`);
            }
        }
    }
}
