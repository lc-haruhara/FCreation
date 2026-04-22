//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// リンク種別ごとの自動アイコン設定
// resolveLinkIcon() から参照される
// TODO: 使用したいGoogleMaterialSymbolsが違うなら編集
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export const LINK_TYPE_ICON_MAP = {
  // download 属性付きリンク
  download: 'download',
  // mailto: リンク
  mail: 'mail',
  // tel: リンク
  tel: 'phone',
  // 外部リンク（新しいタブで開くリンク）
  external: 'open_in_new',
  // それ以外の通常リンク
  default: 'chevron_right',
} as const;

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// data-* 属性による UI アクション用アイコン設定
// resolveControlIcon() から参照される
// TODO: 使用したいGoogleMaterialSymbolsが違うなら編集
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export const DATA_ACTION_ICON_MAP = {
  // data-modal-open が付いている時
  'modal-open': 'ad',
} as const;

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// スクリーンリーダー向け補助文言
// getLinkAssistiveTexts() から参照される
// TODO: スクリーンリーダーに読ませたい文言が違うなら変更
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export const LINK_ASSISTIVE_TEXT = {
  // メールリンク
  mail: '（メールを送る）',
  // 電話リンク
  tel: '（電話をかける）',
  // 外部リンク
  external: '（外部サイトを新しいタブで開きます）',
  // ダウンロードリンク
  download: '（ダウンロード）',
} as const;
