import { postJSON } from './http';
import type { Summary, SummaryMode } from '@/lib/types';

type BackendSummarizeResponse = {
  // BE returns `content` as string | string[]
  content: string | string[];
  // BE may omit mode; FE should default to 'bullets'
  mode?: SummaryMode;
  cached?: boolean;
  model?: string;
  lang?: string;
  cache_ttl?: number;
  provider?: string;
};

export type SummarizePayload = {
  text: string;              // required by current BE
  url?: string;
  title?: string;
  mode?: SummaryMode;        // 'bullets' | 'paragraph'
  lang?: string;             // 'en' | 'vi' | ...
};

function toSummary(res: BackendSummarizeResponse): Summary {
  const mode: SummaryMode = res.mode ?? 'bullets';

  if (mode === 'bullets') {
    const items = Array.isArray(res.content)
      ? res.content
      : String(res.content)
          .split(/\r?\n/)
          .map(s => s.replace(/^[-•\s]+/, '').trim())
          .filter(Boolean);

    return { mode: 'bullets', items };
  } else {
    const text = Array.isArray(res.content)
      ? res.content.join(' ')
      : String(res.content);

    return { mode: 'paragraph', text };
  }
}

export async function summarizeArticle(payload: SummarizePayload) {
  const body = {
    text: payload.text,
    url: payload.url,
    title: payload.title,
    mode: payload.mode ?? 'bullets',
    lang: payload.lang ?? 'en',
  };

  const raw = await postJSON<BackendSummarizeResponse>('summarize', body);

  // Debug only in development
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[Summarize] raw from BE =', raw);
  }

  return { summary: toSummary(raw) };
}
