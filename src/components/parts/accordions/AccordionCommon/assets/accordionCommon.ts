class Accordion {
  private root: HTMLElement;
  private items: HTMLElement[];
  private triggers: HTMLButtonElement[];
  private multiple: boolean;
  private duration = 250; // アコーディオンの開閉時のアニメーション時間 (ms) scss で transition を設定しているので合わせる

  constructor(root: HTMLElement) {
    this.root = root;
    this.items = Array.from(this.root.querySelectorAll<HTMLElement>('[data-accordion-item]'));
    this.triggers = Array.from(
      this.root.querySelectorAll<HTMLButtonElement>('[data-accordion-trigger]'),
    );
    this.multiple = this.root.dataset.accordionMultiple === 'true';

    this.onClick = this.onClick.bind(this);
    this.onKeydown = this.onKeydown.bind(this);

    this.init();
  }

  private init() {
    this.triggers.forEach((trigger) => {
      trigger.addEventListener('click', this.onClick);
      trigger.addEventListener('keydown', this.onKeydown);
    });

    this.items.forEach((item) => {
      const isOpen = item.dataset.open === 'true';
      this.setInitialState(item, isOpen);
    });
  }

  private onClick(event: Event) {
    const trigger = event.currentTarget as HTMLButtonElement;
    const item = trigger.closest<HTMLElement>('[data-accordion-item]');

    if (!item) return;

    const isOpen = item.dataset.open === 'true';
    this.toggle(item, !isOpen);
  }

  private onKeydown(event: KeyboardEvent) {
    const currentTrigger = event.currentTarget as HTMLButtonElement;
    const currentIndex = this.triggers.indexOf(currentTrigger);

    if (currentIndex < 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusTrigger((currentIndex + 1) % this.triggers.length);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.focusTrigger((currentIndex - 1 + this.triggers.length) % this.triggers.length);
        break;

      case 'Home':
        event.preventDefault();
        this.focusTrigger(0);
        break;

      case 'End':
        event.preventDefault();
        this.focusTrigger(this.triggers.length - 1);
        break;
    }
  }

  private focusTrigger(index: number) {
    const trigger = this.triggers[index];
    trigger?.focus();
  }

  private toggle(targetItem: HTMLElement, shouldOpen: boolean) {
    if (!this.multiple && shouldOpen) {
      this.items.forEach((item) => {
        if (item !== targetItem) {
          this.closeItem(item);
        }
      });
    }

    if (shouldOpen) {
      this.openItem(targetItem);
    } else {
      this.closeItem(targetItem);
    }
  }

  private setInitialState(item: HTMLElement, isOpen: boolean) {
    const trigger = item.querySelector<HTMLButtonElement>('[data-accordion-trigger]');
    const panel = item.querySelector<HTMLElement>('[data-accordion-panel]');

    if (!trigger || !panel) return;

    item.dataset.open = isOpen ? 'true' : 'false';
    item.classList.toggle('is-open', isOpen);
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    panel.hidden = !isOpen;
  }

  private openItem(item: HTMLElement) {
    const trigger = item.querySelector<HTMLButtonElement>('[data-accordion-trigger]');
    const panel = item.querySelector<HTMLElement>('[data-accordion-panel]');

    if (!trigger || !panel) return;

    item.dataset.open = 'true';
    item.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
  }

  private closeItem(item: HTMLElement) {
    const trigger = item.querySelector<HTMLButtonElement>('[data-accordion-trigger]');
    const panel = item.querySelector<HTMLElement>('[data-accordion-panel]');

    if (!trigger || !panel) return;

    item.dataset.open = 'false';
    item.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');

    window.setTimeout(() => {
      if (item.dataset.open === 'true') return;
      panel.hidden = true;
    }, this.duration);
  }
}

const initAccordions = () => {
  const roots = Array.from(document.querySelectorAll<HTMLElement>('[data-accordion]'));

  roots.forEach((root) => {
    if (root.dataset.accordionInitialized === 'true') return;
    root.dataset.accordionInitialized = 'true';
    new Accordion(root);
  });
};

document.addEventListener('astro:page-load', initAccordions);

initAccordions();

export {};
