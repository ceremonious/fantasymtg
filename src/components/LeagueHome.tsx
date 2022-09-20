import { GetLeagueHomePage } from "../domain/apiTypes";
import { EnrichedPortfolio } from "../domain/miscTypes";
import {
  formatPrice,
  getMax,
  getPercentChange,
  mapArrayOn,
} from "../utils/tsUtil";
import PercentChangePill from "./design/PercentChangePill";
import StatsOverview from "./StatsOverview";

interface Props {
  pageData: GetLeagueHomePage;
  enrichedPortfolios: Map<string, EnrichedPortfolio>;
}

export default function LeagueHome(props: Props) {
  //TODO: maybe update shape of api to avoid weird map/arr conversions
  const currLeagueMember = props.pageData.members.find((x) => x.isSelf);
  const currPortfolio =
    currLeagueMember !== undefined
      ? props.enrichedPortfolios.get(currLeagueMember.id)
      : undefined;
  const leagueMemberMap = mapArrayOn(props.pageData.members, "id");
  const leaderBoard = Array.from(props.enrichedPortfolios.entries())
    .map(([leagueMemberID, portfolio]) => {
      const displayName = leagueMemberMap[leagueMemberID]?.displayName ?? "";
      const profilePic = leagueMemberMap[leagueMemberID]?.profilePic ?? "";
      const maxCard = getMax(
        portfolio.cards,
        (a, b) => a.card.price * a.quantity - b.card.price * b.quantity
      );
      const maxCardName = maxCard?.card.cardInfo?.name ?? "";

      let percentChange: number | null = null;
      let prevNetWorth: number | undefined;
      const maxIndex = props.pageData.netWorthOverTime.length - 1;
      const prevNetWorthMap =
        props.pageData.netWorthOverTime[maxIndex - 7] ??
        props.pageData.netWorthOverTime[maxIndex - 1];
      if (prevNetWorthMap !== undefined) {
        prevNetWorth = prevNetWorthMap.netWorths[leagueMemberID];
      }
      if (prevNetWorth !== undefined) {
        percentChange = getPercentChange(prevNetWorth, portfolio.netWorth);
      }

      return {
        id: leagueMemberID,
        displayName,
        profilePic,
        maxCardName,
        netWorth: portfolio.netWorth,
        percentChange,
      };
    })
    .sort((a, b) => b.netWorth - a.netWorth);

  return (
    <>
      <div className="mt-8">
        {currPortfolio !== undefined && (
          <StatsOverview
            netWorth={currPortfolio.netWorth}
            cash={currPortfolio.cash}
          />
        )}

        <h2 className="mx-auto mt-8 max-w-6xl px-4 text-lg font-medium leading-6 text-gray-900 dark:text-white sm:px-6 lg:px-8">
          Leaderboard
        </h2>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ul role="list" className="mt-2 space-y-1 overflow-hidden shadow">
            {leaderBoard.map((member, index) => (
              <li key={member.id}>
                <a
                  href="#"
                  className="block bg-white pl-4 pr-4 py-4 hover:bg-gray-50 rounded-lg dark:bg-slate-700 dark:border dark:border-slate-500"
                >
                  <span className="flex items-center">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {index + 1}
                    </span>
                    <img
                      className="ml-8 h-10 w-10 rounded-full sm:block dark:border dark:border-gray-500"
                      src={member.profilePic}
                      alt={member.displayName}
                    />
                    <span className="flex flex-col">
                      <span className="ml-2 truncate font-bold text-gray-700 dark:text-gray-100">
                        {member.displayName}
                      </span>
                      <span className="ml-2 truncate text-gray-500 dark:text-gray-300 text-sm">
                        {member.maxCardName}
                      </span>
                    </span>
                    <span className="ml-auto font-medium text-gray-900 dark:text-gray-100">
                      {formatPrice(member.netWorth)}
                    </span>
                    {member.percentChange !== null && (
                      <PercentChangePill percentChange={member.percentChange} />
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
