import { GetServerSideProps } from "next";
import React from "react";
import Spinner from "../../components/design/Spinner";
import LeagueHome from "../../components/LeagueHome";
import LeagueLayout from "../../components/LeagueLayout";
import { enrichPortfolioWithCardData } from "../../domain/transactions";
import { trpc } from "../../utils/trpc";
import { mapArrayOn } from "../../utils/tsUtil";

interface Props {
  leagueID: string;
  leagueName: string;
  creatorName: string;
}

const LeaguePage = (props: Props) => {
  const { data, isLoading, error } = trpc.useQuery(
    ["stocks.leagueHome", { leagueID: props.leagueID }],
    {
      retry: (_, error) => {
        if (error.data?.code === "NOT_FOUND") {
          return false;
        } else {
          return true;
        }
      },
    }
  );

  if (data === undefined) {
    if (isLoading) {
      return (
        <LeagueLayout currMember={null} leagueName="">
          <div className="w-full flex justify-center">
            <Spinner className="mt-16 h-16 w-16" />
          </div>
        </LeagueLayout>
      );
    } else {
      return <p>Could not find league</p>;
    }
  } else if (error?.data?.code === "NOT_FOUND") {
    return <p>Could not find league</p>;
  } else {
    const leagueMemberID = data.members.find((x) => x.isSelf)?.id ?? null;
    const cardPricesMap = mapArrayOn(data.cards, "id");
    const enrichedPortfolios = new Map(
      Array.from(data.portfolios.entries()).map(([key, portfolio]) => [
        key,
        enrichPortfolioWithCardData(portfolio, cardPricesMap),
      ])
    );
    const currLeagueMember = data.members.find((x) => x.isSelf);
    const currPortfolio =
      currLeagueMember !== undefined
        ? enrichedPortfolios.get(currLeagueMember.id)
        : undefined;

    return (
      <LeagueLayout
        currMember={
          leagueMemberID !== null && currPortfolio !== undefined
            ? { id: leagueMemberID, cards: currPortfolio.cards }
            : null
        }
        leagueName={data.league.name}
      >
        <LeagueHome pageData={data} enrichedPortfolios={enrichedPortfolios} />
      </LeagueLayout>
    );
  }
};

export const getServerSideProps: GetServerSideProps = async (
  context
): Promise<{ props: Props }> => {
  const leagueID =
    typeof context.params?.leagueID === "string" ? context.params.leagueID : "";

  return {
    props: {
      leagueID,
      leagueName: "Cool Leage",
      creatorName: "Mayhul",
    },
  };
};

export default LeaguePage;
