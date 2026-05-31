import animalsData from "./animals.json";

export type Animal = {
  id: string;
  nameKana: string;
  category: string;
  habitat: string;
  food: string;
  description: string;
  funFact: string;
  image: string;
};

export const animals = animalsData as Animal[];
