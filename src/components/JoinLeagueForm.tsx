import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import { focusRef } from "../utils/tsUtil";

export default function JoinLeagueForm(props: { leagueID: string }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createLeague = trpc.useMutation("stocks.joinLeague");
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    await createLeague.mutateAsync({
      displayName,
      leagueID: props.leagueID,
    });
    setIsSubmitting(false);
    router.push(`/league/${props.leagueID}`);
  };

  useEffect(() => {
    focusRef(inputRef);
  }, []);

  return (
    <form className="space-y-6" onSubmit={(e) => onSubmit(e)}>
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
        <button
          disabled={isSubmitting}
          type="submit"
          className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Joining..." : "Join"}
        </button>
      </div>
    </form>
  );
}
