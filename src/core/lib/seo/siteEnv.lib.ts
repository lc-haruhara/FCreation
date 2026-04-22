import type { SiteConfig } from '@/core/types/seo/site.types';

const env = import.meta.env as unknown as Record<string, string | undefined>;

/**
 * env（PUBLIC_*）からサイトの基本情報を組み立てる層。
 *
 * - `PUBLIC_` 接頭辞の値のみ参照する（ビルド時に公開される想定）
 * - 機密情報（APIキー等）はここに置かない
 */
export const site: SiteConfig = {
  name: env.PUBLIC_SITE_NAME ?? 'AbsoluteFiveAstro',
  description: env.PUBLIC_SITE_DESCRIPTION,
  url: env.PUBLIC_SITE_URL,
  defaultOgImage: env.PUBLIC_DEFAULT_OG_IMAGE,
  ogLocale: env.PUBLIC_OG_LOCALE ?? 'ja_JP',
  tagline: env.PUBLIC_SITE_TAGLINE,
};

export const siteMetaDefaults = {
  openGraph: {
    locale: site.ogLocale,
    type: 'website',
    siteName: site.name,
    image: site.defaultOgImage,
    imageWidth: 1200,
    imageHeight: 630,
  },
  twitter: {
    card: 'summary_large_image',
  },
} as const;

export const DEFAULT_META = {
  robots: {
    index: true,
    follow: true,
    maxImagePreview: 'large',
    maxSnippet: -1,
    maxVideoPreview: -1,
  },
  openGraph: {
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
} as const;
