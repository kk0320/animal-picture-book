import animalsData from "./animals.json";

export type EasyText = {
  name: string;
  category: string;
  habitat: string;
  food: string;
  description: string;
  funFact: string;
};

export type Animal = {
  id: string;
  nameKana: string;
  category: string;
  habitat: string;
  food: string;
  description: string;
  funFact: string;
  image: string;
  easyText?: EasyText;
};

export const animals = animalsData as Animal[];
