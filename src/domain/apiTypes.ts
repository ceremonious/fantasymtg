import { Card, League, LeagueMember } from "@prisma/client";
import { NetWorthOverTime, Portfolio } from "./miscTypes";

export interface GetLeagueHomePage {
  otherLeagues: Pick<League, "id" | "name">[];
  league: Pick<League, "name"> & { logo: string };
  members: (Pick<LeagueMember, "id" | "displayName" | "isOwner"> & {
    isSelf: boolean;
    profilePic: string;
  })[];
  portfolios: Map<string, Portfolio>;
  netWorthOverTime: NetWorthOverTime;
  cards: (Card & { amountNormal?: number; amountFoil?: number })[];
}
