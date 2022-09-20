import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import CardImage from "./design/CardImage";
import { formatPrice, pluralize } from "../utils/tsUtil";
import Button from "./design/Button";
import XIcon from "./design/XIcon";
import { trpc } from "../utils/trpc";
import Spinner from "./design/Spinner";

interface Props {
  cards: {
    id: string;
    name: string;
    setName: string;
    scryfallURI: string;
    imageURI: string | null;
    type: "NORMAL" | "FOIL";
    price: number;
    quantity: number;
  }[];
  leagueMemberID: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SellCardsModal(props: Props) {
  const [sellingCard, setSellingCard] = useState<{
    cardID: string;
    type: "NORMAL" | "FOIL";
    quantity: number;
  } | null>(null);
  const { data: upToDatePrice, isFetching } = trpc.useQuery(
    [
      "stocks.getCard",
      sellingCard
        ? { cardID: sellingCard.cardID, cardType: sellingCard.type }
        : { cardID: "", cardType: "NORMAL" },
    ],
    { enabled: sellingCard !== null, refetchOnWindowFocus: false }
  );
  const trpcUtil = trpc.useContext();
  const sellCard = trpc.useMutation("stocks.sellCard", {
    onSuccess: () => trpcUtil.invalidateQueries("stocks.leagueHome"),
  });

  useEffect(() => {
    if (props.isOpen) {
      setSellingCard(null);
    }
  }, [props.isOpen]);

  return (
    <Transition.Root show={props.isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => props.onClose()}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="bg-indigo-700 py-6 px-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-lg font-medium text-white">
                      Sell Cards
                    </Dialog.Title>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        className="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={() => props.onClose()}
                      >
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-indigo-300">
                      Our search & pricing is powered by Scryfall.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mt-6 px-4 sm:px-6">
                    {props.cards.length > 0 && (
                      <ul
                        role="list"
                        className="-my-5 divide-y divide-gray-200"
                      >
                        {props.cards.map((card) => {
                          const isSelling =
                            sellingCard?.cardID === card.id &&
                            sellingCard.type === card.type;
                          const price =
                            isSelling &&
                            upToDatePrice !== undefined &&
                            !isFetching
                              ? upToDatePrice.price
                              : card.price;
                          const isInvalidQuantity =
                            sellingCard !== null &&
                            sellingCard.quantity > card.quantity;

                          return (
                            <li key={card.id} className="py-5">
                              <div className="md:flex md:space-x-6">
                                <CardImage
                                  imageURI={card.imageURI}
                                  cardName={card.name}
                                />
                                <div className="flex flex-col =">
                                  <h3 className="font-bold text-gray-800">
                                    <a
                                      target="_blank"
                                      href={card.scryfallURI}
                                      className="hover:underline focus:outline-none"
                                      rel="noreferrer"
                                    >
                                      {card.name}
                                      {card.type === "FOIL" ? " (Foil)" : ""}
                                    </a>
                                  </h3>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {card.setName}
                                  </p>

                                  <div className="flex flex-col flex-1">
                                    <p className="font-semibold text-gray-800 mt-4">
                                      Total
                                    </p>

                                    <span className="text-gray-600">
                                      {formatPrice(price * card.quantity)}
                                      <span className="text-gray-400 ml-1">
                                        (
                                        {pluralize(
                                          card.quantity,
                                          "copy",
                                          "copies"
                                        )}
                                        )
                                      </span>
                                    </span>

                                    <div className="mt-6 sm:mt-auto">
                                      {!isSelling ? (
                                        <Button
                                          className="w-fit"
                                          onClick={() =>
                                            setSellingCard({
                                              cardID: card.id,
                                              type: card.type,
                                              quantity: card.quantity,
                                            })
                                          }
                                        >
                                          Sell
                                        </Button>
                                      ) : (
                                        <>
                                          {isFetching ? (
                                            <div className="flex flex-row items-center space-x-2">
                                              <Spinner />
                                              <p className="text-gray-500">
                                                Getting updated price...
                                              </p>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:mt-auto mt-6 gap-4 sm:gap-8">
                                              <div className="flex flex-row space-x-2 items-center">
                                                <input
                                                  autoFocus
                                                  onChange={(e) => {
                                                    setSellingCard((prev) => {
                                                      if (prev !== null) {
                                                        return {
                                                          ...prev,
                                                          quantity: parseInt(
                                                            e.target.value,
                                                            10
                                                          ),
                                                        };
                                                      } else {
                                                        return prev;
                                                      }
                                                    });
                                                  }}
                                                  value={sellingCard.quantity}
                                                  min={1}
                                                  max={card.quantity}
                                                  type="number"
                                                  name="quantity"
                                                  id="quantity"
                                                  className="w-[60px] block rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                                <XIcon />
                                                <span className="text-gray-600">
                                                  {formatPrice(price)}
                                                </span>
                                                <span>=</span>
                                                <span
                                                  className={
                                                    isInvalidQuantity
                                                      ? "text-red-500"
                                                      : "text-gray-800"
                                                  }
                                                >
                                                  {formatPrice(
                                                    isNaN(sellingCard.quantity)
                                                      ? 0
                                                      : price *
                                                          sellingCard.quantity
                                                  )}
                                                </span>
                                              </div>

                                              {sellCard.isLoading ? (
                                                <div className="flex flex-row items-center space-x-2">
                                                  <Spinner />
                                                  <p className="text-gray-500">
                                                    Selling...
                                                  </p>
                                                </div>
                                              ) : (
                                                <div className="space-x-4 sm:space-x-2">
                                                  <Button
                                                    color="primary"
                                                    onClick={async () => {
                                                      if (
                                                        upToDatePrice !==
                                                        undefined
                                                      ) {
                                                        await sellCard.mutateAsync(
                                                          {
                                                            leagueMemberID:
                                                              props.leagueMemberID,
                                                            quantity:
                                                              sellingCard.quantity,
                                                            token:
                                                              upToDatePrice.jwt,
                                                          }
                                                        );
                                                        setSellingCard(null);
                                                      }
                                                    }}
                                                    disabled={
                                                      isNaN(
                                                        sellingCard.quantity
                                                      ) || isInvalidQuantity
                                                    }
                                                  >
                                                    Sell
                                                  </Button>
                                                  <button
                                                    onClick={() =>
                                                      setSellingCard(null)
                                                    }
                                                    className="text-sm text-blue-400 hover:underline hover:text-blue-300"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {props.cards.length === 0 && (
                      <div className="text-center">
                        <XCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No Cards to Sell
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Maybe try buying some cards first.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
