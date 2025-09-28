"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { XCircle } from "@medusajs/icons"
import * as Dialog from "@radix-ui/react-dialog"

export const RequestQuotePrompt = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>{children}</Dialog.Trigger>

    <Dialog.Portal>
      <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-[75]" />
      <Dialog.Content className="z-[100] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-background-secondary/95 backdrop-blur-sm border border-pharmint-border p-6 shadow-2xl shadow-black/50 focus:outline-none">
        <Dialog.Title className="flex justify-between font-semibold text-lg text-pharmint-white mb-6">
          Request a quote
          <Dialog.Close asChild>
            <XCircle className="text-pharmint-muted hover:text-pharmint-white transition-colors duration-200 inline-flex appearance-none items-center justify-center rounded-full hover:bg-pharmint-border/20 p-1 outline-none cursor-pointer" />
          </Dialog.Close>
        </Dialog.Title>

        <div className="space-y-4">
          <p className="text-pharmint-muted">To request a quote, please follow these steps:</p>
          <ol className="list-decimal ml-6 space-y-2 text-pharmint-white">
            <li>
              <Dialog.Close asChild>
                <LocalizedClientLink
                  className="text-accent hover:text-accent-hover underline transition-colors duration-200"
                  href="/account"
                >
                  Log in
                </LocalizedClientLink>
              </Dialog.Close>
              {" or "}
              <Dialog.Close>
                <LocalizedClientLink
                  className="text-accent hover:text-accent-hover underline transition-colors duration-200"
                  href="/account"
                >
                  create an account
                </LocalizedClientLink>
              </Dialog.Close>
            </li>
            <li>Add products to your cart</li>
            <li>
              Open cart & click {'"'}Request a quote{'"'}
            </li>
          </ol>

          <p className="text-pharmint-muted text-sm">We will then get back to you as soon as possible over email</p>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)