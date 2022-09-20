import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import LoginForm from "../components/LoginForm";
import { getAccountIDIfAuthed } from "../server/router/context";

const LandingPage = () => {
  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Log In
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm onSuccess={() => window.location.reload()} />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context
): Promise<
  | { props: Record<string, never> }
  | { redirect: { destination: string; permanent: false } }
> => {
  const accountID = getAccountIDIfAuthed(context?.req?.cookies?.auth);

  if (accountID !== null) {
    if (prisma !== undefined) {
      const leagueMember = await prisma.leagueMember.findFirst({
        where: { accountID },
        orderBy: { createdAt: "desc" },
      });
      if (leagueMember !== null) {
        return {
          redirect: {
            destination: `/league/${leagueMember.leagueID}`,
            permanent: false,
          },
        };
      }
    }

    return {
      redirect: {
        destination: `/league/create`,
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default LandingPage;
