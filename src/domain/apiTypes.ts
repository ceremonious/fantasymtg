import { Card, League, LeagueMember } from "@prisma/client";
import { NetWorthOverTime, Portfolio } from "./miscTypes";

export interface GetLeagueHomePage {
  league: Pick<League, "name">;
  members: (Pick<LeagueMember, "id" | "displayName" | "isOwner"> & {
    isSelf: boolean;
  })[];
  portfolios: Map<string, Portfolio>;
  netWorthOverTime: NetWorthOverTime;
  cards: (Card & { amountNormal?: number; amountFoil?: number })[];
}
