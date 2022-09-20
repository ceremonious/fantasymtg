import { GetServerSideProps } from "next";
import React, { useState } from "react";
import LoginForm from "../../components/LoginForm";
import JoinLeagueForm from "../../components/JoinLeagueForm";

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
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Join {props.league.name}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Created by {props.creatorName}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {props.isAuthed || isLoggedIn ? (
            <JoinLeagueForm leagueID={props.league.id} />
          ) : (
            <LoginForm onSuccess={() => setIsLoggedIn(true)} />
          )}
        </div>
      </div>
    </div>
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
