class NavigationDrawer {
  private openButton: HTMLButtonElement | null;
  private drawer: HTMLElement | null;
  private panel: HTMLElement | null;
  private closeButtons: HTMLElement[];
  private drawerLinks: HTMLElement[];
  private lastFocusedElement: HTMLElement | null = null;

  constructor() {
    this.openButton = document.querySelector('[data-js-drawer-open]');
    this.drawer = document.querySelector('[data-js-drawer]');
    this.panel = document.querySelector('[data-js-drawer-panel]');
    this.closeButtons = Array.from(document.querySelectorAll('[data-js-drawer-close]'));
    this.drawerLinks = Array.from(document.querySelectorAll('[data-js-drawer-link]'));

    this.onKeydown = this.onKeydown.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);

    this.init();
  }

  private init() {
    if (!(this.openButton instanceof HTMLButtonElement)) return;
    if (!(this.drawer instanceof HTMLElement)) return;
    if (!(this.panel instanceof HTMLElement)) return;

    this.openButton.addEventListener('click', this.toggleDrawer);

    this.closeButtons.forEach((button) => {
      button.addEventListener('click', this.closeDrawer);
    });

    this.drawerLinks.forEach((link) => {
      link.addEventListener('click', this.closeDrawer);
    });
  }

  private isDrawerOpen(): boolean {
    return this.drawer?.getAttribute('aria-hidden') === 'false';
  }

  private getFocusableElements(): HTMLElement[] {
    if (!(this.panel instanceof HTMLElement)) return [];

    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(this.panel.querySelectorAll(selectors.join(','))).filter(
      (el): el is HTMLElement => {
        if (!(el instanceof HTMLElement)) return false;
        if (el.hasAttribute('hidden')) return false;
        if (el.getAttribute('aria-hidden') === 'true') return false;
        if (el.closest('[inert]')) return false;

        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      },
    );
  }

  private openDrawer = (): void => {
    if (!(this.openButton instanceof HTMLButtonElement)) return;
    if (!(this.drawer instanceof HTMLElement)) return;
    if (!(this.panel instanceof HTMLElement)) return;
    if (this.isDrawerOpen()) return;

    this.lastFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    this.drawer.removeAttribute('inert');
    this.drawer.setAttribute('aria-hidden', 'false');
    this.openButton.setAttribute('aria-expanded', 'true');

    const focusableElements = this.getFocusableElements();
    const firstFocusable = focusableElements[0];

    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      this.panel.focus();
    }

    document.addEventListener('keydown', this.onKeydown);
  };

  private closeDrawer = (): void => {
    if (!(this.openButton instanceof HTMLButtonElement)) return;
    if (!(this.drawer instanceof HTMLElement)) return;
    if (!this.isDrawerOpen()) return;

    this.drawer.setAttribute('aria-hidden', 'true');
    this.drawer.setAttribute('inert', '');
    this.openButton.setAttribute('aria-expanded', 'false');

    document.removeEventListener('keydown', this.onKeydown);

    if (
      this.lastFocusedElement instanceof HTMLElement &&
      document.contains(this.lastFocusedElement)
    ) {
      this.lastFocusedElement.focus();
    } else {
      this.openButton.focus();
    }

    this.lastFocusedElement = null;
  };

  private toggleDrawer(): void {
    if (this.isDrawerOpen()) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  private onKeydown(event: KeyboardEvent): void {
    if (!(this.panel instanceof HTMLElement)) return;
    if (!this.isDrawerOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeDrawer();
      return;
    }

    if (event.key === 'Tab') {
      const focusableElements = this.getFocusableElements();

      if (focusableElements.length === 0) {
        event.preventDefault();
        this.panel.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || activeElement === this.panel) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }
}

function initNavigationDrawer() {
  const drawer = document.querySelector<HTMLElement>('[data-js-drawer]');

  if (!drawer) return;

  if (drawer.dataset.drawerInitialized === 'true') {
    return;
  }

  drawer.dataset.drawerInitialized = 'true';
  new NavigationDrawer();
}

document.addEventListener('astro:page-load', initNavigationDrawer);
initNavigationDrawer();
