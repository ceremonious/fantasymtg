import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import LoginForm from "../components/LoginForm";
import SingleCardPage from "../components/SingleCardPage";
import { prisma } from "../server/db/client";
import { getAccountIDIfAuthed } from "../server/router/context";

const LandingPage = () => {
  return (
    <>
      <Head>
        <title>Fantasy MTG</title>
        <meta property="og:title" content="Fantasy MTG" key="title" />
      </Head>
      <SingleCardPage header="Log In">
        <LoginForm onSuccess={() => window.location.reload()} />
      </SingleCardPage>
    </>
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
