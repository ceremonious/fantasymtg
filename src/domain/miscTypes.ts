import { CardID, LeagueMemberID } from "./dbTypes";

export interface Portfolio {
  cash: number;
  cards: { cardID: CardID; quantity: number }[];
}

export type NetWorthOverTime = {
  timestamp: Date;
  netWorths: Record<LeagueMemberID, number>;
}[];
