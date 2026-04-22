import type { KnownPageKey } from '@/core/config/pages.config';
import { pages } from '@/core/config/pages.config';
import type { NavArea } from '@/core/types/pages/pages.types';

export type NavPageChild = {
  key: KnownPageKey;
  href: string;
  label: string;
};

export type NavPage = {
  key: KnownPageKey;
  href: string;
  label: string;
  children: NavPageChild[];
};

function isKnownPageKey(pageKey: string): pageKey is KnownPageKey {
  return pageKey in pages;
}

function resolveNavLabel(pageKey: KnownPageKey) {
  const page = pages[pageKey];
  return page.nav?.label ?? page.meta.title ?? page.path;
}

export function getNavPages(area: NavArea): NavPage[] {
  const items = Object.keys(pages)
    .map((pageKey) => {
      const page = pages[pageKey];
      const showIn = page.nav?.showIn ?? [];

      if (!showIn.includes(area)) return null;

      return {
        key: pageKey,
        href: page.path,
        label: resolveNavLabel(pageKey),
        order: page.nav?.order?.[area] ?? Number.POSITIVE_INFINITY,
        childrenKeys: page.nav?.childrenKeys ?? [],
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.order - b.order);

  return items.map((item) => ({
    key: item.key,
    href: item.href,
    label: item.label,
    children: item.childrenKeys
      .map((childKey) => {
        if (!isKnownPageKey(childKey)) return null;

        const child = pages[childKey];

        return {
          key: childKey,
          href: child.path,
          label: resolveNavLabel(childKey),
        };
      })
      .filter((child): child is NonNullable<typeof child> => child !== null),
  }));
}
