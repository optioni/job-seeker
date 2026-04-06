import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/postgresql';
import config from './mikro-orm.config';
import { JobSourcePreset } from './entities/job-source-preset.entity';

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

async function seed(): Promise<void> {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    try {
        for (const presetData of presets) {
            const existing = await em.findOne(JobSourcePreset, { name: presetData.name });

            if (!existing) {
                const preset = em.create(JobSourcePreset, presetData);
                em.persist(preset);
                console.log(`Created preset: ${presetData.name}`);
            } else {
                console.log(`Preset already exists, skipping: ${presetData.name}`);
            }
        }

        await em.flush();
        console.log('Seed completed successfully.');
    } finally {
        await orm.close();
    }
}

seed().catch((err: unknown) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
