import { Card } from "@prisma/client";

export interface CardPriceJWT {
  id: string;
  name: string;
  setName: string;
  scryfallURI: string;
  imageURI: string | null;
  cardType: "NORMAL" | "FOIL";
  price: number;
}

export interface Portfolio {
  cash: number;
  cards: { card: { id: string; type: "NORMAL" | "FOIL" }; quantity: number }[];
}

export interface EnrichedPortfolio extends Portfolio {
  cards: {
    card: {
      id: string;
      type: "NORMAL" | "FOIL";
      price: number;
      cardInfo: Pick<
        Card,
        "name" | "setName" | "scryfallURI" | "imageURI"
      > | null;
    };
    quantity: number;
  }[];
  netWorth: number;
}

export type NetWorthOverTime = {
  timestamp: Date;
  netWorths: Record<string, number>;
}[];
