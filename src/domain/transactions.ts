import { Card, CardPrice } from "@prisma/client";
import { assertNever, pick, setToNoon } from "../utils/tsUtil";
import { ITransaction } from "./dbTypes";
import { EnrichedPortfolio, NetWorthOverTime, Portfolio } from "./miscTypes";
import addDays from "date-fns/addDays";

function updatePortfolio(
  portfolio: Portfolio,
  transaction: ITransaction
): Portfolio {
  if (transaction.type === "BUY") {
    const totalVal = transaction.amount * transaction.quantity;
    let didUpdate = false;
    const newCards = portfolio.cards.map((card) => {
      if (
        card.card.id === transaction.cardID &&
        card.card.type === transaction.cardType
      ) {
        didUpdate = true;
        return { ...card, quantity: card.quantity + transaction.quantity };
      } else {
        return card;
      }
    });
    if (!didUpdate) {
      newCards.push({
        card: { id: transaction.cardID, type: transaction.cardType },
        quantity: transaction.quantity,
      });
    }

    return {
      cash: portfolio.cash - totalVal,
      cards: newCards,
    };
  } else if (transaction.type === "SELL") {
    const totalVal = transaction.amount * transaction.quantity;
    const newCards = portfolio.cards
      .map((card) => {
        if (
          card.card.id === transaction.cardID &&
          card.card.type === transaction.cardType
        ) {
          //TODO: potentially warn if this value becomes negative
          return { ...card, quantity: card.quantity - transaction.quantity };
        } else {
          return card;
        }
      })
      .filter((card) => card.quantity > 0);

    return {
      cash: portfolio.cash + totalVal,
      cards: newCards,
    };
  } else if (transaction.type === "CASH") {
    return {
      cash: portfolio.cash + transaction.amount,
      cards: portfolio.cards,
    };
  } else {
    assertNever(transaction.type);
  }
}

export function calculateLeaguePortfolios(
  startingAmount: number,
  leagueMemberIDs: string[],
  allTransactions: ITransaction[]
): Map<string, Portfolio> {
  const portfolios = new Map<string, Portfolio>();

  for (const transaction of allTransactions) {
    const memberID = transaction.leagueMemberID;
    const currPortfolio = portfolios.get(memberID) ?? {
      cash: startingAmount,
      cards: [],
    };
    const newPortfolio = updatePortfolio(currPortfolio, transaction);
    portfolios.set(memberID, newPortfolio);
  }
  for (const leagueMemberID of leagueMemberIDs) {
    const existingVal = portfolios.get(leagueMemberID);
    if (existingVal === undefined) {
      portfolios.set(leagueMemberID, { cash: startingAmount, cards: [] });
    }
  }

  return portfolios;
}

export function calculatePortfolio(
  startingAmount: number,
  transactions: ITransaction[]
): Portfolio {
  let currPortfolio: Portfolio = {
    cash: startingAmount,
    cards: [],
  };
  for (const transaction of transactions) {
    currPortfolio = updatePortfolio(currPortfolio, transaction);
  }
  return currPortfolio;
}

function getCardPrice(
  card: { id: string; type: "NORMAL" | "FOIL" },
  validPrices: CardPrice[],
  transactions: ITransaction[]
) {
  for (let i = validPrices.length - 1; i >= 0; i--) {
    const cardPrice = validPrices[i];
    if (cardPrice !== undefined && cardPrice.cardID === card.id) {
      if (card.type === "NORMAL") {
        if (cardPrice.amountNormal !== null) {
          return cardPrice.amountNormal;
        }
      } else if (card.type === "FOIL") {
        if (cardPrice.amountFoil !== null) {
          return cardPrice.amountFoil;
        }
      } else {
        assertNever(card.type);
      }
    }
  }
  for (let i = transactions.length - 1; i >= 0; i--) {
    const transaction = transactions[i];
    if (
      transaction !== undefined &&
      (transaction.type === "BUY" || transaction.type === "SELL")
    ) {
      return transaction.amount;
    }
  }
  return 0;
}

function netWorthArrToMap(
  arr: (readonly [string, number])[]
): Record<string, number> {
  const netWorthMap: Record<string, number> = {};
  for (const val of arr) {
    netWorthMap[val[0]] = val[1];
  }
  return netWorthMap;
}

export function calculateNetWorthOverTime(params: {
  startDate: Date;
  startingAmount: number;
  leaugeMemberIDs: string[];
  allTransactions: ITransaction[];
  cardsPrices: CardPrice[];
}): NetWorthOverTime {
  const {
    startDate,
    allTransactions,
    cardsPrices,
    startingAmount,
    leaugeMemberIDs,
  } = params;

  const start = setToNoon(startDate);
  const netWorthOverTime: NetWorthOverTime = [
    {
      timestamp: start,
      netWorths: netWorthArrToMap(
        leaugeMemberIDs.map((mid) => [mid, startingAmount])
      ),
    },
  ];

  let currDate = addDays(start, 1);
  const now = new Date();
  while (currDate < now) {
    //TODO: this may need to be optimized if it's slow
    const validPrices = cardsPrices.filter((p) => p.timestamp <= currDate);
    const netWorthArr = leaugeMemberIDs.map((mid) => {
      const transactions = allTransactions.filter(
        (t) => t.leagueMemberID === mid && t.createdAt <= currDate
      );
      const portfolio = calculatePortfolio(startingAmount, transactions);

      let netWorth = portfolio.cash;
      for (const card of portfolio.cards) {
        const price = getCardPrice(card.card, validPrices, transactions);
        netWorth += card.quantity * price;
      }
      return [mid, netWorth] as const;
    });

    netWorthOverTime.push({
      timestamp: currDate,
      netWorths: netWorthArrToMap(netWorthArr),
    });

    currDate = addDays(currDate, 1);
  }

  return netWorthOverTime;
}

export function getCardIDsFromPortfolios(
  leaguePortfolios: Map<string, Portfolio>
) {
  return Array.from(leaguePortfolios.values())
    .map((portfolio) => {
      return portfolio.cards.map((c) => c.card.id);
    })
    .flat();
}

export function getCardsWithPrices(
  cards: Card[],
  validPrices: CardPrice[],
  transactions: ITransaction[]
) {
  const priceMap: Map<string, { amountNormal?: number; amountFoil?: number }> =
    new Map();

  for (let i = validPrices.length - 1; i >= 0; i--) {
    const cardPrice = validPrices[i];
    if (cardPrice !== undefined) {
      const currVal = priceMap.get(cardPrice.cardID);
      if (currVal === undefined) {
        priceMap.set(cardPrice.cardID, {
          amountFoil: cardPrice.amountFoil ?? undefined,
          amountNormal: cardPrice.amountNormal ?? undefined,
        });
      }
    }
  }
  for (let i = transactions.length - 1; i >= 0; i--) {
    const transaction = transactions[i];
    if (
      transaction !== undefined &&
      (transaction.type === "BUY" || transaction.type === "SELL")
    ) {
      const currVal = priceMap.get(transaction.cardID);
      if (
        transaction.cardType === "NORMAL" &&
        currVal?.amountNormal === undefined
      ) {
        priceMap.set(transaction.cardID, {
          ...(currVal ?? {}),
          amountNormal: transaction.amount,
        });
      } else if (
        transaction.cardType === "FOIL" &&
        currVal?.amountFoil === undefined
      ) {
        priceMap.set(transaction.cardID, {
          ...(currVal ?? {}),
          amountFoil: transaction.amount,
        });
      }
    }
  }

  return cards.map((card) => {
    const cardPrice = priceMap.get(card.id);
    return {
      ...card,
      amountNormal: cardPrice?.amountNormal,
      amountFoil: cardPrice?.amountFoil,
    };
  });
}

export function enrichPortfolioWithCardData(
  portfolio: Portfolio,
  cardPricesMap: Record<
    string,
    Card & {
      amountNormal?: number;
      amountFoil?: number;
    }
  >
): EnrichedPortfolio {
  const cardsWithPrices = portfolio.cards.map((c) => {
    const cardPrice = cardPricesMap[c.card.id];
    const cardInfo =
      cardPrice !== undefined
        ? pick(cardPrice, "name", "imageURI", "scryfallURI", "setName")
        : null;
    if (c.card.type === "NORMAL") {
      const price = cardPrice?.amountNormal ?? 0;
      return { ...c, card: { ...c.card, price, cardInfo } };
    } else if (c.card.type === "FOIL") {
      const price = cardPrice?.amountFoil ?? 0;
      return { ...c, card: { ...c.card, price, cardInfo } };
    } else {
      assertNever(c.card.type);
    }
  });
  const totalCardVal = cardsWithPrices.reduce(
    (prev, curr) => prev + curr.card.price * curr.quantity,
    0
  );

  return {
    ...portfolio,
    cards: cardsWithPrices,
    netWorth: portfolio.cash + totalCardVal,
  };
}
