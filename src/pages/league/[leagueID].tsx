import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Spinner from "../../components/design/Spinner";
import LeagueHome from "../../components/LeagueHome";
import LeagueLayout from "../../components/LeagueLayout";
import { enrichPortfolioWithCardData } from "../../domain/transactions";
import { trpc } from "../../utils/trpc";
import { mapArrayOn, pick } from "../../utils/tsUtil";

interface Props {
  leagueID: string;
  leagueName: string;
  creatorName: string;
}

function LeaguePageComponent(props: Props) {
  const router = useRouter();
  const { data, isLoading, error } = trpc.useQuery(
    ["stocks.leagueHome", { leagueID: props.leagueID }],
    {
      retry: (numRetries, error) => {
        if (
          error.data?.code === "NOT_FOUND" ||
          error.data?.code === "UNAUTHORIZED"
        ) {
          return false;
        } else {
          return numRetries < 3;
        }
      },
    }
  );

  const isUnauthed = error?.data?.code === "UNAUTHORIZED";
  useEffect(() => {
    if (isUnauthed) {
      router.push("/");
    }
  }, [isUnauthed, router]);

  if (data === undefined) {
    if (isLoading) {
      return (
        <LeagueLayout otherLeagues={[]} currMember={null} league={null}>
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
      <>
        <Head>
          <title>{data.league.name}</title>
          <meta property="og:title" content={data.league.name} key="title" />
        </Head>
        <LeagueLayout
          otherLeagues={data.otherLeagues}
          currMember={
            currLeagueMember !== undefined && currPortfolio !== undefined
              ? {
                  ...pick(currLeagueMember, "id", "displayName", "profilePic"),
                  portfolio: currPortfolio,
                }
              : null
          }
          league={data.league}
        >
          <LeagueHome pageData={data} enrichedPortfolios={enrichedPortfolios} />
        </LeagueLayout>
      </>
    );
  }
}

function LeaguePage(props: Props) {
  return (
    <>
      <Head>
        <title>Fantasy MTG</title>
        <meta property="og:title" content="Fantasy MTG" key="title" />
      </Head>
      <LeaguePageComponent {...props} />
    </>
  );
}

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
