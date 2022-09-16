import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import LoginForm from "../../components/LoginForm";

interface Props {
  league: {
    id: string;
    name: string;
  };
  creatorName: string;
}

const JoinLeaguePage = (props: Props) => {
  const router = useRouter();

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
          <LoginForm
            onSuccess={() => router.push(`/league/${props.league.id}`)}
          />
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

  return {
    props: {
      league: {
        id: leagueID,
        name: "Cool League",
      },
      creatorName: "Mayhul",
    },
  };
};

export default JoinLeaguePage;
