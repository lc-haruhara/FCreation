export function initToggleOn(root = document) {
  const controller = new AbortController();

  root.querySelectorAll('[data-js-toggle-on]').forEach((element) => {
    element.addEventListener(
      'click',
      () => {
        element.classList.toggle('is-on');
      },
      { signal: controller.signal },
    );
  });

  return () => controller.abort();
}