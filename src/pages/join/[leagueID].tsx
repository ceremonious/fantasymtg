import { GetServerSideProps } from "next";
import React, { useState } from "react";
import LoginForm from "../../components/LoginForm";
import JoinLeagueForm from "../../components/JoinLeagueForm";
import SingleCardPage from "../../components/SingleCardPage";

type Props =
  | {
      foundLeague: false;
    }
  | {
      foundLeague: true;
      league: {
        id: string;
        name: string;
      };
      creatorName: string;
      isAuthed: boolean;
    };

const JoinLeaguePage = (props: Props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!props.foundLeague) {
    //TODO: style
    return <p>No league</p>;
  }

  return (
    <SingleCardPage
      header={`Join ${props.league.name}`}
      helpText={`Created by ${props.creatorName}`}
    >
      {props.isAuthed || isLoggedIn ? (
        <JoinLeagueForm leagueID={props.league.id} />
      ) : (
        <LoginForm onSuccess={() => setIsLoggedIn(true)} />
      )}
    </SingleCardPage>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context
): Promise<{ props: Props }> => {
  const leagueID =
    typeof context.params?.leagueID === "string" ? context.params.leagueID : "";
  const isAuthed = Boolean(context.req.cookies.auth);

  if (prisma !== undefined) {
    const league = await prisma.league.findFirst({
      where: { id: leagueID },
      include: {
        leagueMember: { select: { isOwner: true, displayName: true } },
      },
    });
    if (league !== null) {
      const creatorName =
        league.leagueMember.find((x) => x.isOwner)?.displayName ?? "";
      return {
        props: {
          foundLeague: true,
          league: {
            id: leagueID,
            name: league.name,
          },
          creatorName,
          isAuthed,
        },
      };
    }
  }

  return {
    props: { foundLeague: false },
  };
};

export default JoinLeaguePage;
