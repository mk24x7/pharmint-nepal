"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState } from "react"
import ReactCountryFlag from "react-country-flag"

import { StateType } from "@lib/hooks/use-toggle-state"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

type CountryOption = {
  country: string
  region: string
  label: string
  externalUrl?: string
}

type CountrySelectProps = {
  toggleState: StateType
  regions: HttpTypes.StoreRegion[]
}

const CountrySelect = ({ toggleState, regions }: CountrySelectProps) => {
  const [current, setCurrent] = useState<
    | { country: string | undefined; region: string; label: string | undefined }
    | undefined
  >(undefined)

  const { countryCode } = useParams()
  const currentPath = usePathname().split(`/${countryCode}`)[1]

  const { state, close } = toggleState

  const additionalCountries = [
    {
      country: "np",
      region: "external",
      label: "Nepal",
      externalUrl: "https://pharmint.com.np"
    },
    {
      country: "ph",
      region: "external",
      label: "Philippines",
      externalUrl: "https://pharmint.ph"
    },
    {
      country: "th",
      region: "external",
      label: "Thailand",
      externalUrl: "https://pharmint.co.th"
    }
  ]

  const options = useMemo(() => {
    // const dynamicOptions = regions
    //   ?.map((r) => {
    //     return r.countries?.map((c) => ({
    //       country: c.iso_2,
    //       region: r.id,
    //       label: c.display_name,
    //     }))
    //   })
    //   .flat() || []

    return [...additionalCountries]
      .sort((a, b) => (a?.label ?? "").localeCompare(b?.label ?? ""))
  }, [regions])

  useEffect(() => {
    if (countryCode) {
      const option = options?.find((o) => o?.country === countryCode)
      setCurrent(option)
    } else {
      // Default to Nepal for this website
      const nepalOption = options?.find((o) => o?.country === "np")
      setCurrent(nepalOption)
    }
  }, [options, countryCode])

  const handleChange = (option: CountryOption) => {
    if (option.externalUrl) {
      window.location.href = option.externalUrl
    } else {
      updateRegion(option.country, currentPath)
    }
    close()
  }

  return (
    <div>
      <Listbox
        as="span"
        onChange={handleChange}
        defaultValue={
          countryCode
            ? options?.find((o) => o?.country === countryCode)
            : options?.find((o) => o?.country === "np")
        }
      >
        <ListboxButton className="py-1 w-full text-pharmint-white hover:text-accent transition-colors duration-200">
          <div className="txt-compact-small flex items-start gap-x-2">
            <span className="text-pharmint-muted">Shipping to:</span>
            {current && (
              <span className="txt-compact-small flex items-center gap-x-2 text-pharmint-white">
                {/* @ts-ignore */}
                <ReactCountryFlag
                  svg
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                  countryCode={current.country ?? ""}
                />
                {current.label}
              </span>
            )}
          </div>
        </ListboxButton>
        <div className="flex relative w-full min-w-[320px]">
          <Transition
            show={state}
            as={Fragment}
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions
              className="absolute -bottom-[calc(100%-36px)] left-0 xsmall:left-auto xsmall:right-0 max-h-[442px] overflow-y-scroll z-[900] bg-pharmint-black/95 backdrop-blur-sm border border-pharmint-border rounded-lg shadow-2xl text-small-regular uppercase text-pharmint-white no-scrollbar w-full"
              static
            >
              {options?.map((o, index) => {
                return (
                  <ListboxOption
                    key={index}
                    value={o}
                    className="py-2 hover:bg-accent hover:text-white px-3 cursor-pointer flex items-center gap-x-2 transition-colors duration-200"
                  >
                    {/* @ts-ignore */}
                    <ReactCountryFlag
                      svg
                      style={{
                        width: "16px",
                        height: "16px",
                      }}
                      countryCode={o?.country ?? ""}
                    />{" "}
                    {o?.label}
                  </ListboxOption>
                )
              })}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}

export default CountrySelect
