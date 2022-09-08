import { LeagueMember } from "@prisma/client";
import { LeagueMemberID } from "./dbTypes";
import { Portfolio } from "./miscTypes";

export interface GetLeagueHomePage {
  members: Pick<LeagueMember, "id" | "displayName">[];
  portfolios: Map<LeagueMemberID, Portfolio>;
}
