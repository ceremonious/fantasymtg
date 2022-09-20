import { GetServerSideProps } from "next";
import React, { useState } from "react";
import CreateLeagueForm from "../../components/CreateLeagueForm";
import LoginForm from "../../components/LoginForm";
import SingleCardPage from "../../components/SingleCardPage";

interface Props {
  isAuthed: boolean;
}

const CreateLeaguePage = (props: Props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SingleCardPage header="Create League">
      {props.isAuthed || isLoggedIn ? (
        <CreateLeagueForm />
      ) : (
        <LoginForm onSuccess={() => setIsLoggedIn(true)} />
      )}
    </SingleCardPage>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context
): Promise<{ props: Props }> => {
  const isAuthed = Boolean(context.req.cookies.auth);

  return {
    props: {
      isAuthed,
    },
  };
};

export default CreateLeaguePage;
