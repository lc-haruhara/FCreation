import { definePage } from '@/core/lib/pages/definePage.lib';
import type { PageDef } from '@/core/types/pages/pages.types';

/** :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * ページ定義（単一ソース）
 *
 * - サイトの基本情報は .env ファイルにて管理
 * - 各固定ページのURL/メタ/ナビの出し分けをここに集約する
 * - `definePage()` に渡すのは「一次情報（path/title 等）」が中心で、
 *   `canonical` / `jsonLd` などはビルダー側で一貫して組み立てる
 * - microCMS の動的ページは「一覧/詳細のテンプレ」だけを定義し、
 *   個別記事の title/description/OGP などは CMS を優先して上書きする想定
 *::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: */
export const pages: Record<string, PageDef> = {
  home: definePage({
    path: '/',
    // Top は一覧的な役割なので CollectionPage にしておく（必要なら "WebPage" に変更可）
    schemaType: 'CollectionPage',
    nav: {
      showIn: ['global', 'drawer', 'footer'],
      order: { global: 1, drawer: 1 },
      label: 'Home',
    },
  }),

  notFound: definePage({
    path: '/404',
    title: '404',
    description: 'ページが見つかりませんでした。',
    noindex: true,
    robots: 'noindex, nofollow',
  }),
};

export type Pages = typeof pages;
export type KnownPageKey = keyof Pages;
