import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { trpc } from "../utils/trpc";
import { focusRef, formatPrice } from "../utils/tsUtil";
import Spinner from "./design/Spinner";
import Button from "./design/Button";
import CardImage from "./design/CardImage";
import XIcon from "./design/XIcon";
import { EnrichedPortfolio } from "../domain/miscTypes";

interface Props {
  leagueMemberID: string;
  portfolio: EnrichedPortfolio;
  isOpen: boolean;
  onClose: () => void;
  openSellCardsModal: () => void;
}

export default function BuyCardsPanel(props: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currSearchState, setCurrSearchState] = useState<{
    searchTerm: string;
    page: number;
  } | null>(null);
  const { data: searchResp, isFetching } = trpc.useQuery(
    ["stocks.searchCards", currSearchState ?? { searchTerm: "", page: 1 }],
    { enabled: currSearchState !== null, refetchOnWindowFocus: false }
  );
  const [buyingCard, setBuyingCard] = useState<{
    cardID: string;
    type: "NORMAL" | "FOIL";
    quantity: number;
  } | null>(null);
  const trpcUtil = trpc.useContext();
  const buyCard = trpc.useMutation(["stocks.buyCard"], {
    onSuccess: () => trpcUtil.invalidateQueries("stocks.leagueHome"),
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.isOpen) {
      focusRef(inputRef);
    }
  }, [props.isOpen]);

  const onSearch = (searchTerm: string) => {
    if (searchTerm) {
      setCurrSearchState({ searchTerm, page: 1 });
    }
  };

  const onLoadNextPage = () => {
    if (!isFetching && searchResp !== undefined && searchResp.hasMore) {
      setCurrSearchState((prev) => {
        if (prev !== null) {
          return { ...prev, page: prev.page + 1 };
        } else {
          return prev;
        }
      });
    }
  };

  return (
    <Transition.Root show={props.isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => props.onClose()}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    <div className="bg-indigo-700 py-6 px-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-medium text-white">
                          Buy Cards
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

                      <div className="mt-4">
                        <div className="w-full">
                          <label htmlFor="search" className="sr-only">
                            Search projects
                          </label>
                          <div className="relative text-indigo-200 focus-within:text-gray-400">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              {isFetching ? (
                                <Spinner />
                              ) : (
                                <MagnifyingGlassIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                            <input
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              ref={inputRef}
                              id="search"
                              name="search"
                              className="block w-full rounded-md border border-transparent bg-indigo-400 bg-opacity-25 py-2 pl-10 pr-3 leading-5 text-indigo-100 placeholder-indigo-200 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                              placeholder="Search cards"
                              type="search"
                              onKeyDown={(target: any) => {
                                if (target.key === "Enter") {
                                  onSearch(searchTerm);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="relative flex-1 py-6 px-4 sm:px-6  overflow-y-scroll ">
                      <div className="mt-6 flow-root">
                        {searchResp !== undefined &&
                          searchResp.cards.length > 0 && (
                            <ul
                              role="list"
                              className="-my-5 divide-y divide-gray-200"
                            >
                              {searchResp.cards.map((card) => {
                                let buyingPriceInfo:
                                  | {
                                      price: number;
                                      jwt: string;
                                    }
                                  | undefined;
                                if (buyingCard !== null) {
                                  if (
                                    buyingCard.type === "NORMAL" &&
                                    card.usd !== null
                                  ) {
                                    buyingPriceInfo = card.usd;
                                  } else if (
                                    buyingCard.type === "FOIL" &&
                                    card.usdFoil !== null
                                  ) {
                                    buyingPriceInfo = card.usdFoil;
                                  }
                                }
                                const buyingPrice = buyingPriceInfo?.price ?? 0;
                                const numNormalOwned =
                                  props.portfolio.cards.find(
                                    (x) =>
                                      x.card.id === card.id &&
                                      x.card.type === "NORMAL"
                                  )?.quantity ?? 0;
                                const numFoilOwned =
                                  props.portfolio.cards.find(
                                    (x) =>
                                      x.card.id === card.id &&
                                      x.card.type === "FOIL"
                                  )?.quantity ?? 0;
                                const totalPrice =
                                  buyingCard === null ||
                                  isNaN(buyingCard.quantity)
                                    ? 0
                                    : buyingPrice * buyingCard.quantity;
                                const isInvalidTotal =
                                  totalPrice === 0 ||
                                  totalPrice > props.portfolio.cash;

                                return (
                                  <li key={card.id} className="py-5">
                                    <div className="md:flex md:space-x-6">
                                      <CardImage
                                        imageURI={card.imageURI}
                                        cardName={card.name}
                                      />
                                      <div className="flex flex-col">
                                        <h3 className="font-bold text-gray-800">
                                          <a
                                            target="_blank"
                                            href={card.scryfallURI}
                                            className="hover:underline focus:outline-none"
                                            rel="noreferrer"
                                          >
                                            {card.name}
                                          </a>
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                          {card.setName}
                                        </p>

                                        <div className="flex flex-row mt-4 space-x-4 flex-1">
                                          {card.usd !== null && (
                                            <div className="flex flex-col min-w-[105px]">
                                              <p className="font-semibold text-gray-800">
                                                Normal
                                              </p>
                                              <p className="text-gray-600">
                                                {formatPrice(card.usd.price)}
                                              </p>
                                              {numNormalOwned > 0 && (
                                                <p className="text-green-600 text-sm">
                                                  {numNormalOwned} owned
                                                </p>
                                              )}
                                              {buyingCard?.cardID !==
                                                card.id && (
                                                <Button
                                                  className="sm:mt-auto mt-6"
                                                  onClick={() =>
                                                    setBuyingCard({
                                                      cardID: card.id,
                                                      type: "NORMAL",
                                                      quantity: 1,
                                                    })
                                                  }
                                                >
                                                  Buy Normal
                                                </Button>
                                              )}
                                            </div>
                                          )}
                                          {card.usdFoil !== null && (
                                            <div className="flex flex-col">
                                              <p className="font-semibold text-gray-800">
                                                Foil
                                              </p>
                                              <p className="text-gray-600">
                                                {formatPrice(
                                                  card.usdFoil.price
                                                )}
                                              </p>
                                              {numFoilOwned > 0 && (
                                                <p className="text-green-600 text-sm">
                                                  {numFoilOwned} owned
                                                </p>
                                              )}
                                              {buyingCard?.cardID !==
                                                card.id && (
                                                <Button
                                                  onClick={() =>
                                                    setBuyingCard({
                                                      cardID: card.id,
                                                      type: "FOIL",
                                                      quantity: 1,
                                                    })
                                                  }
                                                  className="sm:mt-auto mt-6"
                                                >
                                                  Buy Foil
                                                </Button>
                                              )}
                                            </div>
                                          )}
                                        </div>

                                        {buyingCard !== null &&
                                          buyingCard.cardID === card.id && (
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:mt-auto mt-6 gap-4 sm:gap-8">
                                              <div className="flex flex-row space-x-2 items-center">
                                                <input
                                                  autoFocus
                                                  onChange={(e) => {
                                                    setBuyingCard((prev) => {
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
                                                  value={buyingCard.quantity}
                                                  min={1}
                                                  type="number"
                                                  name="quantity"
                                                  id="quantity"
                                                  className="w-[60px] block rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                                <XIcon />
                                                <span className="text-gray-600">
                                                  {formatPrice(buyingPrice)}
                                                </span>
                                                <span>=</span>
                                                <span
                                                  className={
                                                    isInvalidTotal
                                                      ? "text-red-500"
                                                      : "text-gray-800"
                                                  }
                                                >
                                                  {formatPrice(totalPrice)}
                                                </span>
                                              </div>

                                              {buyCard.isLoading ? (
                                                <div className="flex flex-row items-center space-x-2">
                                                  <Spinner />
                                                  <p className="text-gray-500">
                                                    Buying...
                                                  </p>
                                                </div>
                                              ) : (
                                                <div className="space-x-4 sm:space-x-2">
                                                  <Button
                                                    color="primary"
                                                    onClick={async () => {
                                                      if (
                                                        buyingPriceInfo !==
                                                        undefined
                                                      ) {
                                                        await buyCard.mutateAsync(
                                                          {
                                                            leagueMemberID:
                                                              props.leagueMemberID,
                                                            quantity:
                                                              buyingCard.quantity,
                                                            token:
                                                              buyingPriceInfo.jwt,
                                                          }
                                                        );
                                                        setBuyingCard(null);
                                                      }
                                                    }}
                                                    disabled={isInvalidTotal}
                                                  >
                                                    Buy
                                                  </Button>
                                                  <button
                                                    onClick={() =>
                                                      setBuyingCard(null)
                                                    }
                                                    className="text-sm text-blue-400 hover:underline hover:text-blue-300"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}

                        {searchResp !== undefined &&
                          searchResp.cards.length === 0 && (
                            <div className="text-center">
                              <XCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No Cards Found
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                You can always try again.
                              </p>
                            </div>
                          )}

                        {searchResp === undefined && !isFetching && (
                          <div className="text-center">
                            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3
                              className="mt-2 text-sm font-medium text-gray-900"
                              onClick={() => props.openSellCardsModal()}
                            >
                              Place your Bets
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Search for cards to add to your portfolio.
                            </p>
                          </div>
                        )}
                      </div>
                      {searchResp?.hasMore && (
                        <div className="mt-6">
                          <button
                            onClick={() => onLoadNextPage()}
                            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            Next Page
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
