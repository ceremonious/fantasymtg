import { CardID } from "./dbTypes";

export interface Portfolio {
  cash: number;
  cards: { cardID: CardID; quantity: number }[];
}
