import { createProtectedRouter } from "./context";
import { z } from "zod";
import { filterMap, pick, prettyPrint } from "../../utils/tsUtil";
import { ITransaction } from "../../domain/dbTypes";
import jwt from "jsonwebtoken";
import { CardPriceJWT } from "../../domain/miscTypes";
import {
  calculateLeaguePortfolios,
  calculateNetWorthOverTime,
  calculatePortfolio,
  getCardIDsFromPortfolios,
  getCardsWithPrices,
} from "../../domain/transactions";
import { Prisma, PrismaClient, Transaction } from "@prisma/client";
import { GetLeagueHomePage } from "../../domain/apiTypes";
import * as trpc from "@trpc/server";
import { getRandomProfileURL } from "../../utils/pfp";

type IPrismaClient = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
>;

function convertTransactions(transactions: Transaction[]) {
  return transactions as ITransaction[];
}

function parseScryfallCard(scryfallCard: any) {
  const cardID = scryfallCard.id as string;
  const cardName = scryfallCard.name as string;
  const setName = scryfallCard.set_name as string;
  let imageURIs = scryfallCard.image_uris;
  if (imageURIs === undefined && scryfallCard.card_faces !== undefined) {
    imageURIs = scryfallCard.card_faces[0]?.image_uris;
  }

  return {
    id: cardID,
    name: cardName,
    setName,
    scryfallURI: scryfallCard.scryfall_uri as string,
    imageURI: imageURIs ? (imageURIs.normal as string) : null,
  };
}

async function authenticateLeagueMember(
  prisma: IPrismaClient,
  accountID: string,
  leagueMemberID: string
) {
  const leagueMember = await prisma.leagueMember.findFirst({
    where: { id: leagueMemberID },
  });
  if (leagueMember === null) {
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "Could not find league member",
    });
  }
  if (leagueMember.accountID !== accountID) {
    throw new trpc.TRPCError({
      code: "FORBIDDEN",
      message: "Unauthorized",
    });
  }

  return leagueMember;
}

async function getLeagueMemberPortfolio(
  prisma: IPrismaClient,
  leagueID: string,
  leagueMemberID: string
) {
  const [league, transactions] = await Promise.all([
    prisma.league.findFirst({ where: { id: leagueID } }),
    prisma.transaction.findMany({
      where: { leagueMemberID },
    }),
  ]);
  if (league === null) {
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "Could not find league",
    });
  }
  return calculatePortfolio(
    league.startingAmount,
    convertTransactions(transactions)
  );
}

function signJWT(data: CardPriceJWT) {
  const JWT_SECRET = process.env.JWT_SECRET ?? "";
  return jwt.sign(data, JWT_SECRET, {
    expiresIn: 60 * 5,
  });
}

export function verifyCardJWT(token: string): CardPriceJWT {
  try {
    const JWT_SECRET = process.env.JWT_SECRET ?? "";
    const data = jwt.verify(token, JWT_SECRET);

    if (typeof data !== "string") {
      return data as CardPriceJWT;
    } else {
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        message: "Unable to verify card price",
      });
    }
  } catch (error) {
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "Unable to verify card price",
    });
  }
}

export const stocksRouter = createProtectedRouter()
  .mutation("createLeague", {
    input: z.object({
      leagueName: z.string(),
      displayName: z.string(),
      startDate: z.date(),
      startingAmount: z.number().int().positive(),
    }),
    async resolve({ input, ctx }) {
      const league = await ctx.prisma.league.create({
        data: {
          name: input.leagueName,
          startingAmount: input.startingAmount * 100,
          startDate: input.startDate,
          leagueMember: {
            create: [
              {
                accountID: ctx.accountID,
                displayName: input.displayName,
                isOwner: true,
              },
            ],
          },
        },
      });

      return {
        leagueID: league.id,
      };
    },
  })
  .mutation("joinLeague", {
    input: z.object({
      leagueID: z.string(),
      displayName: z.string(),
    }),
    async resolve({ input, ctx }) {
      const existingMember = await ctx.prisma.leagueMember.findFirst({
        where: { leagueID: input.leagueID, accountID: ctx.accountID },
      });
      if (existingMember !== null) {
        return {
          status: "SUCCESS",
        };
      }

      await ctx.prisma.leagueMember.create({
        data: {
          displayName: input.displayName,
          accountID: ctx.accountID,
          isOwner: false,
          leagueID: input.leagueID,
        },
      });

      return {
        status: "SUCCESS",
      };
    },
  })
  .query("leagueHome", {
    input: z.object({
      leagueID: z.string(),
    }),
    async resolve({ input, ctx }): Promise<GetLeagueHomePage> {
      const [league, leagueMembers, transactions, otherLeagues] =
        await Promise.all([
          ctx.prisma.league.findFirst({ where: { id: input.leagueID } }),
          ctx.prisma.leagueMember.findMany({
            where: { leagueID: input.leagueID },
          }),
          ctx.prisma.transaction.findMany({
            where: { leagueID: input.leagueID },
          }),
          ctx.prisma.leagueMember.findMany({
            where: { accountID: ctx.accountID },
            select: { leauge: { select: { id: true, name: true } } },
          }),
        ]);
      if (league === null) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Could not find league",
        });
      }

      const portfolios = calculateLeaguePortfolios(
        league.startingAmount,
        leagueMembers.map((x) => x.id),
        convertTransactions(transactions)
      );
      const cardIDs = getCardIDsFromPortfolios(portfolios);
      const [cards, cardsPrices] = await Promise.all([
        ctx.prisma.card.findMany({ where: { id: { in: cardIDs } } }),
        ctx.prisma.cardPrice.findMany({
          where: { cardID: { in: cardIDs } },
          orderBy: { timestamp: "asc" },
        }),
      ]);

      const netWorthOverTime = calculateNetWorthOverTime({
        startDate: league.startDate,
        allTransactions: convertTransactions(transactions),
        startingAmount: league.startingAmount,
        leaugeMemberIDs: leagueMembers.map((x) => x.id),
        cardsPrices,
      });
      const cardsWithPrices = getCardsWithPrices(
        cards,
        cardsPrices,
        convertTransactions(transactions)
      );

      return {
        league: { name: league.name, logo: getRandomProfileURL(league.id) },
        members: leagueMembers.map((x) => ({
          ...pick(x, "id", "displayName", "isOwner"),
          isSelf: x.accountID === ctx.accountID,
          profilePic: getRandomProfileURL(x.id),
        })),
        portfolios,
        netWorthOverTime,
        cards: cardsWithPrices,
        otherLeagues: otherLeagues
          .map((x) => x.leauge)
          .filter((x) => x.id !== input.leagueID),
      };
    },
  })
  .query("getCard", {
    input: z.object({
      cardID: z.string(),
      cardType: z.literal("NORMAL").or(z.literal("FOIL")),
    }),
    async resolve({ input }) {
      const url = `https://api.scryfall.com/cards/${input.cardID}`;
      const resp = await fetch(url);
      const card = await resp.json();

      const rawPrice =
        input.cardType === "NORMAL" ? card.prices.usd : card.prices.usd_foil;
      const parsedPrice = parseFloat(rawPrice);
      if (isNaN(parsedPrice)) {
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not get card price",
        });
      }
      const price = parsedPrice * 100;
      const parsedScryfallCard = parseScryfallCard(card);

      const jwt = signJWT({
        ...parsedScryfallCard,
        cardType: input.cardType,
        price,
      });

      return {
        price,
        jwt,
      };
    },
  })
  .query("searchCards", {
    input: z.object({
      searchTerm: z.string(),
      page: z.number(),
    }),
    async resolve({ input }) {
      const url = `https://api.scryfall.com/cards/search?q=${input.searchTerm}&page=${input.page}&unique=prints`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.code === "not_found") {
        return { cards: [], hasMore: false };
      }

      const cards = filterMap(data.data, (card: any) => {
        const usd = parseFloat(card.prices?.usd);
        const usdFoil = parseFloat(card.prices?.usd_foil);
        const hasPrice = !isNaN(usd) || !isNaN(usdFoil);

        if (!card.digital && hasPrice) {
          const parsedScryfallCard = parseScryfallCard(card);

          const usdJWT = !isNaN(usd)
            ? {
                ...parsedScryfallCard,
                cardType: "NORMAL" as const,
                price: usd * 100,
              }
            : null;
          const usdFoilJWT = !isNaN(usdFoil)
            ? {
                ...parsedScryfallCard,
                cardType: "FOIL" as const,
                price: usdFoil * 100,
              }
            : null;

          return {
            ...parsedScryfallCard,
            usd:
              usdJWT !== null
                ? { price: usdJWT.price, jwt: signJWT(usdJWT) }
                : null,
            usdFoil:
              usdFoilJWT !== null
                ? { price: usdFoilJWT.price, jwt: signJWT(usdFoilJWT) }
                : null,
          };
        }
      });

      return { cards, hasMore: data.has_more };
    },
  })
  .mutation("buyCard", {
    input: z.object({
      leagueMemberID: z.string(),
      token: z.string(),
      quantity: z.number().positive(),
    }),
    async resolve({ input, ctx }) {
      /*
      TODO -- Validate the following:
      - User has not made too many recent transactions 
      */
      const leagueMember = await authenticateLeagueMember(
        ctx.prisma,
        ctx.accountID,
        input.leagueMemberID
      );

      const { id, name, cardType, price, scryfallURI, setName, imageURI } =
        verifyCardJWT(input.token);
      const totalAmount = price * input.quantity;

      const portfolio = await getLeagueMemberPortfolio(
        ctx.prisma,
        leagueMember.leagueID,
        leagueMember.id
      );
      if (portfolio.cash < totalAmount) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient funds",
        });
      }

      const transaction: ITransaction = {
        leagueID: leagueMember.leagueID,
        description: "",
        amount: price,
        quantity: input.quantity,
        cardID: id,
        cardType: cardType,
        type: "BUY",
        createdAt: new Date(),
        leagueMemberID: input.leagueMemberID,
      };
      await ctx.prisma.card.upsert({
        create: { id, name, scryfallURI, setName, imageURI },
        update: { name, scryfallURI, setName, imageURI },
        where: { id },
      });
      await ctx.prisma.transaction.create({ data: transaction });

      return {
        status: "SUCCESS",
      };
    },
  })
  .mutation("sellCard", {
    input: z.object({
      leagueMemberID: z.string(),
      token: z.string(),
      quantity: z.number().positive(),
    }),
    async resolve({ input, ctx }) {
      /*
      TODO -- Validate the following:
      - User has not made too many recent transactions 
      */

      const leagueMember = await authenticateLeagueMember(
        ctx.prisma,
        ctx.accountID,
        input.leagueMemberID
      );

      const { id, name, cardType, price, scryfallURI, setName, imageURI } =
        verifyCardJWT(input.token);

      const portfolio = await getLeagueMemberPortfolio(
        ctx.prisma,
        leagueMember.leagueID,
        leagueMember.id
      );
      const matchingCard = portfolio.cards.find(
        (card) => card.card.id === id && card.card.type === cardType
      );
      if (
        matchingCard === undefined ||
        matchingCard.quantity < input.quantity
      ) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Could not find cards in portfolio",
        });
      }

      const transaction: ITransaction = {
        leagueID: leagueMember.leagueID,
        description: "",
        amount: price,
        quantity: input.quantity,
        cardID: id,
        cardType: cardType,
        type: "SELL",
        createdAt: new Date(),
        leagueMemberID: input.leagueMemberID,
      };
      await ctx.prisma.card.upsert({
        create: { id, name, scryfallURI, setName, imageURI },
        update: { name, scryfallURI, setName, imageURI },
        where: { id },
      });
      await ctx.prisma.transaction.create({ data: transaction });

      return {
        status: "SUCCESS",
      };
    },
  });
