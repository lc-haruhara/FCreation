## プロジェクト概要

microCMS 連携を想定した Astro 製の静的/SSR サイトスターターキット。
Cloudflare Workers にデプロイする構成で、お問い合わせフォーム（Resend / Turnstile / CSRF / Durable Object によるレート制限）を同梱する。

- Runtime: Node.js `22.12.0` / pnpm `10.32.1`（`mise.toml` 準拠）
- Framework: Astro 6 + `@astrojs/cloudflare` adapter
- 言語: TypeScript（`astro/tsconfigs/strict`）
- パスエイリアス: `@/*` → `src/*`

## セットアップ

### 必要なツール

- Node.js `22.12.0`（`mise.toml` に合わせる）
- pnpm `10.32.1`

### インストール

```sh
pnpm install
```

## 開発フロー

| 目的                                  | コマンド                                                |
| ------------------------------------- | ------------------------------------------------------- |
| 開発サーバー起動（`cf:prepare` 込み） | `pnpm dev`                                              |
| 本番ビルド                            | `pnpm build`                                            |
| ビルド結果の確認                      | `pnpm preview`                                          |
| 型チェック（Astro）                   | `pnpm check`                                            |
| ESLint                                | `pnpm lint` / `pnpm lint:fix`                           |
| Stylelint（SCSS/CSS）                 | `pnpm lint:scss`                                        |
| Prettier チェック / フォーマット      | `pnpm check:scss` / `pnpm format:scss`                  |
| Storybook                             | `pnpm storybook`                                        |
| Cloudflare 型生成                     | `pnpm cf:typegen`（env 別: `:staging` / `:production`） |
| ステージング Deploy                   | `pnpm deploy:staging`                                   |
| 本番 Deploy                           | `pnpm deploy:production`                                |
| 依存関係監査                          | `pnpm audit:deps` / `pnpm audit:deps:prod` / `pnpm deps:outdated` |

> `pnpm dev` / `pnpm cf:typegen` / `pnpm deploy*` は実行前に `scripts/init-wrangler.mjs`（`cf:prepare`）が自動で走り、`wrangler.template.jsonc` → `wrangler.jsonc` を生成する。`wrangler.jsonc` は生成物のため直接編集しても次回上書きされる。設定を変更する場合は `wrangler.template.jsonc` を編集すること。

## 環境変数

### 公開用（`PUBLIC_`）

`.env.local` / `.env.development` で管理する。Vite / Astro が読み込み、`import.meta.env.PUBLIC_*` でアクセスする。

- `PUBLIC_SITE_URL`（development / production）
- `PUBLIC_SITE_NAME`
- `PUBLIC_SITE_DESCRIPTION`
- `PUBLIC_SITE_TAGLINE`
- `PUBLIC_DEFAULT_OG_IMAGE`
- `PUBLIC_TITLE_SEPARATOR`
- `PUBLIC_GOOGLE_TAG_MANAGER_ID`
- `PUBLIC_COMPANY_NAME`
- `PUBLIC_COMPANY_TEL`
- `PUBLIC_COMPANY_EMAIL`
- `PUBLIC_COMPANY_POSTAL_CODE`
- `PUBLIC_COMPANY_ADDRESS_REGION`
- `PUBLIC_COMPANY_ADDRESS_LOCALITY`
- `PUBLIC_COMPANY_STREET_ADDRESS`
- `PUBLIC_TURNSTILE_SITE_KEY`

### 非公開（サーバー側）

これらは Vite ではなく **Cloudflare Workers の `env` バインディング**経由で参照するため、
`.env.*` ではなく Wrangler 専用の `.dev.vars` で管理する。

ローカル確認は `.dev.vars.example` を複製して `.dev.vars` を作成し設定する。
本番環境では同じキーを Cloudflare Workers の Secrets / Variables に設定する。

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`
- `TURNSTILE_SECRET_KEY`
- `CSRF_SECRET_KEY`

> 機密情報は `*.local` や `.dev.vars` など Git 管理外のファイルに保存してください。

## ディレクトリ構成

```text
/
├── public/
├── scripts/                  # wrangler.jsonc 生成スクリプトなど
├── src/
│   ├── assets/               # 画像など静的アセット
│   ├── cloudflare/           # Workers エントリ / Durable Object
│   ├── components/           # UI コンポーネント
│   │   ├── elements/         # ボタン・アイコン・入力などのプリミティブ
│   │   └── parts/            # accordions / modals などの複合パーツ
│   ├── core/                 # 設定・共通ロジック（SEO / contacts など）
│   │   ├── config/           # 案件カスタマイズの起点（後述）
│   │   ├── lib/              # ロジック層（SEO ビルダー / フォーム処理など）
│   │   └── types/            # 共通型定義
│   ├── layouts/              # レイアウト
│   ├── lib/                  # 外部ライブラリ関連（GSAP など）
│   ├── page-contents/        # ページ用コンテンツ
│   ├── pages/                # ルーティングページ（SSR エンドポイント含む）
│   └── resources/            # SCSS / リソース
├── wrangler.template.jsonc   # wrangler.jsonc のテンプレート（編集対象）
├── package.json
└── README.md
```

## core/config — 案件カスタマイズの起点

`src/core/config/` 配下は「案件ごとに編集が必要な設定値」を集約する層。
ロジックは `core/lib/` 側に置き、このディレクトリはあくまでも入力値のみを持つ。

### `pages.config.ts` — 固定ページ定義

サイトの固定ページを `definePage()` で宣言する **単一ソース**。
`path` / `title` / `description` / `schemaType` / `nav` の表示位置・順序などをここで管理する。
canonical / OGP / JSON-LD の組み立ては `core/lib/seo/` 側が担うため、ページ側で個別に組み立てない。

```ts
// 例: contact ページ
contact: definePage({
  path: '/contact',
  title: 'Contact',
  schemaType: 'ContactPage',
  nav: { showIn: ['global', 'drawer', 'footer'], order: { global: 90 } },
}),
```

microCMS など動的ページは「一覧/詳細のテンプレ定義」だけをここに置き、個別記事の title/description/OGP は CMS 側の値で上書きする想定。

### `site.config.ts` — サイト基本情報

サイト名・会社情報・GTM ID などを `import.meta.env.PUBLIC_*` 経由で参照してオブジェクトにまとめる。
コードへのハードコードは禁止。値は `.env.*` で管理する。

### `schemaOrg.config.ts` — JSON-LD カスタマイズ値

構造化データ（JSON-LD）の入力値を管理する。ここを編集することで `@graph` の生成内容を制御できる。

| 設定項目 | 内容 |
| -------- | ---- |
| `language` | サイトの言語（例: `"ja"`） |
| `breadcrumbHomeLabel` | パンくずの先頭ラベル |
| `company.entityType` | 事業者タイプ（`Organization` / `LocalBusiness` / `Person` / `SoftwareApplication`） |
| `company.logoPath` / `imagePath` | ロゴ・代表画像のパスまたは絶対 URL |
| `company.geo` | 緯度・経度 |
| `company.areaServed` | 対応エリア（`City` / `AdministrativeArea`） |
| `company.openingHours` | 営業時間・曜日 |
| `company.sameAs` | 公式 SNS / Google マップなどの関連 URL |
| `software` | `entityType: "SoftwareApplication"` 時のみ出力されるアプリ情報 |

> 生成ロジック（`@graph` 構造）は `core/lib/seo/schemaOrg.lib.ts` 側にある。構造変更が必要な場合はそちらを編集する。

### `link.config.ts` — リンクアイコン・補助テキスト設定

リンク種別（外部リンク / メール / 電話 / ダウンロード）に応じて自動付与する
Google Material Symbols のアイコン名と、スクリーンリーダー向け補助テキストを定義する。

```ts
// アイコン設定例（LINK_TYPE_ICON_MAP）
external: 'open_in_new',
mail:     'mail',
tel:      'phone',
download: 'download',
default:  'chevron_right',
```

使用したいアイコンが異なる場合はここを変更する（`core/lib/links/link.lib.ts` から参照される）。

### `contacts/contactFields.config.ts` — フォーム項目定義

お問い合わせフォームの全項目（`CONTACT_FIELDS`）を定義する。
フォーム項目の追加・削除・ラベル変更・選択肢変更はまずこのファイルを編集する。

各項目は `type`（`text` / `email` / `radio` / `select` / `checkbox-group` / `textarea`）と
`showInConfirm` / `showInMail` フラグで確認画面・メール本文への表示を制御できる。
honeypot 用の隠しフィールド（`CONTACT_HONEYPOT_FIELD`）もここで定義する。

### `contacts/contactMail.config.ts` — メール本文テンプレート

管理者向け通知メール・自動返信メールの件名・文言・署名などを管理する。
文言を変更したい場合はこのファイルの各関数を編集する。
会社情報（署名）は `site.config.ts` 経由で `.env.*` を参照するため、ここにハードコードしない。

### `contacts/contactForm.config.ts` — フォーム共通メッセージ

フォームバリデーション時に表示する共通エラーメッセージを管理する。

## microCMS 連携

現時点（2026-04）では microCMS クライアントの実装は未導入です。
連携する場合は以下の手順・環境変数を追加してください（案）：

### 手順（案）

1. microCMS 側でサービスを作成し、API Key を発行
2. `.env.local` などのローカル環境ファイルに API 情報を設定
3. `src/` 配下に microCMS クライアントを追加し、必要なページで取得処理を実装

### 環境変数（案）

- `MICROCMS_SERVICE_DOMAIN`：サービスドメイン
- `MICROCMS_API_KEY`：API Key

## セキュリティ運用

- このリポジトリでは `pnpm` を正規の package manager として扱います。
- リリース前と依存関係更新後に `pnpm audit:deps` を実行してください。
- 本番影響だけを確認したい場合は `pnpm audit:deps:prod` を実行してください。
- 定期的に `pnpm deps:outdated` を実行して更新候補を確認してください。
- GitHub Actions で週次と依存関係変更を含む Pull Request 時に dependency audit を実行します。
- Dependabot で npm パッケージと GitHub Actions の更新 Pull Request を週次で作成します。
