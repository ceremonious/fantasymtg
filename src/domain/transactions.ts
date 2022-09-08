import { CardPrice } from "@prisma/client";
import { assertNever, setToNoon } from "../utils/tsUtil";
import { CardID, LeagueMemberID, Transaction } from "./dbTypes";
import { NetWorthOverTime, Portfolio } from "./miscTypes";
import addDays from "date-fns/addDays";

function updatePortfolio(
  portfolio: Portfolio,
  transaction: Transaction
): Portfolio {
  if (transaction.type === "BUY") {
    const totalVal = transaction.amount * transaction.quantity;
    let didUpdate = false;
    const newCards = portfolio.cards.map((card) => {
      if (card.cardID === transaction.cardID) {
        didUpdate = true;
        return { ...card, quantity: card.quantity + transaction.quantity };
      } else {
        return card;
      }
    });
    if (!didUpdate) {
      newCards.push({
        cardID: transaction.cardID,
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
        if (card.cardID === transaction.cardID) {
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
  allTransactions: Transaction[]
): Map<LeagueMemberID, Portfolio> {
  const portfolios = new Map<LeagueMemberID, Portfolio>();

  for (const transaction of allTransactions) {
    const memberID = transaction.leagueMemberID;
    const currPortfolio = portfolios.get(memberID) ?? {
      cash: startingAmount,
      cards: [],
    };
    const newPortfolio = updatePortfolio(currPortfolio, transaction);
    portfolios.set(memberID, newPortfolio);
  }

  return portfolios;
}

function calculatePortfolio(
  startingAmount: number,
  transactions: Transaction[]
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
  cardID: CardID,
  validPrices: CardPrice[],
  transactions: Transaction[]
) {
  for (let i = validPrices.length - 1; i >= 0; i--) {
    const cardPrice = validPrices[i];
    if (cardPrice !== undefined && cardPrice.id === cardID) {
      return cardPrice.amount;
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
  arr: (readonly [`lm_${string}`, number])[]
): Record<LeagueMemberID, number> {
  const netWorthMap: Record<LeagueMemberID, number> = {};
  for (const val of arr) {
    netWorthMap[val[0]] = val[1];
  }
  return netWorthMap;
}

export function calculateNetWorthOverTime(params: {
  startDate: Date;
  startingAmount: number;
  leaugeMemberIDs: LeagueMemberID[];
  allTransactions: Transaction[];
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
        const price = getCardPrice(card.cardID, validPrices, transactions);
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
