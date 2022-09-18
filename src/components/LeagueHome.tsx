import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { GetLeagueHomePage } from "../domain/apiTypes";
import { getPortfolioWithPrices } from "../domain/transactions";
import {
  classNames,
  formatPrice,
  getMax,
  getPercentChange,
  mapArrayOn,
} from "../utils/tsUtil";
import PercentChangePill from "./PercentChangePill";
import StatsOverview from "./StatsOverview";

interface Props {
  pageData: GetLeagueHomePage;
}

export default function LeagueHome(props: Props) {
  //TODO: maybe update shape of api to avoid weird map/arr conversions
  const currLeagueMember = props.pageData.members.find((x) => x.isSelf);
  const cardPricesMap = mapArrayOn(props.pageData.cards, "id");
  const portfoliosWithNetWorth = new Map(
    Array.from(props.pageData.portfolios.entries()).map(([key, portfolio]) => [
      key,
      getPortfolioWithPrices(portfolio, cardPricesMap),
    ])
  );
  const currPortfolio =
    currLeagueMember !== undefined
      ? portfoliosWithNetWorth.get(currLeagueMember.id)
      : undefined;
  const leagueMemberMap = mapArrayOn(props.pageData.members, "id");
  const leaderBoard = Array.from(portfoliosWithNetWorth.entries())
    .map(([leagueMemberID, portfolio]) => {
      const displayName = leagueMemberMap[leagueMemberID]?.displayName ?? "";
      const maxCard = getMax(
        portfolio.cards,
        (a, b) => a.card.price * a.quantity - b.card.price * b.quantity
      );
      const maxCardName = maxCard?.card.name ?? "";

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

        <h2 className="mx-auto mt-8 max-w-6xl px-4 text-lg font-medium leading-6 text-gray-900 sm:px-6 lg:px-8">
          Leaderboard
        </h2>

        {/* Activity list (smallest breakpoint only) */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ul
            role="list"
            className="mt-2 divide-y divide-gray-200 overflow-hidden shadow"
          >
            {leaderBoard.map((member, index) => (
              <li key={member.id}>
                <a
                  href="#"
                  className="block bg-white pl-4 pr-4 py-4 hover:bg-gray-50"
                >
                  <span className="flex items-center">
                    <span className="font-bold text-gray-900">{index + 1}</span>
                    <img
                      className="ml-8 h-10 w-10 rounded-full sm:block"
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80"
                      alt=""
                    />
                    <span className="flex flex-col">
                      <span className="ml-2 truncate text-gray-700 font-bold">
                        {member.displayName}
                      </span>
                      <span className="ml-2 truncate text-gray-500 text-sm">
                        {member.maxCardName}
                      </span>
                    </span>
                    <span className="ml-auto font-medium text-gray-900">
                      {formatPrice(member.netWorth)}
                    </span>

                    <PercentChangePill percentChange={member.percentChange} />
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
