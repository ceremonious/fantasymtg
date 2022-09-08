import { createRouter } from "./context";
import { z } from "zod";
import { zodID } from "../../utils/tsUtil";
import {
  CardID,
  LeagueID,
  LeagueMemberID,
  Transaction,
} from "../../domain/dbTypes";

/*
TODO -- Endpoints needed:
- Get league
- Get current card price (user when selling)
- Search cards (used when buying)
- Buy cards
- Sell cards
*/

export const stocksRouter = createRouter()
  .query("leagueHome", {
    input: z
      .object({
        text: z.string().nullish(),
      })
      .nullish(),
    resolve({ input }) {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    },
  })
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.example.findMany();
    },
  })
  .mutation("buyCard", {
    input: z.object({
      leagueMemberID: zodID<LeagueMemberID>(),
      quantity: z.number().positive(),
    }),
    async resolve({ input, ctx }) {
      /*
      TODO -- Validate the following:
      - User is authorized for this league member
      - User has the funds to buy this card
      - User has not made too many recent transactions 
      */

      return {
        status: "SUCCESS",
      };
    },
  })
  .mutation("sellCard", {
    input: z.object({
      leagueMemberID: zodID<LeagueMemberID>(),
      description: z.string(),
      quantity: z.number().positive(),
    }),
    async resolve({ input, ctx }) {
      /*
      TODO -- Validate the following:
      - League Member exists
      - User is authorized for this league member
      - User has this many cards to sell
      - User has not made too many recent transactions 
      */
      const leagueMember = await ctx.prisma.leagueMember.findFirst({
        where: { id: input.leagueMemberID },
      });
      if (leagueMember === null) {
        //TODO: look into error handling
        throw new Error("Could not find league member");
      }

      //TODO: get amount & card from JWT
      const cardID = "crd_123";
      const amount = 10;

      const transaction: Transaction = {
        //TODO: better inference
        leagueID: leagueMember.leagueID as LeagueID,
        description: input.description,
        amount: amount,
        quantity: input.quantity,
        cardID,
        type: "SELL",
        createdAt: new Date(),
        leagueMemberID: input.leagueMemberID,
      };
      await ctx.prisma.transaction.create({ data: transaction });

      //TODO if the card does not exist in the database, we need to create it

      return {
        status: "SUCCESS",
      };
    },
  });
