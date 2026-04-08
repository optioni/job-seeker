import { Injectable } from '@nestjs/common';
import Parser from 'rss-parser';

export interface CandidateListing {
    externalId: string
    url: string
    title: string
    company: string
    description: string
    scrapedAt: Date
    publishedAt?: Date
}

@Injectable()
export class RssAdapter {
    private readonly parser = new Parser();

    async fetchListings(baseUrl: string, filters: Record<string, string>): Promise<CandidateListing[]> {
        const url = new URL(baseUrl);
        for (const [key, value] of Object.entries(filters)) {
            url.searchParams.set(key, value);
        }

        const feed = await this.parser.parseURL(url.toString());

        return (feed.items ?? []).map((item) => ({
            externalId: item.guid ?? item.link ?? '',
            url: item.link ?? '',
            title: item.title ?? '',
            // NOTE: Company field is not standardized in RSS. Finnish job boards may encode
            // it differently. Board-specific adapters can override this mapping if needed.
            company: (item as Record<string, unknown>)['company'] as string
                ?? item.creator
                ?? '',
            description: item.contentSnippet ?? item.content ?? (item as Record<string, unknown>)['summary'] as string ?? '',
            scrapedAt: new Date(),
            publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
        }));
    }
}
