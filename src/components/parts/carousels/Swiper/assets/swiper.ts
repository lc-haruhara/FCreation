import type { Swiper } from 'swiper';

type SwiperContainerElement = HTMLElement & {
  swiper?: Swiper;
  initialize?: () => void;
  dataset: DOMStringMap & {
    swiperFocusInitialized?: string;
    swiperInitialized?: string;
    swiperNavigation?: string;
    swiperPagination?: string;
    swiperPaginationType?: string;
    swiperNavigationKey?: string;
  };
};

type FocusDirection = 'forward' | 'backward';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

function isFocusableElement(element: HTMLElement) {
  if (element.matches('[disabled], [hidden], [inert], [aria-hidden="true"]')) {
    return false;
  }

  if (element.getAttribute('tabindex') === '-1') {
    return false;
  }

  return element.getClientRects().length > 0;
}

function getFocusableElements(scope: Document | HTMLElement) {
  return Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    isFocusableElement,
  );
}

function getRealSlides(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('swiper-slide')).filter(
    (slide) => !slide.classList.contains('swiper-slide-duplicate'),
  );
}

function getRealSlideIndex(slide: HTMLElement, container: HTMLElement) {
  const realIndex = slide.getAttribute('data-swiper-slide-index');

  if (realIndex) {
    const parsedIndex = Number.parseInt(realIndex, 10);

    if (!Number.isNaN(parsedIndex)) {
      return parsedIndex;
    }
  }

  return getRealSlides(container).indexOf(slide);
}

function getRealSlideByIndex(container: HTMLElement, realIndex: number) {
  return (
    getRealSlides(container).find((slide) => getRealSlideIndex(slide, container) === realIndex) ??
    null
  );
}

function getNearestSlideByRealIndex(
  container: HTMLElement,
  currentSlide: HTMLElement,
  targetRealIndex: number,
  direction: FocusDirection,
) {
  const slides = Array.from(container.querySelectorAll<HTMLElement>('swiper-slide'));
  const currentSlidePosition = slides.indexOf(currentSlide);

  if (currentSlidePosition >= 0) {
    const step = direction === 'forward' ? 1 : -1;

    for (
      let nextPosition = currentSlidePosition + step;
      nextPosition >= 0 && nextPosition < slides.length;
      nextPosition += step
    ) {
      const candidate = slides[nextPosition];

      if (getRealSlideIndex(candidate, container) === targetRealIndex) {
        return candidate;
      }
    }
  }

  return getRealSlideByIndex(container, targetRealIndex);
}

function moveFocusOutsideSwiper(
  container: HTMLElement,
  currentElement: HTMLElement,
  direction: FocusDirection,
) {
  const focusableElements = getFocusableElements(document);
  const currentIndex = focusableElements.indexOf(currentElement);

  if (currentIndex < 0) {
    return false;
  }

  const step = direction === 'forward' ? 1 : -1;

  for (
    let nextIndex = currentIndex + step;
    nextIndex >= 0 && nextIndex < focusableElements.length;
    nextIndex += step
  ) {
    const candidate = focusableElements[nextIndex];

    if (container.contains(candidate)) {
      continue;
    }

    candidate.focus();
    return true;
  }

  return false;
}

function focusPreviousSlideLastElement(
  container: HTMLElement,
  currentSlide: HTMLElement,
  currentRealSlideIndex: number,
) {
  for (let previousIndex = currentRealSlideIndex - 1; previousIndex >= 0; previousIndex -= 1) {
    const previousSlide = getNearestSlideByRealIndex(
      container,
      currentSlide,
      previousIndex,
      'backward',
    );

    if (!previousSlide) {
      continue;
    }

    const focusableElements = getFocusableElements(previousSlide);
    const targetElement = focusableElements[focusableElements.length - 1];

    if (!targetElement) {
      continue;
    }

    targetElement.focus();
    return true;
  }

  return false;
}

function syncFocusedSlide(container: SwiperContainerElement, slide: HTMLElement) {
  const swiper = container.swiper;

  if (!swiper || swiper.destroyed) {
    return;
  }

  const realIndex = getRealSlideIndex(slide, container);

  if (realIndex < 0 || realIndex === swiper.realIndex) {
    return;
  }

  const transitionSpeed =
    typeof swiper.params.speed === 'number' ? swiper.params.speed : Number(swiper.params.speed);

  if (swiper.params.loop) {
    swiper.slideToLoop(realIndex, transitionSpeed);
  } else {
    swiper.slideTo(realIndex, transitionSpeed);
  }
}

function onFocusIn(event: FocusEvent) {
  const container = event.currentTarget;
  const focusedElement = event.target;

  if (!(container instanceof HTMLElement) || !(focusedElement instanceof HTMLElement)) {
    return;
  }

  const slide = focusedElement.closest<HTMLElement>('swiper-slide');

  if (!slide || !container.contains(slide)) {
    return;
  }

  syncFocusedSlide(container as SwiperContainerElement, slide);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Tab') {
    return;
  }

  const container = event.currentTarget;
  const focusedElement = event.target;

  if (!(container instanceof HTMLElement) || !(focusedElement instanceof HTMLElement)) {
    return;
  }

  const slide = focusedElement.closest<HTMLElement>('swiper-slide');

  if (!slide || !container.contains(slide)) {
    return;
  }

  const focusableElementsInSlide = getFocusableElements(slide);
  const currentElement = document.activeElement;

  if (focusableElementsInSlide.length === 0 || !(currentElement instanceof HTMLElement)) {
    return;
  }

  const firstFocusableElement = focusableElementsInSlide[0];
  const lastFocusableElement = focusableElementsInSlide[focusableElementsInSlide.length - 1];
  const realSlideIndex = getRealSlideIndex(slide, container);
  const lastRealSlideIndex = getRealSlides(container).length - 1;

  if (event.shiftKey) {
    if (currentElement !== firstFocusableElement) {
      return;
    }

    if (realSlideIndex === 0) {
      if (moveFocusOutsideSwiper(container, currentElement, 'backward')) {
        event.preventDefault();
      }

      return;
    }

    if (
      focusPreviousSlideLastElement(container, slide, realSlideIndex) ||
      moveFocusOutsideSwiper(container, currentElement, 'backward')
    ) {
      event.preventDefault();
    }

    return;
  }

  if (realSlideIndex !== lastRealSlideIndex || currentElement !== lastFocusableElement) {
    return;
  }

  if (moveFocusOutsideSwiper(container, currentElement, 'forward')) {
    event.preventDefault();
  }
}

function bindSwiperFocus(container: SwiperContainerElement) {
  if (container.dataset.swiperFocusInitialized === 'true') {
    return;
  }

  const initializeFocusControl = () => {
    const swiper = container.swiper;

    if (!swiper || swiper.destroyed) {
      return false;
    }

    container.addEventListener('focusin', onFocusIn);
    container.addEventListener('keydown', onKeydown);
    container.dataset.swiperFocusInitialized = 'true';
    return true;
  };

  if (initializeFocusControl()) {
    return;
  }

  container.addEventListener(
    'afterinit',
    () => {
      initializeFocusControl();
    },
    { once: true },
  );
}

/**
 * 同じ navigationKey を持つ要素が遷移中に複数存在しても、
 * できるだけ「この swiper に近いDOM」から拾う
 */
function getScopedRoot(container: HTMLElement) {
  return (
    container.closest<HTMLElement>('[data-swiper-scope]') ??
    container.parentElement ??
    document.body
  );
}

function resolveNavigationElements(container: HTMLElement) {
  const navigationKey = container.dataset.swiperNavigationKey;

  if (!navigationKey) {
    return null;
  }

  const scopedRoot = getScopedRoot(container);

  let prevEl = scopedRoot.querySelector<HTMLElement>(`[data-swiper-prev="${navigationKey}"]`);
  let nextEl = scopedRoot.querySelector<HTMLElement>(`[data-swiper-next="${navigationKey}"]`);

  if (!prevEl || !nextEl) {
    prevEl = container.ownerDocument.querySelector<HTMLElement>(
      `[data-swiper-prev="${navigationKey}"]`,
    );
    nextEl = container.ownerDocument.querySelector<HTMLElement>(
      `[data-swiper-next="${navigationKey}"]`,
    );
  }

  if (!prevEl || !nextEl) {
    return null;
  }

  return { prevEl, nextEl };
}

function resolvePaginationElement(container: HTMLElement) {
  const navigationKey = container.dataset.swiperNavigationKey;

  if (!navigationKey) {
    return null;
  }

  const scopedRoot = getScopedRoot(container);

  let paginationEl = scopedRoot.querySelector<HTMLElement>(
    `[data-swiper-pagination="${navigationKey}"]`,
  );

  if (!paginationEl) {
    paginationEl = container.ownerDocument.querySelector<HTMLElement>(
      `[data-swiper-pagination="${navigationKey}"]`,
    );
  }

  return paginationEl;
}

function destroySwiper(container: SwiperContainerElement) {
  const swiper = container.swiper;

  if (swiper && !swiper.destroyed) {
    swiper.destroy(true, true);
  }

  container.dataset.swiperInitialized = 'false';
  container.dataset.swiperFocusInitialized = 'false';
}

function initializeSwiper(container: SwiperContainerElement) {
  const existing = container.swiper;
  const alreadyInitialized = container.dataset.swiperInitialized === 'true';

  if (alreadyInitialized && existing && !existing.destroyed) {
    return;
  }

  if (existing && !existing.destroyed) {
    existing.destroy(true, true);
  }

  const useNavigation = container.dataset.swiperNavigation === 'true';
  const usePagination = container.dataset.swiperPagination === 'true';
  const paginationType = container.dataset.swiperPaginationType ?? 'bullets';
  const navigationElements = useNavigation ? resolveNavigationElements(container) : null;
  const paginationElement = usePagination ? resolvePaginationElement(container) : null;

  Object.assign(container, {
    navigation: navigationElements
      ? {
          prevEl: navigationElements.prevEl,
          nextEl: navigationElements.nextEl,
        }
      : false,
    pagination: usePagination
      ? {
          el: paginationElement ?? undefined,
          type: paginationType,
          clickable: paginationType === 'bullets',
        }
      : false,
  });

  container.initialize?.();
  container.dataset.swiperInitialized = 'true';
}

export function initSwipers(root: ParentNode = document) {
  root.querySelectorAll<SwiperContainerElement>('[data-swiper-root]').forEach((container) => {
    initializeSwiper(container);
    bindSwiperFocus(container);
  });
}

export function resetSwipers(root: ParentNode = document) {
  root.querySelectorAll<SwiperContainerElement>('[data-swiper-root]').forEach((container) => {
    destroySwiper(container);
  });
}
