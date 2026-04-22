export function initScrollTop(root = document) {
  const controller = new AbortController();
  const targets = root.querySelectorAll('[data-js-scroll-top]');

  targets.forEach((el) => {
    el.addEventListener(
      'click',
      (e) => {
        if (location.pathname === '/') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
      { signal: controller.signal },
    );
  });

  return () => controller.abort();
}