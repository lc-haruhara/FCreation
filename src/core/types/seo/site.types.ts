export type SiteConfig = {
  /**
   * サイト名（OGPの site_name や title の共通部分に利用）
   * env: PUBLIC_SITE_NAME
   */
  name: string;
  /**
   * サイト共通のdescription（ページ側で未指定の時にフォールバック）
   * env: PUBLIC_SITE_DESCRIPTION
   */
  description?: string;
  /**
   * サイトの正規URL（canonical/og:url の基準）
   * env: PUBLIC_SITE_URL
   */
  url?: string;
  /**
   * デフォルトのOG画像URL
   * env: PUBLIC_DEFAULT_OG_IMAGE
   */
  defaultOgImage?: string;
  /**
   * デフォルトのOGロケール
   * env: PUBLIC_OG_LOCALE
   */
  ogLocale?: string;
  tagline?: string;
};

