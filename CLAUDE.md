# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

microCMS 連携を想定した Astro 製の静的/SSR サイトスターターキットを、**LP 用途（microCMS なし・コンタクトフォームなし・Studio デプロイ）向けに変換したプロジェクト**。

- Runtime: Node.js `22.12.0` / pnpm `10.32.1`（`mise.toml` 準拠）
- Framework: Astro 6（`output: 'static'`、アダプターなし）
- デプロイ先: Studio
- 言語: TypeScript（`astro/tsconfigs/strict`）
- パスエイリアス: `@/*` → `src/*`

---

## よく使うコマンド

| 目的                        | コマンド                                                      |
| --------------------------- | ------------------------------------------------------------- |
| 開発サーバー                | `pnpm dev`                                                    |
| 本番ビルド                  | `pnpm build`                                                  |
| ローカルで build 成果物確認 | `pnpm preview`                                                |
| 型チェック（Astro）         | `pnpm check`                                                  |
| ESLint                      | `pnpm lint` / `pnpm lint:fix`                                 |
| Stylelint（SCSS/CSS）       | `pnpm lint:scss`                                              |
| Prettier（SCSS）            | `pnpm check:scss` / `pnpm format:scss`                        |
| Storybook                   | `pnpm storybook`                                              |
| 依存関係監査                | `pnpm audit:deps` / `pnpm audit:deps:prod` / `pnpm deps:outdated` |

- テストフレームワークは未導入。単体テストのランナーは存在しない。

---

## アーキテクチャ

### ページ定義と SEO の単一ソース

- `src/core/config/pages.config.ts` が **固定ページの単一ソース**。`definePage()` で `path` / `title` / `description` / `schemaType` / `nav` などを宣言する。
- `src/core/lib/seo/`（`meta.lib.ts` / `schemaOrg.lib.ts` / `siteEnv.lib.ts`）が `pages.config.ts` と `site.config.ts` を組み合わせて canonical / OGP / JSON-LD を一貫生成する。ページ側で個別にメタを組み立てずに、この層を通す。
- `core/config/site.config.ts` はすべて `import.meta.env.PUBLIC_*` を参照する。サイト名・会社情報・GTM ID などは `.env*` で管理されており、コードにハードコードしない。

### コンポーネントの階層

- `src/components/elements/` — ボタン、アイコン、入力、リンクなどのプリミティブ。
- `src/components/parts/` — accordions / carousels / dialogs / modals / navigations / tabs などの複合パーツ。各ディレクトリに `index.ts` のバレルがあり、`@/components/parts/index.ts` 経由で import する。
- `src/layouts/Layout.astro` がルートレイアウトで、`Head` / `Root` / `Scripts` の下位コンポーネントを `src/layouts/assets/` に置く構成。
- `src/page-contents/` — 各ページの実コンテンツを置く。`src/pages/` のルートファイルは薄いラッパーで、`page-contents/` 配下のコンポーネントを読み込む構成。

### Input コンポーネント（`src/components/elements/inputs/`）

各コンポーネントは `field` オブジェクトではなく**直接 props**を受け取る設計に変更済み。

```astro
<!-- 個別に使う場合 -->
<InputFieldText name="email" type="email" label="メールアドレス" required />
<InputFieldTextarea name="message" label="メッセージ" rows={5} />
<InputFieldSelect name="plan" label="プラン" options={[{ value: 'a', label: 'A案' }]} />
<InputFieldChoice name="agree" type="radio" label="同意" options={[...]} />
```

config 駆動でまとめて描画したい場合は `InputFieldRenderer` に `InputField` 型のオブジェクトを渡す。型定義は `src/core/types/inputs/inputFields.type.ts`。

```astro
<!-- config 駆動で使う場合 -->
<InputFieldRenderer field={{ name: 'email', type: 'email', label: 'メール', required: true }} />
```

### スタイル

- SCSS のルートは `src/resources/styles/scss/main.scss`。各コンポーネントは `.astro` 内の `<style lang="scss">` か同居 `.scss` を使う。
- `vite.css.preprocessorOptions.scss.loadPaths` が `src` を含むため、SCSS 内では `src/` からの相対 import で解決できる。
- Stylelint は `stylelint-config-standard-scss` + `stylelint-config-recess-order`。Prettier は SCSS でのみチェックを回す運用。

### 主要な JavaScript リソース（バニラ JS）

`src/resources/js/` 配下はバンドルされない生の JS。Astro の `<script>` タグではなく、`Layout.astro` 内の `Scripts` コンポーネント経由でロードされる。

- `common.js` — 共通処理
- `loading.js` — ローディング制御
- `features/drawer.js` — ドロワーメニュー
- `features/modal.js` — モーダル開閉
- `features/scrollTop.js` — スクロールトップ
- `features/toggleOn.js` — トグル UI
- `library/twemoji.js` — 絵文字を SVG に置換

---

## カスタマイズポイント早見表

| ファイル                              | 変更内容                                          |
| ------------------------------------- | ------------------------------------------------- |
| `.env` / `.env.local`                 | サイト名・会社情報・GTM ID など                   |
| `src/core/config/site.config.ts`      | 環境変数キー名が変わる場合のみ（通常は `.env` 側のみ変更） |
| `src/core/config/pages.config.ts`     | ページ追加・削除・タイトル/description 変更        |
| `src/core/config/schemaOrg.config.ts` | 法人種別・住所・営業時間・SNS URL の TODO を埋める |
| `src/core/config/link.config.ts`      | リンクアイコンを変える場合（Material Symbols）     |

---

## LP 案件向けセットアップ（スターターキットからの変更手順）

**このプロジェクトは既に下記の変換済み**。同じスターターキットを複製して新たに LP 案件を始める場合は、以下の手順を Claude に依頼すること。

### 1. `astro.config.mjs` の変更

- `@astrojs/cloudflare` の import と `adapter: cloudflare()` を削除
- `output: 'static'` を追加
- `env.schema` からサーバー側の秘密情報（`RESEND_API_KEY` / `CONTACT_FROM_EMAIL` / `CONTACT_TO_EMAIL` / `CSRF_SECRET_KEY` / `TURNSTILE_SECRET_KEY` / `PUBLIC_TURNSTILE_SITE_KEY`）を削除
- `PUBLIC_SITE_URL` のみ残す（SEO 用途）

### 2. `package.json` のスクリプト整理

以下を削除する:
- `cf:prepare` / `cf:typegen` / `cf:typegen:staging` / `cf:typegen:production`
- `deploy` / `deploy:staging` / `deploy:production`
- `dev` スクリプトの `pnpm cf:prepare &&` プレフィックス

### 3. 不要パッケージの削除

```bash
pnpm remove @astrojs/cloudflare wrangler resend zod
```

### 4. 不要ファイル・ディレクトリの削除

```
src/pages/about-us.astro
src/pages/contact.astro
src/pages/privacy-policy.astro
src/pages/contact/               # confirm / complete
src/pages/api/                   # contacts API エンドポイント
src/page-contents/subs/          # about-us / contact / privacy-policy コンテンツ
src/page-contents/_demo/         # デモページ
src/core/lib/contacts/
src/core/config/contacts/
src/core/types/contact/
src/components/elements/lists/ListPrivacyPolicy/
src/components/elements/modal-contents/ModalCommon/ModalCommon[pp].astro
src/cloudflare/                  # Workers エントリ
src/worker.ts
worker-configuration.d.ts
wrangler.jsonc
wrangler.template.jsonc
scripts/init-wrangler.mjs
```

### 5. `src/core/config/pages.config.ts` の変更

`about` / `contact` / `privacyPolicy` の3エントリを削除する。

### 6. `src/pages/index.astro` の変更

`_demo/top-demo.astro` の参照を `@/page-contents/top/top.astro` に切り替える。

### 7. `src/components/elements/index.ts` の変更

以下を削除する:
```ts
// Inputs - Assets（全4行）
// Inputs - Elements（全4行）
export { default as ListPrivacyPolicy } ...
export { default as ModalContentsPrivacyPolicy } ...
```

### 8. `src/components/parts/mounts/MountModals/MountModals.astro` の変更

- `ModalContentsPrivacyPolicy` の import・使用箇所を削除
- Contact ページ判定ロジック（`isContact`）と関連するモーダルを削除

### 9. Input コンポーネントのリファクタ（任意・推奨）

スターターキットの Input コンポーネントは `field: ContactField` を受け取る設計になっているが、LP で UI 部品として使う場合は直接 props 設計に変更する方が使いやすい。

**変更内容:**
- `src/core/types/contact/contactFields.type.ts` を削除
- `src/core/types/inputs/inputFields.type.ts` を新設（コンタクト固有フィールドを除いた汎用 `InputField` 型）
- 各 Input コンポーネントの `field: ContactField` props を直接 props に展開
- `InputFieldRenderer` は `InputField` 型のオブジェクトを受け取り、各コンポーネントに展開して渡す形に変更
- `src/components/elements/index.ts` に Input 関連エクスポートを再追加

---

## 未実装項目

### schemaOrg.config.ts の TODO プレースホルダー

`src/core/config/schemaOrg.config.ts` に以下のダミー値が残っている。案件開始時に必ず埋めること。

- `areaServed`（別府市・大分県 → 実際のエリアに変更）
- `sameAs`（Google Maps URL / Instagram URL / Facebook URL）
- `SoftwareApplication` 用の `name` / `description` / `applicationCategory` / `ratingValue`

---

## コーディング規約

- ESLint は flat config（`eslint.config.mjs`）。`simple-import-sort` + `eslint-plugin-import` で **import を常にソート**し、未使用 import は `unused-imports` でエラーにする。手で import 順を崩さない。
- TS は `@typescript-eslint/consistent-type-imports` により型は必ず `import type` で、`import/consistent-type-specifier-style` によりトップレベルに分離する。`import { type Foo }` は使わない（`import type { Foo }` を使う）。
- コミットは明示的に依頼された場合のみ行う（グローバル CLAUDE.md ルール）。
- ページに新しい環境変数を追加する場合は `astro.config.mjs` の `env.schema` を更新すること。

## CI / 依存管理

- `.github/workflows/` に依存関係監査のワークフロー（週次 + 依存変更 PR 時）、`.github/dependabot.yml` で npm と GitHub Actions を週次更新する。
- パッケージマネージャは `pnpm` に固定（`packageManager` フィールド）。npm/yarn で操作しないこと。

## 修正・改善すべき点

### [高] `src/resources/js/features/drawer.js` がデッドコード

`drawer.js` の中身は `modal.js` と **完全に同一**（関数名も `initModal` のまま）で、どこからも import されていない。  
`src/resources/js/common.js` は `modal.js` を直接 import しており、`drawer.js` は完全に未使用。  
ドロワーの JS ロジックは `src/components/parts/navigations/` 配下の TypeScript 側で管理されている。  
**対応**: `drawer.js` を削除する。

### [中] `loading.js` と `modal.js` がグローバルスコープを汚染

- `loading.js` が `window.__runLoading` と `window.__loadingInitialized` を直接書き込む。
- `modal.js` が `window.closeAllModals` を書き込む。

Astro の View Transitions でページ遷移をまたいで状態を受け渡す意図があるが、グローバル汚染はバグの温床になる。  
`CustomEvent` やモジュールスコープの Map を使ったイベント駆動に置き換えるのが望ましい。

### [低] テストフレームワーク未導入

Vitest の導入が候補。
