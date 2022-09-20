import { CountryCode, getCountries } from "libphonenumber-js";
import { useEffect, useRef } from "react";
import { focusRef } from "../utils/tsUtil";
import Input from "./design/Input";

interface Props {
  country: CountryCode;
  setCountry: (val: CountryCode) => void;
  phone: string;
  setPhone: (val: string) => void;
}

export default function PhoneNumberInput(props: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    focusRef(ref);
  }, [ref]);

  return (
    <div>
      <label
        htmlFor="phone-number"
        className="block text-sm font-medium text-gray-700"
      >
        Phone Number
      </label>
      <div className="relative mt-1 rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 flex items-center">
          <label htmlFor="country" className="sr-only">
            Country
          </label>
          <select
            onChange={(e) => props.setCountry(e.target.value as CountryCode)}
            value={props.country}
            id="country"
            name="country"
            autoComplete="country"
            className="dark:bg-slate-600 h-full rounded-md border-transparent bg-transparent py-0 pl-3 pr-7 text-slate-300 border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            {getCountries().map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Input
          innerRef={ref}
          value={props.phone}
          onChange={(e) => props.setPhone(e.target.value)}
          type="text"
          name="phone-number"
          id="phone-number"
          className="pl-20 border-none"
          placeholder="555-987-6543"
        />
      </div>
    </div>
  );
}
