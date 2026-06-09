# App Store Submission Notes

最終更新: 2026-06-09

## 方針

- iOS App Store版を主軸にする。
- PWA本格公開は今すぐ行わず、反応が出たら検討する。
- App Store説明文には「1年間限定公開」と書かない。
- 内部メモ: Apple Developer Programを1年だけ試す予定。継続可否は公開後に判断する。
- 広告なし、課金なし、ログインなし、個人情報収集なし、解析なしの設計を明確にする。

## アプリ情報

- アプリ名: `いきものずかん`
- サブタイトル案: `100種類のどうぶつ・むし・海の生きもの`
- Bundle ID: 既存仮設定 `jp.animalpicturebook.app`
- Support URL: `PLACEHOLDER_URL/support.html`
- Privacy Policy URL: `PLACEHOLDER_URL/privacy.html`

Apple公式ヘルプでは、App Store上のアプリ名とサブタイトルはそれぞれ30文字以内、iOSアプリのPrivacy Policy URLは必須とされています。提出直前にApp Store Connect上の最新表示で再確認してください。

## 説明文案

`いきものずかん`は、100種類のどうぶつ・むし・海の生きものを写真と短い説明で見られる、オフライン対応の図鑑アプリです。

生きものごとの写真、すんでいるところ、食べもの、特徴、まめちしきを収録しています。一覧から探したり、お気に入りに入れたり、前へ・次へ・ランダム表示でいろいろな生きものを見つけられます。

主要コンテンツはアプリ内に入っているため、通信できない場所でも閲覧できます。広告、アプリ内課金、ログイン、解析SDKは使用していません。

主な機能:

- 100種類の生きもの写真と説明
- 一覧と検索
- ひらがな・カタカナ検索
- お気に入り保存
- 前へ、次へ、ランダム表示
- 横スワイプ操作
- オフライン閲覧

## キーワード案

`いきもの,どうぶつ,動物,図鑑,写真,学習,こども,オフライン,むし,海`

## カテゴリ案

- Primary Category: `Education`
- Secondary Category: `Reference`

教育向けの写真図鑑として見せるならEducationが自然です。辞典・図鑑として探す用途を強調する場合はReferenceも候補になります。

## 年齢制限の考え方

- 想定: 低年齢でも使いやすい一般向け図鑑。
- 広告、課金、ログイン、ユーザー投稿、チャット、位置情報、外部Web閲覧はなし。
- 動物写真と説明は教育目的で、暴力的・性的・薬物・ギャンブルなどの要素はなし。
- App Store Connectの年齢レーティング質問票では、実装に合わせて該当なしまたは最低頻度を選ぶ方針。

## Kids Category判断メモ

現時点ではKids Categoryにしない方向。子ども向けに使える内容ではあるものの、Kids Categoryは追加要件や審査上の確認が増えるため、まずは一般向けの教育アプリとして提出する。App Store説明文では、保護者と一緒に使える写真図鑑として自然に説明する。

## App Reviewメモ案

このアプリは、100種類のどうぶつ・むし・海の生きものの写真と説明文をアプリ内に同梱したオフライン図鑑です。ログイン、広告、アプリ内課金、解析、外部通信SDKは使用していません。主要機能は一覧、検索、お気に入り、前後移動、ランダム表示、スワイプ操作です。インターネット接続なしでも閲覧できます。

## Privacy Nutrition Label / App Privacy回答メモ

現状の実装前提では、App Privacyは `Data Not Collected` 方針。

- 個人情報: 収集なし
- 位置情報: 収集なし
- 連絡先: 収集なし
- 写真、カメラ、マイク: 使用なし
- ユーザーID、ログイン情報: なし
- 広告データ、解析データ: なし
- トラッキング: なし
- お気に入り: 端末内保存のみ。外部送信なし。

外部SDK、問い合わせフォーム、サーバーログ収集、解析、広告、課金、ログインを追加した場合は、回答を必ず見直す。

## スクリーンショット撮影リスト

Apple公式ヘルプでは、App Store Connectにアップロードするスクリーンショットは1〜10枚です。iPhone向けは6.9インチ表示のサイズを優先して用意し、提出直前に最新仕様を確認してください。

- トップ画面、代表写真が大きく見える状態
- 一覧画面、`いきもの一覧` と検索欄が見える状態
- `らいおん` 検索結果
- お気に入りを付けた状態
- 詳細画面の説明ブロック
- オフラインでも見られることが伝わる画面構成

## iPhone実機確認チェックリスト

- 初回起動でトップ画面が表示される
- ホーム画面の表示名が `いきものずかん` として自然に見える
- アイコンが自然に見える
- 一覧画面上部がステータスバーやDynamic Islandに被らない
- `らいおん`, `ライオン`, `ちーたー`, `とら`, `ぱんだ` で検索できる
- お気に入り絞り込みが動く
- 詳細画像が表示される
- 詳細写真の微細アニメーションが自然に見える
- 前へ、次へ、ランダム、一覧へ戻る、トップへ戻るが動く
- 機内モードでも主要コンテンツが表示される
- 権限ダイアログが表示されない

## TestFlight確認チェックリスト

- Archiveとアップロードが通る
- TestFlight内部テストでインストールできる
- 初回起動、検索、お気に入り、詳細遷移が動く
- 機内モード確認が通る
- サポートURLとプライバシーポリシーURLが開ける
- メールの問い合わせリンクが意図した宛先になる
- 表示名、アイコン、スクリーンショット、説明文が提出内容と合っている

## 提出前チェックリスト

- `npm run build` が成功する
- `npm run ios:sync` が成功する
- Xcode Debug buildが成功する
- Release/Archiveが成功する
- Bundle IDを正式値にする
- Apple Developer Teamを設定する
- Signing & Capabilitiesを確認する
- App Store用アイコンを確認する
- Support URLを公開URLに置き換える
- Privacy Policy URLを公開URLに置き換える
- プライバシーポリシー制定日を正式日に置き換える
- 問い合わせメールを正式アドレスに置き換える
- App Privacy回答を実装と照合する
- スクリーンショットを最新仕様で用意する

## 参照

- App information: https://developer.apple.com/help/app-store-connect/reference/app-information
- App privacy: https://developer.apple.com/help/app-store-connect/reference/app-information/app-privacy/
- Manage app privacy: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
- Screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
- Set an app age rating: https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating
