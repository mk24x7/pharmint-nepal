"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import SearchBar from "../search-bar"
import { HttpTypes } from "@medusajs/types"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Account: "/account",
  Cart: "/cart",
}

const SideMenu = ({ regions }: { regions: HttpTypes.StoreRegion[] | null }) => {
  const toggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-accent text-white"
                >
                  Menu
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-30 inset-x-0 text-sm text-white m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-black/90 border border-pharmint-border rounded-rounded justify-between p-6"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button data-testid="close-menu-button" onClick={close} className="text-pharmint-muted hover:text-accent transition-colors">
                        <XMark />
                      </button>
                    </div>
                    
                    {/* Mobile Search */}
                    <div className="mb-6">
                      <SearchBar />
                    </div>
                    <ul className="flex flex-col gap-6 items-start justify-start">
                      {Object.entries(SideMenuItems).map(([name, href]) => {
                        return (
                          <li key={name}>
                            <LocalizedClientLink
                              href={href}
                              className="text-3xl leading-10 hover:text-accent transition-colors text-white"
                              onClick={close}
                              data-testid={`${name.toLowerCase()}-link`}
                            >
                              {name}
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex flex-col gap-y-6">
                      <div className="flex flex-col gap-y-3">
                        <div className="flex justify-center">
                          <Text className="txt-compact-small text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                            Coming Soon - More Countries & Regions
                          </Text>
                        </div>
                        <div
                          className="flex justify-between"
                          onMouseEnter={toggleState.open}
                          onMouseLeave={toggleState.close}
                        >
                          {regions && (
                            <CountrySelect
                              toggleState={toggleState}
                              regions={regions}
                            />
                          )}
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              toggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      </div>
                      <Text className="flex justify-between txt-compact-small">
                        © {new Date().getFullYear()} Pharmint.PH. All rights
                        reserved.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
