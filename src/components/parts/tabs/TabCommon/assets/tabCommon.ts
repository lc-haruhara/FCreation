class Tabs {
  private root: HTMLElement;
  private triggers: HTMLButtonElement[];
  private panels: HTMLElement[];
  private tabNav: HTMLElement | null;
  private panelActivateDelay = 250;
  private panelTimers = new Map<HTMLElement, number>();

  private isPointerDown = false;
  private moved = false;
  private suppressClick = false;
  private startX = 0;
  private startScrollLeft = 0;
  private dragThreshold = 8;

  constructor(root: HTMLElement) {
    this.root = root;
    this.triggers = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tab-trigger]'));
    this.panels = Array.from(root.querySelectorAll<HTMLElement>('[data-tab-panel]'));
    this.tabNav = root.querySelector<HTMLElement>('.c-tab-nav');

    this.onClick = this.onClick.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerCancel = this.onPointerCancel.bind(this);
    this.onDragStart = this.onDragStart.bind(this);

    this.init();
  }

  private init() {
    const defaultTab =
      this.triggers.find((trigger) => trigger.getAttribute('aria-selected') === 'true')?.dataset
        .tabTrigger || this.triggers[0]?.dataset.tabTrigger;

    this.triggers.forEach((trigger) => {
      trigger.addEventListener('click', this.onClick);
      trigger.addEventListener('keydown', this.onKeydown);
      trigger.addEventListener('dragstart', this.onDragStart);
    });

    this.initDragScroll();

    if (defaultTab) {
      this.activate(defaultTab);
    }
  }

  private initDragScroll() {
    if (!this.tabNav) return;

    this.tabNav.addEventListener('pointerdown', this.onPointerDown);
    this.tabNav.addEventListener('pointermove', this.onPointerMove);
    this.tabNav.addEventListener('pointerup', this.onPointerUp);
    this.tabNav.addEventListener('pointerleave', this.onPointerUp);
    this.tabNav.addEventListener('pointercancel', this.onPointerCancel);
  }

  private clearPanelTimer(panel: HTMLElement) {
    const timerId = this.panelTimers.get(panel);

    if (timerId) {
      window.clearTimeout(timerId);
      this.panelTimers.delete(panel);
    }
  }

  private activate(tabId: string) {
    this.triggers.forEach((trigger) => {
      const isActive = trigger.dataset.tabTrigger === tabId;

      trigger.classList.toggle('is-active', isActive);
      trigger.setAttribute('aria-selected', String(isActive));
      trigger.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    this.panels.forEach((panel) => {
      const isActive = panel.dataset.tabPanel === tabId;

      this.clearPanelTimer(panel);

      if (isActive) {
        panel.hidden = false;

        const timerId = window.setTimeout(() => {
          panel.classList.add('is-active');
          this.panelTimers.delete(panel);
        }, this.panelActivateDelay);

        this.panelTimers.set(panel, timerId);
      } else {
        panel.classList.remove('is-active');
        panel.hidden = true;
      }
    });
  }

  private onClick(event: Event) {
    const trigger = event.currentTarget;

    if (!(trigger instanceof HTMLButtonElement)) {
      return;
    }

    if (this.suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      this.suppressClick = false;
      return;
    }

    const tabId = trigger.dataset.tabTrigger;

    if (!tabId) {
      return;
    }

    this.activate(tabId);
  }

  private onKeydown(event: KeyboardEvent) {
    const trigger = event.currentTarget;

    if (!(trigger instanceof HTMLButtonElement)) {
      return;
    }

    const currentIndex = this.triggers.indexOf(trigger);

    if (currentIndex < 0) {
      return;
    }

    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % this.triggers.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + this.triggers.length) % this.triggers.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = this.triggers.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const nextTrigger = this.triggers[nextIndex];
    const tabId = nextTrigger?.dataset.tabTrigger;

    if (!nextTrigger || !tabId) {
      return;
    }

    this.activate(tabId);
    nextTrigger.focus();
    nextTrigger.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }

  private onPointerDown(event: PointerEvent) {
    if (!this.tabNav) return;

    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    this.isPointerDown = true;
    this.moved = false;
    this.startX = event.clientX;
    this.startScrollLeft = this.tabNav.scrollLeft;
  }

  private onPointerMove(event: PointerEvent) {
    if (!this.tabNav || !this.isPointerDown) return;

    const diffX = event.clientX - this.startX;

    if (Math.abs(diffX) > this.dragThreshold) {
      this.moved = true;
      this.tabNav.classList.add('is-dragging');
      this.tabNav.scrollLeft = this.startScrollLeft - diffX;
      event.preventDefault();
    }
  }

  private onPointerUp() {
    if (!this.tabNav) return;

    if (this.moved) {
      this.suppressClick = true;

      window.setTimeout(() => {
        this.suppressClick = false;
      }, 50);
    }

    this.isPointerDown = false;
    this.moved = false;
    this.tabNav.classList.remove('is-dragging');
  }

  private onPointerCancel() {
    if (!this.tabNav) return;

    this.isPointerDown = false;
    this.moved = false;
    this.suppressClick = false;
    this.tabNav.classList.remove('is-dragging');
  }

  private onDragStart(event: DragEvent) {
    event.preventDefault();
  }
}

function initTabs() {
  const roots = document.querySelectorAll<HTMLElement>('[data-tabs]');

  roots.forEach((root) => {
    if (root.dataset.tabsInitialized === 'true') {
      return;
    }

    root.dataset.tabsInitialized = 'true';
    new Tabs(root);
  });
}

document.addEventListener('astro:page-load', initTabs);
initTabs();
