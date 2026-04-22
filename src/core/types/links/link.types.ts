import type { pages } from '@/core/config/pages.config';
import type { PageDef } from '@/core/types/pages/pages.types';

type PageKey = keyof typeof pages;

export type Dict = Record<string, string | number | boolean | null | undefined>;

export type LinkSource = {
  href?: string;
  url?: string;
  page?: PageKey | PageDef;
};

export type LinkIconType = string;

export type ResolveLinkOptions = {
  rawHref: string;
  currentUrl: URL;
  external?: boolean;
  hasDownload?: boolean;
};

export type ResolveLinkResult = {
  href: string;
  isExternal: boolean;
  opensInNewTab: boolean;
  isMailLink: boolean;
  isTelLink: boolean;
  isAnchor: boolean;
  isCurrent: boolean;
  target?: '_blank';
  rel?: 'noopener noreferrer external';
};

export type ResolveControlIconOptions = {
  icon?: LinkIconType;
  svg?: string;
  data?: Dict;
  isMailLink?: boolean;
  isTelLink?: boolean;
  opensInNewTab?: boolean;
  hasDownload?: boolean;
};

export type ResolveControlIconResult = {
  showIcon: boolean;
  icon?: LinkIconType;
  svg?: string;
};
