# いきものずかん サポートサイト

Cloudflare Pagesでそのまま公開できる静的HTMLです。外部CDN、外部JavaScript、広告、解析、トラッキング、フォームは使っていません。

## 構成

- `index.html`: サポートサイトのトップ
- `support.html`: App StoreのSupport URL候補
- `privacy.html`: App StoreのPrivacy Policy URL候補
- `faq.html`: よくある質問
- `styles.css`: 共通スタイル

## Cloudflare Pages公開手順

1. Cloudflare Pagesで新しいプロジェクトを作成します。
2. このリポジトリを接続します。
3. Framework presetは `None` を選びます。
4. Build commandは空欄にします。
5. Build output directoryは `support-site` にします。
6. デプロイ前に下記のプレースホルダーを正式値へ置き換えます。

## 公開前に置き換える項目

- `https://ikimono-zukan-support.pages.dev`: Cloudflare Pagesで発行された公開URL
- `yasashii.zukan.support@gmail.com`: 問い合わせ用メールアドレス
- `2026-06-09`: プライバシーポリシー制定日

## App Store Connectへ入力するURL

- Support URL: `https://ikimono-zukan-support.pages.dev/support.html`
- Privacy Policy URL: `https://ikimono-zukan-support.pages.dev/privacy.html`

公開・サポート内容は予告なく変更される場合があります。
