// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { stocksRouter } from "./stocksRouter";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("stocks.", stocksRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
