import { GetServerSideProps } from "next";
import React, { useState } from "react";
import CreateLeagueForm from "../../components/CreateLeagueForm";
import LoginForm from "../../components/LoginForm";

interface Props {
  isAuthed: boolean;
}

const CreateLeaguePage = (props: Props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create League
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {props.isAuthed || isLoggedIn ? (
            <CreateLeagueForm />
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
  const isAuthed = Boolean(context.req.cookies.auth);

  return {
    props: {
      isAuthed,
    },
  };
};

export default CreateLeaguePage;
