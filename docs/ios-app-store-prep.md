# iOS App Store Preparation

最終更新: 2026-05-31

## 現在のiOS構成

- Capacitor: `@capacitor/core`, `@capacitor/ios`, `@capacitor/cli` 8.3.4
- iOSプロジェクト: `ios/App`
- Xcodeで開くファイル: `ios/App/App.xcodeproj`
- Web同梱元: `dist`
- iOS同梱先: `ios/App/App/public`
- Bundle ID仮設定: `jp.animalpicturebook.app`
- iOS Deployment Target: 15.0
- Capacitorプラグイン: 追加なし
- 広告SDK、解析SDK、ログインSDK、外部通信SDK: 追加なし
- `Info.plist` のカメラ、写真、マイク、位置情報、トラッキング等の権限説明キー: 追加なし

`ios/App/App/public` には `dist` からコピーしたWeb成果物が入っています。動物画像は100枚同梱済みです。iOSアプリ内では `node server.mjs` と `StartAnimalPictureBook.cmd` は使いません。

## Windows側で更新したとき

Web側を変更した場合だけ、次を実行します。

```bash
npm run build
npm run ios:sync
```

今回のRC1をそのままiOSへ入れるだけなら、すでに `dist` から `ios/App/App/public` へコピー済みです。`npm run ios:sync` は `dist` をiOSへ再コピーし、iOS用アイコンとスプラッシュ画像を既存PWAアイコンから作り直します。動物写真100枚は生成しません。

## Macへコピーするもの

推奨は `animal-picture-book` フォルダ全体をMacへコピーすることです。`node_modules` はMac側で入れ直せるため省略して構いません。

最小構成でコピーする場合も、次は必ず含めます。

- `ios/`
- `dist/`
- `public/`
- `src/`
- `scripts/`
- `package.json`
- `package-lock.json`
- `capacitor.config.ts`
- `index.html`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`

PC配布版ZIPは `packaging/dist/AnimalPictureBook_Offline_PWA_RC1.zip` です。iOSビルドには不要なので、コピーしてもしなくても構いません。

## Mac / Xcodeで開く手順

1. MacにXcodeをインストールします。
2. Xcodeを一度起動し、追加コンポーネントのインストールを完了します。
3. プロジェクトフォルダで依存関係を入れます。

```bash
npm install
npm run ios:sync
```

4. Xcodeで `ios/App/App.xcodeproj` を開きます。
5. Swift Package Managerの解決が走るので完了を待ちます。
6. 左のProject Navigatorで `App` project、`App` targetを選びます。
7. `Signing & Capabilities` でApple Developer Teamを選択します。
8. `Bundle Identifier` は自分のApple Developer Accountで使える一意のIDに変更します。例: `jp.example.animalpicturebook`
9. 不要なCapabilityは追加しません。

## iPhone実機確認手順

1. iPhoneをUSBでMacへ接続し、iPhone側でこのMacを信頼します。
2. Xcode上部の実行先に接続したiPhoneを選びます。
3. `App` schemeを選び、Runを実行します。
4. 初回は署名エラーが出る場合があります。`Signing & Capabilities` のTeamとBundle IDを確認します。
5. 起動後、次を確認します。

- 初回起動でネットワークなしでもホーム画面が表示される
- 100種類の動物一覧が表示される
- 動物詳細の写真が表示される
- 前へ、次へ、ランダム、一覧への移動が動く
- お気に入りが保存され、アプリ再起動後も残る
- 機内モードでも画像と説明文が表示される
- iPhone縦画面で文字やボタンが重ならない
- 権限ダイアログが表示されない

## App Store審査リスク確認

AppleのApp Review Guideline 4.2は、単なる再パッケージWebサイトではなく、アプリとして十分な機能、コンテンツ、UIが必要だとしています。このアプリは100種類の写真付き動物データをアプリ内に持ち、検索、お気に入り、前後移動、ランダム表示、スワイプ操作、完全オフライン閲覧があるため、単なる外部Webページ表示ではありません。

残るリスクは「図鑑コンテンツが静的で、WebView由来に見える」点です。提出前に次を確認してください。

- App Store説明文で「アプリ内に100種類の動物写真と説明を収録」「通信なしで閲覧可能」を明記する
- スクリーンショットで一覧、詳細、お気に入り、検索、オフライン利用の価値が分かる構成にする
- 初期表示や起動画面がCapacitorデフォルトに見えないことを確認する
- Bundle ID、表示名、アイコン、カテゴリ、年齢制限を正式値にする

## App Store用説明文草案

### アプリ名

どうぶつずかん

### サブタイトル

100種類の動物をオフラインで見られる写真図鑑

### 説明文

「どうぶつずかん」は、100種類の動物を写真と短い説明で見られるオフライン対応の動物図鑑です。

動物ごとの写真、すんでいるところ、食べもの、特徴、豆知識を収録しています。一覧から探したり、お気に入りに入れたり、前後移動やランダム表示でいろいろな動物を見つけられます。

すべての主要コンテンツはアプリ内に入っているため、通信できない場所でも閲覧できます。広告、ログイン、解析SDKは使用していません。

主な機能:

- 100種類の動物写真と説明
- 動物一覧と検索
- お気に入り保存
- 前へ、次へ、ランダム表示
- スワイプ操作
- 完全オフライン閲覧

### キーワード案

動物,図鑑,写真,学習,こども,オフライン,いきもの,どうぶつ

### レビュー用メモ案

このアプリは100種類の動物写真と説明文をアプリ内に同梱したオフライン動物図鑑です。ログイン、広告、解析、外部通信SDKは使用していません。主要機能は一覧、検索、お気に入り、前後移動、ランダム表示、スワイプ操作です。インターネット接続なしでも閲覧できます。

## プライバシーポリシー草案

公開前に、下記をWebページとして公開し、App Store ConnectのPrivacy Policy URLへ登録してください。

### どうぶつずかん プライバシーポリシー

「どうぶつずかん」は、利用者の個人情報を収集しません。

本アプリでは、広告SDK、解析SDK、ログインSDK、外部通信SDKを使用していません。アカウント登録は不要です。カメラ、写真、マイク、位置情報、連絡先、トラッキング権限は使用しません。

お気に入り情報は端末内に保存され、外部サーバーへ送信されません。アプリ内の動物写真と説明文はアプリ本体に同梱されており、閲覧のために通信を必要としません。

今後、機能追加により取り扱う情報が変わる場合は、このプライバシーポリシーを更新します。

お問い合わせ: `YOUR_CONTACT_EMAIL@example.com`

制定日: `YYYY-MM-DD`

## App Store Connectのプライバシー回答方針

現状の実装前提では、アプリが収集するデータは「なし」と回答する方針です。AppleはiOSアプリにPrivacy Policy URLを求め、App Store Connect上でデータの取り扱い説明も求めています。外部SDKを追加した場合は、そのSDKが収集するデータも含めて回答を見直してください。

## スクリーンショット手順

1. Xcodeで実機またはSimulatorにインストールします。
2. 端末の表示設定を標準に戻します。
3. 機内モードでも表示できることを確認します。
4. 以下の5枚を縦画面で撮影します。

- ホームまたは代表動物の大きな写真
- 動物一覧
- 検索結果
- お気に入り状態
- 動物詳細の説明ブロック

Appleのスクリーンショット仕様は変更される可能性があります。2026-05-31時点では、iPhone向けは6.9インチ用の縦画像 `1260 x 2736`、`1290 x 2796`、または `1320 x 2868` などが案内されています。6.9インチ用を用意しない場合は6.5インチ用が必要になります。提出直前にApp Store Connectの最新仕様を確認してください。

## 提出前チェックリスト

- Macで `npm install` が通る
- Macで `npm run ios:sync` が通る
- `ios/App/App.xcodeproj` がXcodeで開ける
- Swift Package Managerの依存解決が完了する
- 実機でDebug実行できる
- Release/Archiveが通る
- Bundle IDを正式なものに変更する
- Apple Developer Teamを設定する
- 表示名を正式名にする
- App Store用アイコンが意図通り表示される
- Splash表示がCapacitorデフォルトでない
- 権限ダイアログが出ない
- 機内モードで閲覧できる
- App Store説明文、スクリーンショット、プライバシーポリシーURLを用意する
- App Store Connectのプライバシー回答を「収集なし」方針で確認する

## 参考

- Capacitor Workflow: https://capacitorjs.com/docs/basics/workflow
- Capacitor Configuration: https://capacitorjs.com/docs/config
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Store Connect screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
- App Store Connect privacy: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
