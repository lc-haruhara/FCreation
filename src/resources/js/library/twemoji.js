import twemoji from 'twemoji';

const TWEMOJI_OPTIONS = {
  base: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@14.0.2/assets/',
  folder: 'svg',
  ext: '.svg',
};

function shouldSkipElement(el) {
  if (!el) return true;

  return Boolean(
    el.closest(
      [
        'script',
        'style',
        'textarea',
        'input',
        'select',
        'option',
        'pre',
        'code',
        '[data-no-twemoji]',
        '.no-twemoji',
      ].join(','),
    ),
  );
}

export function initTwemoji(root = document) {
  const scope =
    root instanceof Document
      ? root.body
      : root instanceof Element
        ? root
        : document.body;

  if (!scope) return () => { };

  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) {
        return NodeFilter.FILTER_REJECT;
      }

      const parent = node.parentElement;
      if (!parent || shouldSkipElement(parent)) {
        return NodeFilter.FILTER_REJECT;
      }

      // すでに twemoji 化された img は除外
      if (parent.closest('img.emoji')) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const targets = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    targets.push(currentNode);
    currentNode = walker.nextNode();
  }

  targets.forEach((textNode) => {
    const parent = textNode.parentNode;
    if (!parent) return;

    const parsed = twemoji.parse(textNode.nodeValue, TWEMOJI_OPTIONS);

    if (parsed === textNode.nodeValue) return;

    const wrapper = document.createElement('span');
    wrapper.dataset.twemojiWrapped = 'true';
    wrapper.dataset.twemojiOriginal = textNode.nodeValue ?? '';
    wrapper.innerHTML = parsed;

    parent.insertBefore(wrapper, textNode);
    parent.removeChild(textNode);
  });

  return () => {
    scope.querySelectorAll('[data-twemoji-wrapped]').forEach((wrapper) => {
      const text =
        wrapper instanceof HTMLElement
          ? wrapper.dataset.twemojiOriginal ?? ''
          : wrapper.textContent ?? '';
      const textNode = document.createTextNode(text);
      wrapper.replaceWith(textNode);
    });
  };
}