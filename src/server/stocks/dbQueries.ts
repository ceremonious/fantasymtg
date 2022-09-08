import { LeagueID } from "../../domain/dbTypes";
import { prisma } from "../../server/db/client";

export async function getLeagueHomePage(leagueID: LeagueID) {
  const transactions = await prisma.transaction.findMany({
    where: { leagueID },
  });
}
