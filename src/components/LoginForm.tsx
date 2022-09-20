import {
  CountryCode,
  isValidPhoneNumber,
  parsePhoneNumber,
} from "libphonenumber-js";
import { useRef, useState } from "react";
import LoginCodeInput from "../components/LoginCodeInput";
import PhoneNumberInput from "../components/PhoneNumberInput";
import { getBaseUrl } from "../pages/_app";
import { supabase } from "../utils/supabaseClient";
import { focusRef } from "../utils/tsUtil";

type CodeStage = "INIT" | "SENDING" | "SENT";

interface Props {
  onSuccess: () => void;
}

export default function Login(props: Props) {
  const [country, setCountry] = useState<CountryCode>("US");
  const [phone, setPhone] = useState("");
  const [codeStage, setCodeStage] = useState<CodeStage>("INIT");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = codeStage === "SENT" && code.length === 6;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      console.error("Invalid");
    }
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <PhoneNumberInput
        phone={phone}
        setPhone={setPhone}
        country={country}
        setCountry={setCountry}
      />

      <LoginCodeInput
        innerRef={codeInputRef}
        isPhoneValid={phone.length > 0}
        code={code}
        setCode={setCode}
        stage={codeStage}
        onSubmit={async () => {
          if (!isValidPhoneNumber(phone, country)) {
            //TODO: show user
            console.error("Invalid");
            return;
          }
          setCodeStage("SENDING");
          const phoneNumber = parsePhoneNumber(phone, country);

          const { error } = await supabase.auth.signInWithOtp({
            phone: phoneNumber.number,
          });
          if (error === null) {
            setCodeStage("SENT");
            focusRef(codeInputRef);
          } else {
            setCodeStage("INIT");
            console.error(error);
          }
        }}
      />

      {codeStage === "SENT" && (
        <div>
          <button
            disabled={!canSubmit}
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Sign In"}
          </button>
        </div>
      )}
    </form>
  );
}
