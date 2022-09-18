import { GetServerSideProps } from "next";
import React from "react";
import LeagueHome from "../../components/LeagueHome";
import LeagueLayout from "../../components/LeagueLayout";
import { trpc } from "../../utils/trpc";

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
      return <p>Loading</p>;
    } else {
      return <p>Could not find league</p>;
    }
  } else if (error?.data?.code === "NOT_FOUND") {
    return <p>Could not find league</p>;
  } else {
    const leagueMemberID = data.members.find((x) => x.isSelf)?.id ?? null;

    return (
      <LeagueLayout
        leagueMemberID={leagueMemberID}
        leagueName={data.league.name}
      >
        <LeagueHome pageData={data} />
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
