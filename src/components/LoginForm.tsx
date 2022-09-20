import {
  CountryCode,
  isValidPhoneNumber,
  parsePhoneNumber,
} from "libphonenumber-js";
import { useState } from "react";
import PhoneNumberInput from "../components/PhoneNumberInput";
import { getBaseUrl } from "../pages/_app";
import { supabase } from "../utils/supabaseClient";
import AuthCode from "react-auth-code-input";

type CodeStage = "GET_PHONE" | "GET_CODE";

interface Props {
  onSuccess: () => void;
}

export default function Login(props: Props) {
  const [country, setCountry] = useState<CountryCode>("US");
  const [phone, setPhone] = useState("");
  const [codeStage, setCodeStage] = useState<CodeStage>("GET_PHONE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [isCodeInvalid, setIsCodeInvalid] = useState(false);

  const onSubmitPhone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidPhoneNumber(phone, country)) {
      //TODO: show user
      console.error("Invalid");
      return;
    }
    setIsSubmitting(true);
    const phoneNumber = parsePhoneNumber(phone, country);

    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber.number,
    });
    setIsSubmitting(false);
    if (error === null) {
      setCodeStage("GET_CODE");
    } else {
      console.error(error);
    }
  };

  const onSubmitCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (code.length === 6) {
      const phoneNumber = parsePhoneNumber(phone, country);
      const url = `${getBaseUrl()}/api/loginOrSignup`;
      setIsSubmitting(true);
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.number,
          token: code,
        }),
      });
      setIsSubmitting(false);
      const data = await resp.json();
      if (data.status === "SUCCESS") {
        props.onSuccess();
      } else {
        setIsCodeInvalid(true);
        console.error("Invalid");
      }
    }
  };

  return (
    <>
      {codeStage === "GET_PHONE" ? (
        <form className="space-y-6" onSubmit={onSubmitPhone}>
          <PhoneNumberInput
            phone={phone}
            setPhone={setPhone}
            country={country}
            setCountry={setCountry}
          />
          <div>
            <button
              disabled={phone.length === 0}
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Code"}
            </button>
          </div>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={onSubmitCode}>
          <p className="mb-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter the Code sent to {phone}
          </p>
          <AuthCode
            containerClassName="flex w-full gap-4"
            inputClassName="text-center flex-1 w-0 rounded-md dark:bg-slate-600 focus:border focus:border-primary-500 dark:text-slate-200"
            allowedCharacters="numeric"
            onChange={(code) => setCode(code)}
          />
          <div>
            <button
              disabled={code.length !== 6}
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
