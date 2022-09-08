import { Card, League, LeagueMember } from "@prisma/client";
import { LeagueMemberID } from "./dbTypes";
import { NetWorthOverTime, Portfolio } from "./miscTypes";

export interface GetLeagueHomePage {
  league: Pick<League, "name">;
  members: Pick<LeagueMember, "id" | "displayName" | "isOwner">[];
  portfolios: Map<LeagueMemberID, Portfolio>;
  netWorthOverTime: NetWorthOverTime;
  cards: (Card & { amount: number })[];
}
