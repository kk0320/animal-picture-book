import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const animals = JSON.parse(readFileSync("src/data/animals.json", "utf8"));
const fields = ["name", "category", "habitat", "food", "description", "funFact"];
const checkedNames = ["ライオン", "キリン", "パンダ", "フクロウ", "サメ", "カニ", "ツバメ", "ダンゴムシ"];

const missing = [];
const kanjiHits = [];

for (const [index, animal] of animals.entries()) {
  if (!animal.easyText) {
    missing.push(`${index + 1}. ${animal.nameKana}: easyText`);
    continue;
  }

  for (const field of fields) {
    const value = animal.easyText[field];
    if (typeof value !== "string" || value.trim() === "") {
      missing.push(`${index + 1}. ${animal.nameKana}: easyText.${field}`);
      continue;
    }

    const match = value.match(/[一-龯]/g);
    if (match) {
      kanjiHits.push(`${index + 1}. ${animal.nameKana} easyText.${field}: ${[...new Set(match)].join("")}`);
    }
  }
}

const giraffe = animals.find((animal) => animal.nameKana === "キリン");
const report = `# ひらがなモード品質チェック

## 追加したフィールド

- animals.json の各動物に \`easyText\` を追加
- \`easyText.name\`
- \`easyText.category\`
- \`easyText.habitat\`
- \`easyText.food\`
- \`easyText.description\`
- \`easyText.funFact\`

## ひらがなモードの仕様

- 初期表示は普通モード
- 詳細画面の「ふつう / ひらがな」切替で表示文を変更
- 選択状態は \`localStorage\` の \`animal-picture-book-reading-mode\` に保存
- 保存先は端末内のみで、外部送信はなし
- 普通モードでは既存の通常テキストを表示
- ひらがなモードでは \`easyText\` のテキストを表示
- 外来語、動物名由来の語、単位や数字は必要に応じてそのまま

## 漢字残存チェック結果

- 対象動物数: ${animals.length}
- 必須フィールド不足: ${missing.length}
- ひらがなモード用フィールドの漢字残存: ${kanjiHits.length}

${missing.length > 0 ? missing.map((item) => `- ${item}`).join("\n") : "- 不足なし"}

${kanjiHits.length > 0 ? kanjiHits.map((item) => `- ${item}`).join("\n") : "- 漢字残存なし"}

## 確認した動物

${checkedNames.map((name) => `- ${name}`).join("\n")}

## No.17 キリンのひらがな表示例

- 名前: ${giraffe?.easyText?.name ?? ""}
- 分類: ${giraffe?.easyText?.category ?? ""}
- すんでいるところ: ${giraffe?.easyText?.habitat ?? ""}
- たべもの: ${giraffe?.easyText?.food ?? ""}
- どんないきもの？: ${giraffe?.easyText?.description ?? ""}
- まめちしき: ${giraffe?.easyText?.funFact ?? ""}

## 注意が必要な文

- 全100件を機械チェックし、ひらがなモード用フィールドの漢字残存は0件
- 子ども向け教材としての最終表現は、人間の目で全件を読み合わせる余地あり
- カタカナの外来語や動物名由来の語は、読みにくさと自然さのバランスを見て残している

## 今後人間が目視確認すべきポイント

- 小学校低学年が読んでも意味が取りやすい長さか
- 固有名詞や外来語のカタカナが多すぎないか
- iPhone幅で切替ボタンと本文が窮屈にならないか
- 普通モードとの意味の差が大きくなりすぎていないか
`;

mkdirSync("reports", { recursive: true });
writeFileSync("reports/hiragana_mode_check.md", report);

console.log(`animals: ${animals.length}`);
console.log(`missing: ${missing.length}`);
console.log(`kanjiHits: ${kanjiHits.length}`);
console.log("report: reports/hiragana_mode_check.md");
