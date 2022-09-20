import { InputHTMLAttributes, RefObject } from "react";
import { classNames } from "../../utils/tsUtil";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  innerRef?: RefObject<HTMLInputElement>;
}

export default function Input(props: Props) {
  return (
    <input
      {...props}
      ref={props.innerRef}
      className={classNames(
        "dark:bg-slate-600 dark:highlight-white dark:text-slate-200 dark:placeholder:text-slate-500 block w-full rounded-md border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm",
        props.className ?? ""
      )}
    />
  );
}
