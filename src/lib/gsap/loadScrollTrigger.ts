/**
 * このスターターキットで ScrollTrigger を「任意で」使えるようにするためのヘルパー。
 *
 * - ScrollTrigger を使わない案件では import されなければバンドルに入りにくい（不要な初期ロードを避ける）
 * - SSR（Astro のサーバー実行）では window が無いため、必ずクライアント側だけで動的 import する
 * - 複数箇所から呼んでも二重に register しないようにする
 */

import type { gsap as gsapType } from 'gsap';

type LoadResult = {
  gsap: typeof gsapType;
  // gsap/ScrollTrigger は環境によって default / named が揺れるため、最小限の型（object）に寄せる
  ScrollTrigger: object;
};

let cached: Promise<LoadResult> | null = null;
let registered = false;

export async function loadScrollTrigger(): Promise<LoadResult> {
  if (typeof window === 'undefined') {
    throw new Error('loadScrollTrigger() はクライアント側でのみ呼び出してください。');
  }

  if (cached) return cached;

  cached = (async () => {
    const { gsap } = await import('gsap');
    const modUnknown: unknown = await import('gsap/ScrollTrigger');
    const mod = modUnknown as { ScrollTrigger?: object; default?: object };
    const ScrollTrigger = mod.ScrollTrigger ?? mod.default;

    if (!ScrollTrigger) {
      throw new Error('ScrollTrigger の import に失敗しました。');
    }

    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }

    return { gsap, ScrollTrigger };
  })();

  return cached;
}

