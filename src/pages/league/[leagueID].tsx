import { GetServerSideProps } from "next";
import React from "react";
import LeagueLayout from "../../components/LeagueLayout";

interface Props {
  leagueName: string;
  creatorName: string;
}

const LeaguePage = (props: Props) => {
  const leftColumn = (
    <>
      <h2>Left Column</h2>
    </>
  );
  const rightColumn = (
    <>
      <h2>Right Column</h2>
    </>
  );

  return <LeagueLayout leftColumn={leftColumn} rightColumn={rightColumn} />;
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
