import './IconMaterial.scss';

import IconMaterial from './IconMaterial.astro';

export default {
  title: 'Elements/Icons/IconMaterial',
  component: IconMaterial,
  tags: ['autodocs'],

  argTypes: {
    icon: {
      control: 'text',
      description: '表示する Material Symbols 名。',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'chevron_left'" },
      },
    },
    class: {
      control: 'text',
      description: '追加クラス。',
      table: {
        type: { summary: 'string' },
      },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
IconMaterial は Material Symbols の文字列をそのまま描画するアイコン用コンポーネントです。

- icon でアイコン名を指定
- class で追加クラスを付与
- 未指定時は chevron_left を表示
        `.trim(),
      },
    },
  },
};

export const Default = {
  args: {},
};

export const ChevronForward = {
  args: {
    icon: 'chevron_forward',
  },
};

export const Menu = {
  args: {
    icon: 'menu',
  },
};

export const Close = {
  args: {
    icon: 'close',
  },
};

export const Search = {
  args: {
    icon: 'search',
  },
};

export const WithExtraClass = {
  args: {
    icon: 'favorite',
    class: 'is-active',
  },
};
