import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const animals = JSON.parse(await fs.readFile(path.join(root, "src/data/animals.json"), "utf8"));
const outPath = path.join(root, "dev_notes/image_generation_prompts.md");

const sceneMap = {
  lion: "adult male lion in the African savanna",
  tiger: "Bengal tiger in a humid Asian forest",
  leopard: "leopard resting in a tree in an African woodland",
  cheetah: "cheetah standing in open grassland",
  jaguar: "jaguar near a river in a Central American rainforest",
  "snow-leopard": "snow leopard on a rocky Himalayan mountain slope",
  wolf: "gray wolf in a northern forest",
  fox: "red fox in a quiet meadow at the edge of a forest",
  "raccoon-dog": "raccoon dog in a Japanese woodland",
  dog: "domestic dog outdoors in natural light",
  cat: "domestic cat in a natural garden setting",
  bear: "brown bear in a mountain forest",
  "polar-bear": "polar bear on Arctic sea ice",
  panda: "giant panda in a misty bamboo forest",
  "red-panda": "red panda on a mossy tree branch in a mountain forest",
  elephant: "African elephant walking through savanna grassland",
  giraffe: "giraffe in an acacia savanna",
  zebra: "zebra on an African plain",
  rhinoceros: "rhinoceros in dry grassland",
  hippopotamus: "hippopotamus at the edge of an African river",
  gorilla: "silverback gorilla in a rainforest clearing",
  chimpanzee: "chimpanzee in a tropical forest",
  orangutan: "orangutan among rainforest trees",
  "japanese-macaque": "Japanese macaque in a snowy mountain forest",
  koala: "koala on a eucalyptus tree",
  kangaroo: "kangaroo in the Australian outback",
  wombat: "wombat in dry Australian woodland",
  sloth: "sloth hanging from a branch in a tropical rainforest",
  armadillo: "armadillo walking on forest floor",
  anteater: "giant anteater in South American grassland",
  horse: "horse standing in an open pasture",
  cow: "cow standing in green pasture",
  goat: "goat on a rocky hillside",
  sheep: "sheep in a grassy highland field",
  pig: "pig outdoors in a farm meadow",
  deer: "deer in a quiet forest clearing",
  reindeer: "reindeer on snowy tundra",
  camel: "camel in a desert landscape",
  alpaca: "alpaca in Andean highland grass",
  llama: "llama in the Andes",
  rabbit: "rabbit in a grassy meadow",
  squirrel: "squirrel on a tree trunk in a forest",
  hamster: "hamster in a natural dry grass setting",
  beaver: "beaver beside a forest stream",
  capybara: "capybara at a South American wetland",
  hedgehog: "hedgehog in fallen leaves",
  bat: "bat hanging in a natural cave opening",
  dolphin: "dolphin swimming in clear ocean water",
  orca: "orca surfacing in cold ocean water",
  whale: "humpback whale surfacing in open ocean",
  seal: "seal resting on cold coastal rocks",
  "sea-lion": "sea lion on a rocky shore",
  walrus: "walrus on Arctic ice",
  "sea-otter": "sea otter floating in kelp forest water",
  penguin: "emperor penguin on Antarctic ice",
  eagle: "eagle perched on a high mountain branch",
  hawk: "hawk perched in open woodland",
  owl: "owl perched in a dark forest",
  falcon: "falcon perched on a cliff ledge",
  crow: "crow perched on a bare branch",
  sparrow: "sparrow on a small branch near fields",
  swallow: "swallow perched near a wetland",
  swan: "swan on a calm lake",
  flamingo: "flamingo standing in a shallow salt lake",
  peacock: "peacock standing in a green forest edge",
  parrot: "parrot in a tropical rainforest",
  pelican: "pelican near a coastal lagoon",
  ostrich: "ostrich in African grassland",
  crocodile: "crocodile at a muddy riverbank",
  snake: "snake on forest floor",
  cobra: "cobra with hood raised in dry grassland",
  lizard: "lizard on a sunlit rock",
  turtle: "turtle near a freshwater pond",
  chameleon: "chameleon on a leafy branch",
  iguana: "iguana on a tropical tree branch",
  frog: "frog on a wet leaf beside a pond",
  salamander: "salamander on moss near a clean stream",
  shark: "shark swimming in blue ocean water",
  ray: "ray gliding over sandy sea floor",
  tuna: "tuna swimming in open ocean",
  salmon: "salmon swimming upstream in a clear river",
  clownfish: "clownfish among sea anemones on a coral reef",
  seahorse: "seahorse clinging to seagrass",
  octopus: "octopus on a rocky reef",
  squid: "squid swimming in open sea",
  jellyfish: "jellyfish drifting in clear ocean water",
  crab: "crab on a rocky tide pool",
  shrimp: "shrimp on coral reef sand",
  "hermit-crab": "hermit crab on a tropical beach",
  "rhinoceros-beetle": "rhinoceros beetle on tree bark",
  "stag-beetle": "stag beetle on tree bark",
  butterfly: "butterfly on a wildflower",
  bee: "bee on a flower collecting pollen",
  ant: "ant walking on forest floor leaves",
  dragonfly: "dragonfly perched on a reed near water",
  firefly: "firefly glowing in a summer forest at dusk",
  mantis: "praying mantis on a green plant stem",
  grasshopper: "grasshopper on tall grass",
  ladybug: "ladybug on a green leaf",
  "pill-bug": "pill bug on damp leaf litter"
};

const lines = [
  "# Image generation prompts",
  "",
  "Place finished files in `incoming_images/` with names matching the animal id, such as `lion.png` or `lion.jpg`.",
  ""
];

for (const animal of animals) {
  const scene = sceneMap[animal.id] ?? `${animal.nameKana} in its natural habitat`;
  lines.push(
    `## ${animal.id} / ${animal.nameKana}`,
    "",
    `Photorealistic wildlife photography of ${scene}, realistic animal encyclopedia image, one animal centered large in frame, natural habitat background, detailed fur, skin, feathers or scales as appropriate, natural lighting, high detail, educational, square or vertical composition, no text, no watermark, no logo, no cartoon, no illustration, no fantasy, no toy, no mascot.`,
    ""
  );
}

await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, lines.join("\n"), "utf8");
await fs.mkdir(path.join(root, "incoming_images"), { recursive: true });
console.log(outPath);
