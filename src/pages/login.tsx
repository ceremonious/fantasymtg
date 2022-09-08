import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { getBaseUrl } from "./_app";

export default function Auth() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [shouldPromptCode, setShouldPromptCode] = useState(false);

  const onSubmitPhoneNumber = async () => {
    const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
    if (error === null) {
      setShouldPromptCode(true);
    } else {
      console.error(error);
    }
  };

  const onSubmitCode = async () => {
    const url = `${getBaseUrl()}/api/loginOrSignup`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        token: code,
      }),
    });
    console.log(resp.json());
  };

  if (shouldPromptCode) {
    return (
      <div className="row flex-center flex">
        <div className="col-6 form-widget">
          <h1 className="header">Supabase + Next.js</h1>
          <p className="description">Enter your code below</p>
          <div>
            <input
              className="inputField"
              placeholder="Your code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div>
            <button
              onClick={(e) => {
                e.preventDefault();
                onSubmitCode();
              }}
              className="button block"
            >
              <span>Send code</span>
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="row flex-center flex">
        <div className="col-6 form-widget">
          <h1 className="header">Supabase + Next.js</h1>
          <p className="description">
            Sign in via magic link with your email below
          </p>
          <div>
            <input
              className="inputField"
              placeholder="Your phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <button
              onClick={(e) => {
                e.preventDefault();
                onSubmitPhoneNumber();
              }}
              className="button block"
            >
              <span>Send code</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
