import { pages } from '@/core/config/pages.config';
import { DEFAULT_META, site, siteMetaDefaults } from '@/core/lib/seo/siteEnv.lib';
import type { RobotsMeta } from '@/core/types/pages/pages.types';

/**
 * `core/config/page.ts` のページ定義と `core/lib/seo/siteEnv.lib.ts` のサイト設定を元に、
 * `<head>` に必要なメタ情報を「ページURLから」解決するユーティリティ。
 *
 * - 固定ページ: `pages` の `meta` を優先
 * - 動的ページ: 呼び出し側で `meta` を上書きして使う想定（microCMS など）
 */
function normalizePath(pathname: string) {
  if (!pathname) return '/';
  if (pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
}

function robotsToContent(robots?: RobotsMeta, noindex?: boolean) {
  if (noindex) return 'noindex, nofollow';
  if (!robots) return undefined;
  if (typeof robots === 'string') return robots;

  const parts: string[] = [];

  if (robots.index !== undefined) parts.push(robots.index ? 'index' : 'noindex');

  if (robots.follow !== undefined) parts.push(robots.follow ? 'follow' : 'nofollow');

  if (robots.maxImagePreview) parts.push(`max-image-preview:${robots.maxImagePreview}`);

  if (robots.maxSnippet !== undefined) parts.push(`max-snippet:${robots.maxSnippet}`);

  if (robots.maxVideoPreview !== undefined)
    parts.push(`max-video-preview:${robots.maxVideoPreview}`);

  return parts.length ? parts.join(', ') : undefined;
}

function toAbsoluteUrl(urlOrPath: string | undefined, base: string) {
  if (!urlOrPath) return undefined;
  try {
    return new URL(urlOrPath, base).toString();
  } catch {
    return urlOrPath;
  }
}

function normalizeTrailingSlashUrl(urlOrPath: string, base: string) {
  const u = new URL(urlOrPath, base);
  const pathname = u.pathname || '/';

  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '') + '/';

  return `${u.origin}${normalizedPath}${u.search}${u.hash}`;
}

export function resolveMeta(url: URL) {
  const currentPath = normalizePath(url.pathname);

  const pageEntry =
    Object.values(pages).find((p) => normalizePath(p.path) === currentPath) ??
    Object.values(pages).find((p) => normalizePath(p.path) === '/');

  const meta = pageEntry?.meta;

  // =========================
  // title
  // =========================
  const baseTitle = meta?.title ?? site.name;
  const isHome = currentPath === '/';
  const sep = ' | ';

  const title = isHome
    ? site.tagline
      ? `${site.name}${sep}${site.tagline}`
      : site.name
    : baseTitle === site.name
      ? site.name
      : `${baseTitle}${sep}${site.name}`;

  // =========================
  // description
  // =========================
  const description = isHome
    ? site.tagline && site.description
      ? `${site.tagline}。${site.description}`
      : (site.description ?? meta?.description)
    : (meta?.description ?? site.description);

  // =========================
  // canonical
  // =========================
  const canonicalUrlRaw = !meta?.canonical
    ? undefined
    : typeof meta.canonical === 'string'
      ? meta.canonical
      : meta.canonical.path;

  const canonicalUrl = !canonicalUrlRaw
    ? undefined
    : normalizeTrailingSlashUrl(canonicalUrlRaw, site.url ?? url.origin);

  // =========================
  // robots
  // =========================
  const robotsContent = robotsToContent(meta?.robots ?? DEFAULT_META.robots, meta?.noindex);

  // =========================
  // OGP
  // =========================
  const og = {
    ...siteMetaDefaults.openGraph,
    ...meta?.openGraph,
    title,
    description,
    url: canonicalUrl ?? url.toString(),
    image: toAbsoluteUrl(
      meta?.openGraph?.image ?? siteMetaDefaults.openGraph.image,
      site.url ?? url.origin,
    ),
    imageWidth: meta?.openGraph?.imageWidth ?? siteMetaDefaults.openGraph.imageWidth,
    imageHeight: meta?.openGraph?.imageHeight ?? siteMetaDefaults.openGraph.imageHeight,
  };

  // =========================
  // Twitter
  // =========================
  const twitter = {
    ...siteMetaDefaults.twitter,
    ...meta?.twitter,
    title,
    description,
    image: toAbsoluteUrl(
      meta?.twitter?.image ?? siteMetaDefaults.openGraph.image,
      site.url ?? url.origin,
    ),
  };

  return {
    title,
    description,
    canonicalUrl,
    robotsContent,
    og,
    twitter,
    meta,
    url,
  };
}
