import { z } from "zod";

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

export function zodID<T extends string>() {
  return z.custom<T>((val) => z.string().safeParse(val).success);
}
