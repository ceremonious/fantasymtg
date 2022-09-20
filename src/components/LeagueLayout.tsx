import { Fragment, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import BuyCardsPanel from "./BuyCardsPanel";
import { classNames, filterMap, pick } from "../utils/tsUtil";
import Button from "./design/Button";
import SellCardsModal from "./SellCardsModal";
import { EnrichedPortfolio } from "../domain/miscTypes";
import { League } from "@prisma/client";
import { getBaseUrl } from "../pages/_app";
import { useRouter } from "next/router";

const navigation = [
  { name: "Home", href: "#", current: true },
  { name: "Transaction History", href: "#", current: false },
];

interface Props {
  currMember: {
    id: string;
    displayName: string;
    profilePic: string;
    portfolio: EnrichedPortfolio;
  } | null;
  otherLeagues: Pick<League, "id" | "name">[];
  league: (Pick<League, "name"> & { logo: string }) | null;
  children: JSX.Element;
}

export default function LeagueLayout(props: Props) {
  const router = useRouter();
  const [isBuyPanelOpen, setIsBuyPanelOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  const onSignout = async () => {
    const url = `${getBaseUrl()}/api/signout`;
    const resp = await fetch(url, {
      method: "POST",
    });
    const data = await resp.json();
    if (data.status === "SUCCESS") {
      router.push("/");
    }
  };

  const navItems = [
    ...props.otherLeagues.map((x) => ({
      name: x.name,
      href: `/league/${x.id}`,
    })),
    { name: "Create New League", href: `/league/create` },
    { name: "Sign Out", href: "#signout" },
  ];

  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-indigo-800 dark:bg-slate-700">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-8 w-8"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                        alt="Your Company"
                      />
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-indigo-900 text-white dark:bg-slate-800"
                                : "text-gray-300 hover:bg-indigo-700 dark:hover:bg-slate-700 hover:text-white",
                              "px-3 py-2 rounded-md text-sm font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex max-w-xs items-center rounded-full bg-primary-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:dark:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800">
                            <span className="sr-only">Open user menu</span>
                            {props.currMember !== null && (
                              <img
                                className="h-8 w-8 rounded-full"
                                src={props.currMember.profilePic}
                                alt=""
                              />
                            )}
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {navItems.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) =>
                                  item.href === "#signout" ? (
                                    <button
                                      onClick={() => onSignout()}
                                      className={classNames(
                                        active ? "bg-gray-100" : "",
                                        "text-left w-full block px-4 py-2 text-sm text-gray-700"
                                      )}
                                    >
                                      {item.name}
                                    </button>
                                  ) : (
                                    <a
                                      href={item.href}
                                      className={classNames(
                                        active ? "bg-gray-100" : "",
                                        "block px-4 py-2 text-sm text-gray-700"
                                      )}
                                    >
                                      {item.name}
                                    </a>
                                  )
                                }
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "block px-3 py-2 rounded-md text-base font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4 pb-3">
                  {props.currMember !== null && (
                    <div className="flex items-center px-5">
                      <div className="flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={props.currMember.profilePic}
                          alt="User profile picture"
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-white">
                          {props.currMember.displayName}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 space-y-1 px-2">
                    {navItems.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <header className="bg-white dark:bg-slate-700 dark:border-y-2 dark:border-slate-500 shadow-sm">
          <div className="mx-auto max-w-6xl py-4 px-4 sm:px-6 lg:px-8">
            <div className="py-6 md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1 h-16">
                {props.league !== null && (
                  <div className="flex items-center">
                    <img
                      className="hidden h-16 w-16 rounded-full sm:block dark:border dark:border-gray-500"
                      src={props.league.logo}
                      alt="League logo"
                    />
                    <div>
                      <div className="flex items-center">
                        <img
                          className="h-16 w-16 rounded-full sm:hidden dark:border dark:border-gray-500"
                          src={props.league.logo}
                          alt="League logo"
                        />
                        <h1 className="ml-3 text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:leading-9">
                          {props.league.name}
                        </h1>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
                <Button
                  onClick={() => setIsSellModalOpen(true)}
                  color="white"
                  size="md"
                >
                  Sell Cards
                </Button>
                <Button
                  onClick={() => setIsBuyPanelOpen(true)}
                  color="primary"
                  size="md"
                >
                  Buy Cards
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main>{props.children}</main>
      </div>
      {props.currMember !== null && (
        <BuyCardsPanel
          portfolio={props.currMember.portfolio}
          openSellCardsModal={() => setIsSellModalOpen(true)}
          leagueMemberID={props.currMember.id}
          isOpen={isBuyPanelOpen}
          onClose={() => setIsBuyPanelOpen(false)}
        />
      )}
      {props.currMember !== null && (
        <SellCardsModal
          leagueMemberID={props.currMember.id}
          isOpen={isSellModalOpen}
          onClose={() => setIsSellModalOpen(false)}
          cards={filterMap(props.currMember.portfolio.cards, (card) => {
            if (card.card.cardInfo !== null) {
              return {
                ...card.card.cardInfo,
                ...pick(card.card, "id", "price", "type"),
                quantity: card.quantity,
              };
            }
          })}
        />
      )}
    </>
  );
}
