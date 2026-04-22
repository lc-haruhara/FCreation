import {
  DATA_ACTION_ICON_MAP,
  LINK_ASSISTIVE_TEXT,
  LINK_TYPE_ICON_MAP,
} from '@/core/config/link.config';
import { pages } from '@/core/config/pages.config';
import type {
  Dict,
  LinkIconType,
  LinkSource,
  ResolveControlIconOptions,
  ResolveControlIconResult,
  ResolveLinkOptions,
  ResolveLinkResult,
} from '@/core/types/links/link.types';

// メールアドレス形式かどうかを判定
export function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

// 現在ページ比較用に末尾スラッシュを揃える
export function normalizePathname(p: string) {
  if (!p) return '/';
  return p !== '/' ? p.replace(/\/+$/u, '') : '/';
}

// 電話番号っぽい文字列を tel: に正規化
export function normalizeTelHref(s: string) {
  if (/^tel:/i.test(s)) {
    const v = s
      .replace(/^tel:\s*/i, '')
      .replace(/[^\d\-.+()\s]/gu, '')
      .trim();
    return v ? `tel:${v}` : '';
  }

  const digits = s.replace(/\D/g, '');
  const phoneLike = /\d/.test(s) && /^[\d\s\-.+()]+$/u.test(s) && digits.length >= 10;

  if (!phoneLike) return '';

  const v = s.replace(/[^\d\-.+()\s]/gu, '').trim();
  return v ? `tel:${v}` : '';
}

// メールアドレスっぽい文字列を mailto: に正規化
export function normalizeMailtoHref(s: string) {
  if (/^mailto:/i.test(s)) {
    const v = s.replace(/^mailto:\s*/i, '').trim();
    const emailPart = v.includes('?') ? v.slice(0, v.indexOf('?')) : v;
    return isEmail(emailPart) ? `mailto:${v}` : '';
  }

  return isEmail(s) ? `mailto:${s.trim()}` : '';
}

// page / href / url のどれが来ても最終的なリンク元文字列を返す
export function resolvePageOrHref(source: LinkSource) {
  if (source.page) {
    return typeof source.page === 'string' ? pages[source.page].path : source.page.path;
  }

  return (source.href ?? source.url ?? '').trim();
}

// リンク種別や target / rel など、描画に必要な情報をまとめて解決
export function resolveLink(options: ResolveLinkOptions): ResolveLinkResult {
  const { rawHref, currentUrl, external, hasDownload = false } = options;

  const href = normalizeTelHref(rawHref) || normalizeMailtoHref(rawHref) || rawHref;

  const isMailLink = /^mailto:/i.test(href);
  const isTelLink = /^tel:/i.test(href);
  const isAnchor = href.startsWith('#');

  let isExternal = false;

  // external が明示されていればそれを優先
  if (typeof external === 'boolean') {
    isExternal = external;
  } else if (isMailLink || isTelLink || isAnchor) {
    isExternal = false;
  } else {
    try {
      const resolved = new URL(href, currentUrl);
      isExternal = resolved.origin !== currentUrl.origin;
    } catch {
      isExternal = /^https?:\/\//i.test(href);
    }
  }

  // 外部リンクかつ download ではない時だけ新規タブ扱い
  const opensInNewTab = isExternal && !hasDownload;

  let isCurrent = false;

  // 同一サイト内リンクだけ現在ページ判定する
  if (!isExternal && !isMailLink && !isTelLink && !isAnchor) {
    try {
      const current = normalizePathname(currentUrl.pathname);
      const targetPath = normalizePathname(new URL(href, currentUrl).pathname);
      isCurrent = current === targetPath;
    } catch {
      isCurrent = false;
    }
  }

  return {
    href,
    isExternal,
    opensInNewTab,
    isMailLink,
    isTelLink,
    isAnchor,
    isCurrent,
    target: opensInNewTab ? '_blank' : undefined,
    rel: opensInNewTab ? 'noopener noreferrer external' : undefined,
  };
}

// リンク種別から表示アイコンを自動決定
export function resolveLinkIcon(options: {
  isMailLink?: boolean;
  isTelLink?: boolean;
  opensInNewTab?: boolean;
  hasDownload?: boolean;
}): LinkIconType {
  if (options.hasDownload) return LINK_TYPE_ICON_MAP.download;
  if (options.isMailLink) return LINK_TYPE_ICON_MAP.mail;
  if (options.isTelLink) return LINK_TYPE_ICON_MAP.tel;
  if (options.opensInNewTab) return LINK_TYPE_ICON_MAP.external;
  return LINK_TYPE_ICON_MAP.default;
}

// data-* の特定キーが「有効な値」で入っているか判定
export function hasTruthyDataKey(data: Dict | undefined, key: string) {
  if (!data) return false;
  const value = data[key];
  return value !== undefined && value !== null && value !== false && value !== '';
}

// Link / ButtonLink 共通の見た目アイコンを解決
export function resolveControlIcon(options: ResolveControlIconOptions): ResolveControlIconResult {
  const { icon, svg, data, isMailLink, isTelLink, opensInNewTab, hasDownload } = options;

  // 1. svg 明示指定が最優先
  if (svg) {
    return {
      showIcon: true,
      icon: undefined,
      svg,
    };
  }

  // 2. icon 明示指定が次に優先
  if (icon) {
    return {
      showIcon: true,
      icon,
      svg: undefined,
    };
  }

  // 3. UI 操作用 data 属性を見て判定
  for (const [key, mappedIcon] of Object.entries(DATA_ACTION_ICON_MAP)) {
    if (hasTruthyDataKey(data, key)) {
      return {
        showIcon: true,
        icon: mappedIcon,
        svg: undefined,
      };
    }
  }

  // 4. リンク種別から自動判定
  const hasLinkContext =
    isMailLink !== undefined ||
    isTelLink !== undefined ||
    opensInNewTab !== undefined ||
    hasDownload !== undefined;

  if (hasLinkContext) {
    return {
      showIcon: true,
      icon: resolveLinkIcon({
        isMailLink,
        isTelLink,
        opensInNewTab,
        hasDownload,
      }),
      svg: undefined,
    };
  }

  // 5. 何の材料もなければアイコンなし
  return {
    showIcon: false,
    icon: undefined,
    svg: undefined,
  };
}

// slot の HTML から見た目テキストだけをざっくり取り出す
export function extractTextFromHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/gu, ' ')
    .trim();
}

// 英語だけの短い UI テキストかどうかを判定
export function isEnglishOnlyText(s: string) {
  const v = s.trim();
  if (!v) return false;

  const hasLatinLetter = /[A-Za-z]/u.test(v);
  const englishLike = /^[A-Za-z0-9\s.,!?&/()'"’:;-]+$/u.test(v);

  return hasLatinLetter && englishLike;
}

// 明示指定があればそれを優先し、未指定時だけ自動で lang を解決
export function resolveTextLang(text: string, explicitLang?: string) {
  if (explicitLang) return explicitLang;
  return isEnglishOnlyText(text) ? 'en' : undefined;
}

// リンクの補助説明を sr-only 用の配列で返す
export function getLinkAssistiveTexts(options: {
  isMailLink?: boolean;
  isTelLink?: boolean;
  opensInNewTab?: boolean;
  hasDownload?: boolean;
}) {
  const texts: string[] = [];

  if (options.isMailLink) texts.push(LINK_ASSISTIVE_TEXT.mail);
  if (options.isTelLink) texts.push(LINK_ASSISTIVE_TEXT.tel);
  if (options.opensInNewTab) texts.push(LINK_ASSISTIVE_TEXT.external);
  if (options.hasDownload) texts.push(LINK_ASSISTIVE_TEXT.download);

  return texts;
}
