export function assertNever(_: never): never {
  throw new Error("Unreachable code");
}

export function setToNoon(date: Date) {
  const newDate = new Date(date);
  newDate.setHours(12);
  newDate.setMinutes(0);
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);
  return newDate;
}

export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const ret = {} as Pick<T, K>;
  keys.forEach((key) => {
    ret[key] = obj[key];
  });
  return ret;
}

export function filterMap<T, K>(
  arr: T[],
  func: (val: T, index: number) => K | undefined
): K[] {
  const output: K[] = [];
  arr.forEach((obj, index) => {
    const val = func(obj, index);
    if (val !== undefined) {
      output.push(val);
    }
  });
  return output;
}

export function prettyPrint(obj: unknown) {
  console.log(JSON.stringify(obj, null, 2));
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "usd",
  }).format(amount / 100);
}

export function mapArrayOn<T, K extends keyof T>(objects: T[], key: K) {
  return objects.reduce<Record<string | number, T>>((map, obj) => {
    const objKey = obj[key];
    if (objKey !== null && objKey !== undefined) {
      if (typeof objKey !== "string" && typeof objKey !== "number") {
        throw Error("Must index on string or number");
      }
      map[objKey] = obj;
    }
    return map;
  }, {});
}

export function getMax<T>(
  arr: T[],
  compare: (a: T, b: T) => number
): T | undefined {
  let max: T | undefined;
  arr.forEach((x) => {
    if (max === undefined) {
      max = x;
    } else if (compare(x, max) >= 0) {
      max = x;
    }
  });
  return max;
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function getPercentChange(oldVal: number, newVal: number) {
  return Math.round(((newVal - oldVal) / oldVal) * 100);
}

export function pluralize(num: number, singular: string, plural: string) {
  return num === 1 ? `${num} ${singular}` : `${num} ${plural}`;
}
