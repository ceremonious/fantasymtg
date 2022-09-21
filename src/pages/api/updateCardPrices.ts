import { CardPrice } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { parseScryfallCard } from "../../domain/scryfall";
import { prisma } from "../../server/db/client";
import { filterMap } from "../../utils/tsUtil";

export default async function updateCardPrices(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
    res.status(401).json({ status: "Authentication needed" });
    return;
  }

  const url = `https://api.scryfall.com/bulk-data`;
  const resp = await fetch(url);
  const bulkDataURIs = await resp.json();
  const oracleDataURI = bulkDataURIs.data.find(
    (x: any) => x.type === "oracle_cards"
  ).download_uri;

  const resp2 = await fetch(oracleDataURI);
  const cardList = await resp2.json();

  const allCardIDsArr = await prisma.card.findMany({ select: { id: true } });
  const allCardIDs = new Set(allCardIDsArr.map((x) => x.id));

  const now = new Date();
  const pricesToInsert = filterMap(cardList, (card: any) => {
    if (allCardIDs.has(card.id)) {
      const parsedCard = parseScryfallCard(card);
      const cardPrice: CardPrice = {
        cardID: parsedCard.id,
        timestamp: now,
        amountNormal: parsedCard.priceNormal,
        amountFoil: parsedCard.priceFoil,
      };
      return cardPrice;
    }
  });

  await prisma.cardPrice.createMany({ data: pricesToInsert });

  res.status(200).json({ status: "SUCCESS" });
}
