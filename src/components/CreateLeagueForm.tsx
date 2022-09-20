import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import { focusRef } from "../utils/tsUtil";
import Input from "./design/Input";

export default function CreateLeaugeForm() {
  const router = useRouter();
  const [leagueName, setLeagueName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [startingAmount, setStartingAmount] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createLeague = trpc.useMutation("stocks.createLeague");
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    focusRef(inputRef);
  }, []);

  return (
    <form className="space-y-6" onSubmit={(e) => onSubmit(e)}>
      <div>
        <label
          htmlFor="leagueName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          League Name
        </label>
        <div className="mt-1">
          <Input
            innerRef={inputRef}
            required
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            type="text"
            name="leagueName"
            id="leagueName"
            placeholder="Phyrexians"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Username
        </label>
        <div className="mt-1">
          <Input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            type="text"
            name="displayName"
            id="displayName"
            placeholder="Jace"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="startingAmount"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Starting Amount
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-slate-300 sm:text-sm">$</span>
          </div>
          <Input
            min={1}
            value={startingAmount}
            onChange={(e) => setStartingAmount(parseInt(e.target.value, 10))}
            required
            type="number"
            name="startingAmount"
            id="startingAmount"
            className="appearance-none pl-7"
            placeholder="100"
          />
        </div>
      </div>

      <div>
        <button
          disabled={isSubmitting}
          type="submit"
          className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
