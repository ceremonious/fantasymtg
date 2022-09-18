export default function CardImage({
  cardName,
  imageURI,
}: {
  cardName: string;
  imageURI: string | null;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      style={{
        height: 192,
        width: 142,
        borderRadius: "4.75% / 3.5%",
      }}
      src={imageURI ?? ""}
      alt={cardName}
    />
  );
}
