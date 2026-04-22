/**
 * pages まわりの型の公開入口。
 *
 * - 型は原則ここから import する（`core/types/page/*` は内部事情として隠す）
 */
export type NavArea = "global" | "drawer" | "footer";

export type PageKey = string;

export type RobotsMeta =
  | string
  | {
      index?: boolean;
      follow?: boolean;
      maxImagePreview?: "none" | "standard" | "large";
      maxSnippet?: number;
      maxVideoPreview?: number;
    };

export type Canonical =
  | string
  | {
      /**
       * サイトURLを除いたパス（例: "/" "/contact"）
       * 生成側でサイトURLと結合する想定。
       */
      path: string;
    };

export type OpenGraph = {
  locale?: string; // 例: "ja_JP"
  type?: "website" | "article";
  title?: string;
  description?: string;
  url?: string;
  siteName?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
};

export type TwitterMeta = {
  card?: "summary" | "summary_large_image";
  title?: string;
  description?: string;
  image?: string;
};

export type JsonLd = Record<string, unknown>;

export type PageMeta = {
  title?: string;
  description?: string;
  noindex?: boolean;
  robots?: RobotsMeta;
  canonical?: Canonical;
  openGraph?: OpenGraph;
  twitter?: TwitterMeta;
  /**
   * JSON-LD（schema.org）
   * ページ固有のBreadcrumbや、サイト全体のOrganization/LocalBusiness等を格納する想定。
   */
  jsonLd?: JsonLd[];
};

export type PageNav = {
  /**
   * そのページをどのナビに出すか。
   * 例: ["global", "drawer"]（フッターに出さない場合は含めない）
   */
  showIn?: NavArea[];
  /**
   * エリア別の並び順（小さいほど前）。
   * showInに含めたエリアだけ指定すればOK。
   */
  order?: Partial<Record<NavArea, number>>;
  /**
   * ナビ上の表示名（未指定なら meta.title を使う想定）
   */
  label?: string;
  /**
   * ドロップダウン等の親子を考慮するための子ページキー（任意）
   */
  childrenKeys?: PageKey[];
};

export type PageDef = {
  path: string;
  meta: PageMeta;
  nav?: PageNav;
};

