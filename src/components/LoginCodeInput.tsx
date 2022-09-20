import { RefObject } from "react";
import Input from "./design/Input";

interface Props {
  code: string;
  setCode: (val: string) => void;
  isPhoneValid: boolean;
  stage: "INIT" | "SENDING" | "SENT";
  onSubmit: () => void;
  innerRef?: RefObject<HTMLInputElement>;
}

export default function LoginCodeInput(props: Props) {
  let buttonTxt;
  if (props.stage === "INIT") {
    buttonTxt = "Send Code";
  } else if (props.stage === "SENDING") {
    buttonTxt = "Sending...";
  } else if (props.stage === "SENT") {
    buttonTxt = "Enter Code";
  }

  return (
    <div>
      <div className="mt-1 flex rounded-md shadow-sm">
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <Input
            innerRef={props.innerRef}
            maxLength={6}
            onChange={(e) => props.setCode(e.target.value)}
            value={props.code}
            type="text"
            id="code"
            name="code"
            className={
              props.stage !== "SENT" ? "rounded-none rounded-l-md" : ""
            }
            placeholder="432073"
          />
        </div>
        {props.stage !== "SENT" && (
          <button
            onClick={() => props.onSubmit()}
            disabled={!(props.stage === "INIT" && props.isPhoneValid)}
            type="button"
            className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 dark:bg-primary-600 dark:border-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-primary-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{buttonTxt}</span>
          </button>
        )}
      </div>
    </div>
  );
}
