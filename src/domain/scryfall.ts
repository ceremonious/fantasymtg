export function parseScryfallCard(scryfallCard: any) {
  const cardID = scryfallCard.id as string;
  const cardName = scryfallCard.name as string;
  const setName = scryfallCard.set_name as string;
  let imageURIs = scryfallCard.image_uris;
  if (imageURIs === undefined && scryfallCard.card_faces !== undefined) {
    imageURIs = scryfallCard.card_faces[0]?.image_uris;
  }
  const usd = parseFloat(scryfallCard.prices?.usd);
  const usdFoil = parseFloat(scryfallCard.prices?.usd_foil);

  return {
    id: cardID,
    name: cardName,
    setName,
    scryfallURI: scryfallCard.scryfall_uri as string,
    imageURI: imageURIs ? (imageURIs.normal as string) : null,
    priceNormal: isNaN(usd) ? null : Math.round(usd * 100),
    priceFoil: isNaN(usdFoil) ? null : Math.round(usdFoil * 100),
  };
}
