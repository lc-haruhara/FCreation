/*:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  🍔 ページの読込み時（全ページ対応）

:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/
export default function initLoading() {
  const runLoading = () => {
    const mainRootWrap = document.querySelector('.l-main-root-wrap');
    const loadingWrap = document.querySelector('.c-loading');

    if (mainRootWrap) {
      setTimeout(() => {
        mainRootWrap.classList.remove('is-loading');
      }, 100);
    }

    if (loadingWrap) {
      setTimeout(() => {
        loadingWrap.classList.add('is-loaded');
      }, 1000);
    }
  };

  if (typeof window === 'undefined') return;

  window.__runLoading = runLoading;

  if (window.__loadingInitialized) {
    runLoading();
    return;
  }

  window.__loadingInitialized = true;

  window.addEventListener('load', runLoading, { once: true });
  window.addEventListener('pageshow', runLoading);
  window.addEventListener('loading:run', runLoading);
  document.addEventListener('astro:page-load', runLoading);

  if (document.readyState === 'complete') {
    setTimeout(runLoading, 0);
  }
}