import { prisma } from "../../server/db/client";

export async function getLeagueHomePage(leagueID: string) {
  const transactions = await prisma.transaction.findMany({
    where: { leagueID },
  });
}
