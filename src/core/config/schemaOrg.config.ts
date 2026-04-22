import { siteConfig } from '@/core/config/site.config';
import type { SchemaOrgEdit } from '@/core/types/seo/schemaOrgEdit.types';

/** :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * 案件ごとに「ここだけ」編集する想定の値。
 * 本番値に置き換えてください。
 *
 * - 生成ロジック（@graph 構造）は `core/lib/seo/schemaOrg.ts` 側
 * - ここは「値の入力欄」なので、type の追加/削除など構造変更は原則しない
 *::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: */
export const schemaOrgEdit: SchemaOrgEdit = {
  // サイトの言語。通常は "ja"（日本語）。
  language: 'ja',
  // パンくずの先頭ラベル。英語サイトなら "Home"、日本語なら "ホーム" 等。
  breadcrumbHomeLabel: 'Home',
  company: {
    // 事業者タイプ（案件に合わせて選択）
    // - 会社: "Company" / "Organization"
    // - 店舗: "LocalBusiness" / "Store"
    // - 個人: "Person"（Personの場合は住所・営業時間などはテンプレ側で出力しません）
    // - ソフトウェア: "SoftwareApplication"（SoftwareApplicationの場合は software 設定が出力されます）
    entityType: 'Organization',
    // 会社名（.env を参照）
    name: siteConfig.company.name,
    // 代表電話（.env を参照）
    telephone: siteConfig.company.tel,
    // 価格帯（任意）。例: "$$", "¥¥", "¥¥¥" など。不要なら削除/undefinedでもOK。
    priceRange: '$$',
    // ロゴ画像のパス or URL。先頭が "/" の場合はサイトURLと結合して絶対URLにします。
    // 例: "/assets/logo.svg" または "https://cdn.example.com/logo.svg"
    logoPath: '/img/logo/logo-main.svg',
    // 代表画像のパス or URL（OG画像等）。先頭が "/" の場合はサイトURLと結合して絶対URLにします。
    imagePath: '/img/ogp.png',
    // 住所（Personのときは空でもOK：出力しません）
    address: {
      // 郵便番号（.env を参照）
      postalCode: siteConfig.company.address.postalCode,
      // 都道府県（.env を参照）
      addressRegion: siteConfig.company.address.addressRegion,
      // 市区町村（.env を参照）
      addressLocality: siteConfig.company.address.addressLocality,
      // 番地・建物名（.env を参照）
      streetAddress: siteConfig.company.address.streetAddress,
      // 国コード（通常は "JP"）
      addressCountry: 'JP',
    },
    // 緯度・経度（Personのときは空でもOK：出力しません）
    geo: {
      // 緯度・経度（文字列でOK）。例: "33.2799"
      latitude: '0',
      // 例: "131.5056"
      longitude: '0',
    },
    // 対応エリア。City / AdministrativeArea を必要分だけ。
    areaServed: [
      { type: 'City', name: 'TODO: Edit DummyText（仮）別府市' },
      { type: 'AdministrativeArea', name: 'TODO: Edit DummyText（仮）大分県' },
    ],
    // 営業時間（Personのときは空でもOK：出力しません）
    openingHours: {
      // 営業曜日（例: 平日のみなら Monday〜Friday）
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      // 開店時刻（24h表記 推奨）
      opens: '08:00',
      // 閉店時刻（24h表記 推奨）
      closes: '17:00',
    },
    // 公式SNS/地図などの関連URL（存在するものだけ並べる）
    sameAs: [
      'https://maps.google.com/?q=TODO: Edit GoogleMapUrl',
      'https://www.instagram.com/TODO: Edit InstagramUrl',
      'https://www.facebook.com/TODO: Edit FacebookUrl',
    ],
  },
  // ソフトウェア案件で entityType を "SoftwareApplication" にした場合は、ここを埋めてください。
  // ※ entityType が "SoftwareApplication" 以外のときは、この値があっても出力されません。
  software: {
    // アプリ名 / サービス名
    name: 'TODO: Edit DummyText （仮）My App',
    // 説明（任意）
    description: 'TODO: Edit DummyText （仮）◯◯ができるアプリです。',
    // カテゴリ（任意）
    applicationCategory: 'TODO: Edit DummyText  BusinessApplication',
    // 動作環境（任意）
    operatingSystem: ['Web', 'iOS', 'Android'],
    // 料金（任意）
    price: 'TODO: Edit DummyText 0',
    // 通貨（任意）
    priceCurrency: 'JPY',
  },
};
