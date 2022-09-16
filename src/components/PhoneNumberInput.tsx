import { CountryCode, getCountries } from "libphonenumber-js";

interface Props {
  country: CountryCode;
  setCountry: (val: CountryCode) => void;
  phone: string;
  setPhone: (val: string) => void;
}

export default function PhoneNumberInput(props: Props) {
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
            className="h-full rounded-md border-transparent bg-transparent py-0 pl-3 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {getCountries().map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <input
          value={props.phone}
          onChange={(e) => props.setPhone(e.target.value)}
          type="text"
          name="phone-number"
          id="phone-number"
          className="block w-full rounded-md border-gray-300 pl-20 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="555-987-6543"
        />
      </div>
    </div>
  );
}
