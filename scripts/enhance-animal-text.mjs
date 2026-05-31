import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "src/data/animals.json");
const animals = JSON.parse(await fs.readFile(dataPath, "utf8"));

const categoryLines = {
  "ホニュウルイ": {
    habitat: "体温をたもつため、休む場所や水場も大切です。",
    food: "歯や口の形を見ると、食べ方のちがいがわかります。",
    description: "子どもは親や群れから、食べ物の探し方を少しずつ学びます。",
    funFact: "足あと、耳、しっぽの動きにも、その動物らしさが出ます。"
  },
  "トリ": {
    habitat: "巣を作る場所、えさ場、水場を行き来してくらします。",
    food: "くちばしの形は、食べ物に合わせて少しずつちがいます。",
    description: "羽は飛ぶだけでなく、体温を守る役にも立ちます。",
    funFact: "羽の色や鳴き声は、仲間への合図にも使われます。"
  },
  "ハチュウルイ": {
    habitat: "日光で体をあたためられる場所をよく使います。",
    food: "食べる回数は少なくても、じっくり消化できる種類がいます。",
    description: "うろこやこうらは、体を守り水分をにがしにくくします。",
    funFact: "体温はまわりの温度に左右されるため、日なたと日かげを使い分けます。"
  },
  "リョウセイルイ": {
    habitat: "水としめった土がある環境で、命をつないでいます。",
    food: "動く小さな生き物を見つけて食べる種類が多いです。",
    description: "水の中と陸の両方を使う、変化の大きい生き物です。",
    funFact: "皮ふがかわきすぎると弱るため、環境の変化にびんかんです。"
  },
  "サカナ": {
    habitat: "水温、流れ、深さによって、すむ場所が変わります。",
    food: "口の向きや歯の形に、食べ物のとり方が表れます。",
    description: "ひれを使って、止まる、曲がる、速く泳ぐ動きをします。",
    funFact: "体の色やもようは、光の少ない水中で身を守る助けになります。"
  },
  "ムセキツイ": {
    habitat: "岩場、砂地、海草の中など、かくれ場所の多い場所を使います。",
    food: "小さな生き物や貝などを、体のつくりに合わせて食べます。",
    description: "骨のない体でも、すばやく動いたり形を変えたりできます。",
    funFact: "海のそうじ役や、ほかの生き物のえさとしても大切です。"
  },
  "コウカクルイ": {
    habitat: "水辺や海底で、岩や砂にかくれながらくらします。",
    food: "食べ物をはさみや足で探り、少しずつ食べます。",
    description: "かたいからで体を守り、成長するときにぬぎます。",
    funFact: "ぬけがらを観察すると、足やはさみの形がよくわかります。"
  },
  "コンチュウ": {
    habitat: "草、木、土、水辺など、種類ごとにすむ場所がちがいます。",
    food: "小さな口やあごを使い、花、葉、虫などを食べます。",
    description: "小さな体でも、変態や飛ぶ力でくらしを広げます。",
    funFact: "体の節、触角、羽を見ると、くらし方のヒントが見つかります。"
  },
  "ムシ": {
    habitat: "しめった落ち葉の下など、かわきにくい場所を好みます。",
    food: "落ち葉や小さなくずを食べ、土へもどす助けをします。",
    description: "身近な場所にいて、土の中の小さな世界を支えます。",
    funFact: "小さくても、森や庭の物質のめぐりに関わっています。"
  }
};

const animalNotes = {
  lion: "群れの中で役わりがあり、声やにおいでなわばりを知らせます。",
  tiger: "しまもようは草や木の影にまぎれ、近づくときの助けになります。",
  leopard: "木の上で休む姿から、強い体とバランス感覚がわかります。",
  cheetah: "速く走るため、体は軽く、背骨はしなやかに動きます。",
  jaguar: "水辺のえものも追えるため、森と川をつなぐ存在です。",
  elephant: "鼻の先まで器用に動き、仲間とのふれあいにも使います。",
  giraffe: "高い葉を食べることで、ほかの草食動物と食べ場所を分けています。",
  panda: "竹を食べる時間が長く、静かな山の森に合ったくらしです。",
  penguin: "水中では鳥というより魚のように速く方向を変えます。",
  owl: "顔の形は音を集めやすく、暗い森での狩りに役立ちます。",
  crocodile: "水辺でじっと待つ時間が長く、少ない動きで力をたくわえます。",
  shark: "海の食物連鎖の上のほうにいて、魚の数のバランスに関わります。",
  octopus: "色や皮ふの凹凸を変え、岩や海草にまぎれることができます。",
  bee: "花粉を運ぶことで、果物や野菜が育つ助けにもなります。",
  ant: "小さな道しるべを仲間と使い、複雑な巣を作ります。"
};

const rewritten = animals.map((animal) => {
  const lines = categoryLines[animal.category] ?? categoryLines["ホニュウルイ"];
  const note = animalNotes[animal.id] ?? lines.funFact;
  return {
    ...animal,
    habitat: `${animal.habitat}\n${lines.habitat}`,
    food: `${animal.food}\n${lines.food}`,
    description: `${animal.description}\n${lines.description}`,
    funFact: `${animal.funFact}\n${note}`
  };
});

await fs.writeFile(dataPath, `${JSON.stringify(rewritten, null, 2)}\n`, "utf8");
console.log(`Updated ${rewritten.length} animals.`);
