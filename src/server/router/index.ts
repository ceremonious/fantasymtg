import { createRouter } from "./context";
import superjson from "superjson";
import { stocksRouter } from "./stocksRouter";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("stocks.", stocksRouter);

export type AppRouter = typeof appRouter;
