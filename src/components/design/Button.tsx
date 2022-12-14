import { assertNever, classNames } from "../../utils/tsUtil";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: JSX.Element | string;
  size?: "sm" | "md";
  color?: "white" | "primary";
}

export default function Button(props: Props) {
  const size = props.size ?? "sm";
  const color = props.color ?? "white";

  let sizeClasses: string;
  if (size === "sm") {
    sizeClasses = "px-3 py-2";
  } else if (size === "md") {
    sizeClasses = "px-4 py-2";
  } else {
    assertNever(size);
  }

  let colorClasses: string;
  if (color === "white") {
    colorClasses =
      "border-gray-300 bg-white text-gray-700  hover:bg-gray-50 dark:border-transparent dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-gray-300";
  } else if (color === "primary") {
    colorClasses =
      "border-transparent bg-primary-600 text-white hover:bg-primary-700";
  } else {
    assertNever(color);
  }

  return (
    <button
      disabled={props.disabled}
      onClick={() => props.onClick()}
      type="button"
      className={classNames(
        "inline-flex items-center rounded-md border",
        colorClasses,
        sizeClasses,
        "text-sm font-medium shadow-sm",
        props.className ?? ""
      )}
    >
      {props.children}
    </button>
  );
}
