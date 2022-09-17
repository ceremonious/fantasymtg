import { GetServerSideProps } from "next";
import React from "react";
import LeagueHome from "../../components/LeagueHome";
import LeagueLayout from "../../components/LeagueLayout";

interface Props {
  leagueName: string;
  creatorName: string;
}

const LeaguePage = (props: Props) => {
  return (
    <LeagueLayout>
      <LeagueHome />
    </LeagueLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context
): Promise<{ props: Props }> => {
  return {
    props: {
      leagueName: "Cool Leage",
      creatorName: "Mayhul",
    },
  };
};

export default LeaguePage;
