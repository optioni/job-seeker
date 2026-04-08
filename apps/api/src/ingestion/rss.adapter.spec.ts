import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

import { RssAdapter } from './rss.adapter';

vi.mock('rss-parser', () => {
    const Parser = vi.fn(function (this: Record<string, unknown>) {
        this.parseURL = vi.fn();
    });
    return { default: Parser };
});

describe('RssAdapter', () => {
    let adapter: RssAdapter;

    beforeEach(() => {
        vi.clearAllMocks();
        adapter = new RssAdapter();
    });

    it('constructs URL with filter query parameters', async () => {
        const { default: Parser } = await import('rss-parser');
        const mockParser = new (Parser as unknown as new () => { parseURL: ReturnType<typeof vi.fn> })();
        mockParser.parseURL.mockResolvedValue({ items: [] });
        // Access the private parser through the adapter
        (adapter as unknown as Record<string, unknown>)['parser'] = mockParser;

        await adapter.fetchListings('https://example.com/rss', { keyword: 'developer', location: 'Helsinki' });

        const calledUrl = mockParser.parseURL.mock.calls[0][0] as string;
        expect(calledUrl).toContain('keyword=developer');
        expect(calledUrl).toContain('location=Helsinki');
        expect(calledUrl).toContain('https://example.com/rss');
    });

    it('maps feed items to CandidateListing objects', async () => {
        const { default: Parser } = await import('rss-parser');
        const mockParser = new (Parser as unknown as new () => { parseURL: ReturnType<typeof vi.fn> })();
        const mockItems = [
            {
                guid: 'item-guid-1',
                link: 'https://example.com/job/1',
                title: 'Senior Developer',
                creator: 'Acme Corp',
                contentSnippet: 'Great job opportunity',
                pubDate: '2024-01-15T00:00:00Z',
            },
        ];
        mockParser.parseURL.mockResolvedValue({ items: mockItems });
        (adapter as unknown as Record<string, unknown>)['parser'] = mockParser;

        const result = await adapter.fetchListings('https://example.com/rss', {});

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            externalId: 'item-guid-1',
            url: 'https://example.com/job/1',
            title: 'Senior Developer',
            company: 'Acme Corp',
            description: 'Great job opportunity',
        });
        expect(result[0].scrapedAt).toBeInstanceOf(Date);
        expect(result[0].publishedAt).toBeInstanceOf(Date);
    });

    it('returns empty array for empty feed', async () => {
        const { default: Parser } = await import('rss-parser');
        const mockParser = new (Parser as unknown as new () => { parseURL: ReturnType<typeof vi.fn> })();
        mockParser.parseURL.mockResolvedValue({ items: [] });
        (adapter as unknown as Record<string, unknown>)['parser'] = mockParser;

        const result = await adapter.fetchListings('https://example.com/rss', {});

        expect(result).toEqual([]);
    });

    it('returns empty array when items is undefined', async () => {
        const { default: Parser } = await import('rss-parser');
        const mockParser = new (Parser as unknown as new () => { parseURL: ReturnType<typeof vi.fn> })();
        mockParser.parseURL.mockResolvedValue({});
        (adapter as unknown as Record<string, unknown>)['parser'] = mockParser;

        const result = await adapter.fetchListings('https://example.com/rss', {});

        expect(result).toEqual([]);
    });
});
