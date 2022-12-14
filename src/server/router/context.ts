import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { prisma } from "../db/client";
import jwt from "jsonwebtoken";

type CreateContextOptions = {
  authCookie: string | undefined;
};

/** Use this helper for:
 * - testing, where we dont have to Mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 **/
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    prisma,
    ...opts,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (
  opts: trpcNext.CreateNextContextOptions
) => {
  return await createContextInner({
    authCookie: opts.req.cookies.auth,
  });
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();

/**
 * Creates a tRPC router that asserts all queries and mutations are from an authorized user. Will throw an unauthorized error if a user is not signed in.
 **/
export function createProtectedRouter() {
  return createRouter().middleware(({ ctx, next }) => {
    if (ctx.authCookie === undefined) {
      throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
    }

    let accountID: string;
    const JWT_SECRET = process.env.JWT_SECRET ?? "";
    try {
      const data = jwt.verify(ctx.authCookie, JWT_SECRET);
      if (typeof data === "string") {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }
      accountID = data.accountID;
    } catch (e) {
      throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        ...ctx,
        accountID,
      },
    });
  });
}

export function getAccountIDIfAuthed(cookie: string | undefined) {
  if (cookie == undefined) {
    return null;
  }
  const JWT_SECRET = process.env.JWT_SECRET ?? "";
  try {
    const data = jwt.verify(cookie, JWT_SECRET);
    if (typeof data === "string") {
      return null;
    }
    return data.accountID;
  } catch (e) {
    return null;
  }
}
