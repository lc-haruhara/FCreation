/**
 * SEO まわりの public API（入口）。
 *
 * - アプリ側は原則ここから import する（各モジュールへの直importは避ける）
 */
export { resolveMeta } from '@/core/lib/seo/meta.lib';
export { homeJsonLd, pageJsonLd } from '@/core/lib/seo/schemaOrg.lib';
export { DEFAULT_META, site, siteMetaDefaults } from '@/core/lib/seo/siteEnv.lib';
