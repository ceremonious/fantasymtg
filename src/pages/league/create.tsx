import { useRouter } from "next/router";
import React, { useState } from "react";
import { trpc } from "../../utils/trpc";

const CreateLeaguePage = () => {
  const router = useRouter();
  const [leagueName, setLeagueName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [startingAmount, setStartingAmount] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createLeague = trpc.useMutation("stocks.createLeague");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const resp = await createLeague.mutateAsync({
      leagueName,
      displayName,
      startingAmount,
      startDate: new Date(),
    });
    router.push(`/league/${resp.leagueID}`);
  };

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
          <form className="space-y-6" onSubmit={(e) => onSubmit(e)}>
            <div>
              <label
                htmlFor="leagueName"
                className="block text-sm font-medium text-gray-700"
              >
                League Name
              </label>
              <div className="mt-1">
                <input
                  required
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  type="text"
                  name="leagueName"
                  id="leagueName"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="The Charizards"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  type="text"
                  name="displayName"
                  id="displayName"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Ash"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="startingAmount"
                className="block text-sm font-medium text-gray-700"
              >
                Starting Amount
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  min={1}
                  value={startingAmount}
                  onChange={(e) =>
                    setStartingAmount(parseInt(e.target.value, 10))
                  }
                  required
                  type="number"
                  name="startingAmount"
                  id="startingAmount"
                  className="appearance-none block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <button
                disabled={isSubmitting}
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLeaguePage;
