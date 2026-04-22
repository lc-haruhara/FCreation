export function initModal(root = document) {
  const controller = new AbortController();

  const buttons = root.querySelectorAll('[data-modal-open]');
  const modals = document.querySelectorAll('.c-modal-wrap');
  const closes = document.querySelectorAll('[data-modal-close]');
  const mainWrap = document.querySelector('.l-main-root-wrap');
  const modalRootWrap = document.querySelector('.l-main-root-modal');

  let activeButton = null;
  let activeModal = null;

  if (modalRootWrap) {
    modalRootWrap.setAttribute('inert', '');
    modalRootWrap.setAttribute('aria-hidden', 'true');
  }

  function closeAllModals() {
    modals.forEach((modal) => {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('is-open');
    });

    buttons.forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });

    if (mainWrap) {
      mainWrap.removeAttribute('inert');
      mainWrap.removeAttribute('aria-hidden');
    }

    if (modalRootWrap) {
      modalRootWrap.setAttribute('inert', '');
      modalRootWrap.setAttribute('aria-hidden', 'true');
    }

    if (activeButton) {
      activeButton.focus();
      activeButton = null;
    }

    activeModal = null;
  }

  buttons.forEach((button) => {
    const modal = document.getElementById(button.getAttribute('aria-controls'));
    if (!modal) return;

    button.addEventListener(
      'click',
      () => {
        closeAllModals();

        activeButton = button;
        activeModal = modal;

        button.setAttribute('aria-expanded', 'true');
        modal.removeAttribute('aria-hidden');
        modal.classList.add('is-open');

        if (mainWrap) {
          mainWrap.setAttribute('inert', '');
          mainWrap.setAttribute('aria-hidden', 'true');
        }

        if (modalRootWrap) {
          modalRootWrap.removeAttribute('inert');
          modalRootWrap.removeAttribute('aria-hidden');
        }

        requestAnimationFrame(() => {
          const focusables = modal.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
          );

          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          const initial = modal.querySelector('[data-modal-initial-focus]') ?? first ?? modal;

          if (initial && typeof initial.focus === 'function') {
            initial.focus();
          }

          if (!first || !last) return;

          modal.addEventListener(
            'keydown',
            (e) => {
              if (e.key !== 'Tab') return;

              if (e.shiftKey) {
                if (document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                }
              } else if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            },
            { signal: controller.signal },
          );
        });
      },
      { signal: controller.signal },
    );
  });

  closes.forEach((close) => {
    close.addEventListener('click', closeAllModals, { signal: controller.signal });
  });

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && activeModal) {
        closeAllModals();
      }
    },
    { signal: controller.signal },
  );

  window.closeAllModals = closeAllModals;

  return () => {
    closeAllModals();
    controller.abort();

    if (window.closeAllModals === closeAllModals) {
      delete window.closeAllModals;
    }
  };
}