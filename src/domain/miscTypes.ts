export interface CardPriceJWT {
  id: string;
  name: string;
  cardType: "NORMAL" | "FOIL";
  price: number;
}

export interface Portfolio {
  cash: number;
  cards: { card: { id: string; type: "NORMAL" | "FOIL" }; quantity: number }[];
}

export type NetWorthOverTime = {
  timestamp: Date;
  netWorths: Record<string, number>;
}[];
