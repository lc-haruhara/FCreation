export default {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  framework: {
    name: '@storybook-astro/framework',
    options: {},
  },
  async viteFinal(config) {
    // Windows で Astro dev と同時起動すると node_modules/.vite が競合しやすいので分離する
    config.cacheDir ??= 'node_modules/.vite-storybook';

    // Windows の "D:/..." のような絶対パスが渡ってきたときに Vite が解決できるよう
    // "/@fs/D:/..." 形式に寄せる（storybook-astro の middleware が data.component を dynamic import するため）
    config.plugins ??= [];
    config.plugins.push({
      name: 'storybook-astro-windows-fs-path',
      enforce: 'pre',
      resolveId(source) {
        // Storybook 側が Astro component の moduleId を "D:/.../X.astro" で渡してくるケースのみ補正する
        if (source.endsWith('.astro') && /^[A-Za-z]:[\\/]/u.test(source)) {
          const normalized = source.replace(/\\/gu, '/');
          return `/@fs/${normalized}`;
        }
        return null;
      },
    });

    return config;
  },
};

