import { ChartBarIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "../utils/tsUtil";

interface Props {
  netWorth: number;
  cash: number;
}

export default function StatsOverview(props: Props) {
  const cards = [
    { name: "Net Worth", icon: ChartBarIcon, amount: props.netWorth },
    { name: "Cash", icon: CurrencyDollarIcon, amount: props.cash },
  ];

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          Overview
        </h2>
        <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card */}
          {cards.map((card) => (
            <div
              key={card.name}
              className="overflow-hidden rounded-lg shadow bg-white dark:bg-slate-700 dark:border dark:border-slate-500"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <card.icon
                      className="h-6 w-6 text-gray-400 dark:text-gray-200"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-300">
                        {card.name}
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {formatPrice(card.amount)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
