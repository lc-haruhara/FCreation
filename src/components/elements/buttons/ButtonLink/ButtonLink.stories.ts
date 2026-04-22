import './ButtonLink.scss';

import ButtonLink from './ButtonLink.astro';

export default {
  title: 'Elements/Buttons/ButtonLink',
  component: ButtonLink,
  tags: ['autodocs'],

  argTypes: {
    page: {
      control: 'text',
      description: 'サイト内ページ定義のキー、または PageDef を指定します。',
      table: {
        type: { summary: 'keyof typeof pages | PageDef' },
      },
    },
    url: {
      control: 'text',
      description: '通常のURL文字列。page 未指定時に使用されます。',
      table: {
        type: { summary: 'string' },
      },
    },
    text: {
      control: 'text',
      description: 'ボタン表示テキスト。未指定時は more。',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'more'" },
      },
    },
    id: {
      control: 'text',
      description: 'ルート要素の id。',
      table: {
        type: { summary: 'string' },
      },
    },
    class: {
      control: 'object',
      description: '追加クラス。string または string[]。',
      table: {
        type: { summary: 'string | string[]' },
      },
    },
    size: {
      control: 'text',
      description: 'サイズ指定。_size-${size} クラスを付与。',
      table: {
        type: { summary: 'string' },
      },
    },
    color: {
      control: 'text',
      description: '色指定。_color-${color} クラスを付与。',
      table: {
        type: { summary: 'string' },
      },
    },
    icon: {
      control: 'text',
      description: 'Material icon 名。',
      table: {
        type: { summary: 'string' },
      },
    },
    iconPosition: {
      control: 'radio',
      options: ['left', 'right'],
      description: 'アイコン位置。',
      table: {
        type: { summary: "'left' | 'right'" },
        defaultValue: { summary: "'right'" },
      },
    },
    label: {
      control: 'text',
      description: '指定時は <label> として描画し、for に渡します。',
      table: {
        type: { summary: 'string' },
      },
    },
    data: {
      control: 'object',
      description: 'data-* 属性のまとめ指定。',
      table: {
        type: { summary: 'Record<string, string | number | boolean | null | undefined>' },
      },
    },
    aria: {
      control: 'object',
      description: 'aria-* 属性のまとめ指定。',
      table: {
        type: { summary: 'Record<string, string | number | boolean | null | undefined>' },
      },
    },
    external: {
      control: 'boolean',
      description: '外部リンク扱いを明示。true で _blank + rel を付与。',
      table: {
        type: { summary: 'boolean' },
      },
    },
    download: {
      control: 'text',
      description: 'download 属性。boolean またはファイル名文字列。',
      table: {
        type: { summary: 'boolean | string' },
      },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
ButtonLink は用途に応じて a / button / label を描き分けます。

優先順位:
1. label がある → <label>
2. label がなく page または url がある → <a>
3. それ以外 → <button type="button">

補足:
- page が指定されている場合は page を優先
- url は mailto / tel / 外部リンクを自動判定
- 同一パス内部リンクでは aria.current 未指定時に aria-current="page" を自動付与
        `.trim(),
      },
    },
  },
};

export const InternalByPage = {
  args: {
    page: 'contact',
    text: 'more',
    id: 'btn-link-1',
    class: ['extra-class-1', 'extra-class-2'],
    size: 'md',
    color: 'primary',
    icon: 'chevron_forward',
    iconPosition: 'right',
  },
};

export const InternalByUrl = {
  args: {
    url: '/contact',
    text: 'Contact',
  },
};

export const ModalButton = {
  args: {
    text: 'Open hogehoge modal',
    data: {
      'modal-open': 'hogehoge',
    },
    aria: {
      controls: 'modal-hogehoge',
      expanded: 'false',
      label: 'hogehogeモーダルを開く',
    },
  },
};

export const PlainButton = {
  args: {
    text: 'Just a button',
    data: {
      action: 'do-something',
    },
    aria: {
      label: 'なにかする',
    },
  },
};

export const ExternalAuto = {
  args: {
    url: 'https://example.com/',
    text: 'External link',
  },
};

export const ExternalForced = {
  args: {
    url: 'https://example.com/',
    text: 'External link',
    external: true,
  },
};

export const ExternalSameTab = {
  args: {
    url: 'https://example.com/',
    text: 'Open in same tab',
    external: false,
  },
};

export const AnchorLink = {
  args: {
    url: '#section',
    text: 'Sectionへ移動',
  },
};

export const LabelTag = {
  args: {
    url: '/will-be-ignored',
    text: 'Open dialog',
    label: 'dialog-trigger',
  },
};

export const DownloadBoolean = {
  args: {
    url: '/files/sample.pdf',
    text: 'PDFをダウンロード',
    download: true,
  },
};

export const DownloadFilename = {
  args: {
    url: '/files/sample.pdf',
    text: 'ファイル名指定ダウンロード',
    download: 'document.pdf',
  },
};

export const Mailto = {
  args: {
    url: 'mailto:info@example.com?subject=Hello',
    text: 'Mail with subject',
  },
};

export const Tel = {
  args: {
    url: '090-1234-5678',
    text: 'Call us',
  },
};

export const IconLeft = {
  args: {
    page: 'contact',
    text: 'Contact',
    icon: 'chevron_forward',
    iconPosition: 'left',
  },
};

export const AriaCurrentOverride = {
  args: {
    page: 'contact',
    text: 'Contact (override aria-current)',
    aria: {
      current: 'false',
    },
  },
};
