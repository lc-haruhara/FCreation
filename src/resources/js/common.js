import { initModal } from './features/modal.js';
import { initScrollTop } from './features/scrollTop.js';
import { initToggleOn } from './features/toggleOn.js';
import { initTwemoji } from './library/twemoji.js';

export default function initCommon(root = document) {
  const cleanups = [];

  const register = (cleanup) => {
    if (typeof cleanup === 'function') cleanups.push(cleanup);
  };

  register(initToggleOn(root));
  register(initScrollTop(root));
  register(initModal(root));
  register(initTwemoji(root));

  return () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
  };
}