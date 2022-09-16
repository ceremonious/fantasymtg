import { GetServerSideProps } from "next";
import React from "react";

interface Props {
  leagueName: string;
  creatorName: string;
}

const LeaguePage = (props: Props) => {
  return <p>League page</p>;
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
