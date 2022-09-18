import { classNames } from "../../utils/tsUtil";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface Props {
  percentChange: number;
}

export default function PercentChangePill(props: Props) {
  if (props.percentChange > 0) {
    return (
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
        {props.percentChange}%
      </div>
    );
  } else if (props.percentChange === 0) {
    return (
      <div
        className={classNames(
          "bg-gray-100 text-gray-800 ml-2",
          "inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium"
        )}
      >
        <ArrowRightIcon
          className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-gray-500"
          aria-hidden="true"
        />
        {props.percentChange}%
      </div>
    );
  } else {
    return (
      <div
        className={classNames(
          "bg-red-100 text-red-800 ml-2",
          "inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium"
        )}
      >
        <ArrowDownIcon
          className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-red-500"
          aria-hidden="true"
        />
        {props.percentChange}%
      </div>
    );
  }
}
