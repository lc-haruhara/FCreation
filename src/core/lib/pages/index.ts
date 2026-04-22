/**
 * pages まわりの public API（入口）。
 *
 * - アプリ側は原則ここから import する（`./definePage` への直importは避ける）
 */
export type { DefinePageArgs } from '@/core/lib/pages/definePage.lib';
export { definePage } from '@/core/lib/pages/definePage.lib';
export type { NavPage, NavPageChild } from '@/core/lib/pages/getNavPages.lib';
export { getNavPages } from '@/core/lib/pages/getNavPages.lib';
