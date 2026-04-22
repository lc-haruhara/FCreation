import { schemaOrgEdit } from '@/core/config/schemaOrg.config';
import type { PageJsonLdParams, PageSchemaType } from '@/core/lib/seo/schemaOrg.lib';
import { pageJsonLd } from '@/core/lib/seo/schemaOrg.lib';
import { site } from '@/core/lib/seo/siteEnv.lib';
import type { Canonical, PageDef, PageMeta, PageNav } from '@/core/types/pages/pages.types';

/**
 * `core/config/page.ts` から使う「固定ページ定義」用のビルダー。
 *
 * - 目的: `path/title/description` といったページ定義の一次情報から、
 *   `canonical` や `jsonLd` を含む `PageDef` を一貫して生成する
 * - microCMS 連携時は「記事詳細」など動的ページ側で `meta` を上書きする想定
 */
export type DefinePageArgs = {
  path: string;
  title?: string;
  description?: string;
  canonical?: Canonical;
  noindex?: boolean;
  robots?: PageMeta['robots'];
  /**
   * ページ単位で OGP を上書きしたい時に使用（例: 記事詳細だけ `article`）
   */
  openGraph?: PageMeta['openGraph'];
  /**
   * ページ単位で Twitter メタを上書きしたい時に使用
   */
  twitter?: PageMeta['twitter'];
  nav?: PageNav;
  /**
   * schema.org のページ種別（下記から選択）
   *
   * - `WebPage` / `ContactPage` / `AboutPage` / `CollectionPage` / `FAQPage` / `SearchResultsPage`
   */
  schemaType?: PageSchemaType;
  /**
   * mainEntity: { "@id": "<siteUrl>/#company" } を付けるかどうか
   */
  includeMainEntityCompany?: boolean;
};

export function definePage(args: DefinePageArgs): PageDef {
  const meta: PageMeta = {
    title: args.title,
    description: args.description,
    canonical: args.canonical ?? { path: args.path },
    ...(args.noindex ? { noindex: true } : {}),
    ...(args.robots ? { robots: args.robots } : {}),
    ...(args.openGraph
      ? {
          openGraph: {
            ...args.openGraph,
          },
        }
      : {}),
    ...(args.twitter
      ? {
          twitter: {
            ...args.twitter,
          },
        }
      : {}),
  };

  if (args.schemaType) {
    meta.jsonLd = (pageJsonLd as unknown as (p: PageJsonLdParams) => PageMeta['jsonLd'])({
      type: args.schemaType,
      path: args.path,
      name: args.title ?? site.name,
      description: args.description,
      edit: schemaOrgEdit,
      includeMainEntityCompany: args.includeMainEntityCompany,
    });
  }

  return {
    path: args.path,
    meta,
    nav: args.nav,
  };
}
