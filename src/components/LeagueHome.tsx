import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { GetLeagueHomePage } from "../domain/apiTypes";
import StatsOverview from "./StatsOverview";

const transactions = [
  {
    id: 1,
    name: "Molly Sanders",
    card: "Fable of the Mirror-Breaker",
    href: "#",
    amount: "$20,000",
    currency: "USD",
    status: "success",
    date: "July 11, 2020",
    datetime: "2020-07-11",
  },
  {
    id: 2,
    name: "Molly Sanders",
    card: "Fable of the Mirror-Breaker",
    href: "#",
    amount: "$20,000",
    currency: "USD",
    status: "success",
    date: "July 11, 2020",
    datetime: "2020-07-11",
  },
  {
    id: 3,
    name: "Molly Sanders",
    card: "Fable of the Mirror-Breaker",
    href: "#",
    amount: "$20,000",
    currency: "USD",
    status: "success",
    date: "July 11, 2020",
    datetime: "2020-07-11",
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  pageData: GetLeagueHomePage;
}

export default function LeagueHome(props: Props) {
  return (
    <>
      <div className="mt-8">
        <StatsOverview />

        <h2 className="mx-auto mt-8 max-w-6xl px-4 text-lg font-medium leading-6 text-gray-900 sm:px-6 lg:px-8">
          Leaderboard
        </h2>

        {/* Activity list (smallest breakpoint only) */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ul
            role="list"
            className="mt-2 divide-y divide-gray-200 overflow-hidden shadow"
          >
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                <a
                  href={transaction.href}
                  className="block bg-white pl-4 pr-4 py-4 hover:bg-gray-50"
                >
                  <span className="flex items-center">
                    <span className="font-bold text-gray-900">1</span>
                    <img
                      className="ml-8 h-10 w-10 rounded-full sm:block"
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80"
                      alt=""
                    />
                    <span className="flex flex-col">
                      <span className="ml-2 truncate text-gray-700 font-bold">
                        {transaction.name}
                      </span>
                      <span className="ml-2 truncate text-gray-500 text-sm">
                        {transaction.card}
                      </span>
                    </span>
                    <span className="ml-auto font-medium text-gray-900">
                      {transaction.amount}
                    </span>

                    <div
                      className={classNames(
                        "bg-green-100 text-green-800 ml-2",
                        "inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium"
                      )}
                    >
                      <ArrowUpIcon
                        className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-500"
                        aria-hidden="true"
                      />
                      12%
                    </div>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
