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
