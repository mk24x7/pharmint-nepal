"use client"

import { createQuote } from "@lib/data/quotes"
import { XCircle } from "@medusajs/icons"
import { toast } from "@medusajs/ui"
import { Button } from "@medusajs/ui"
import * as Dialog from "@radix-ui/react-dialog"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export const RequestQuoteConfirmation = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [requesting, setRequesting] = useState(false)
  const [open, setOpen] = useState(false)
  const { countryCode } = useParams()
  const router = useRouter()

  const handleCreateQuoteRequest = async () => {
    setRequesting(true)

    try {
      const { quote } = await createQuote()

      router.push(`/${countryCode}/account/quotes/details/${quote.id}`)
    } catch (error) {
      setRequesting(false)
      toast.error("Failed to create quote request")
    }

    setOpen(false)
    setRequesting(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-[75]" />
        <Dialog.Content className="z-[100] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-background-secondary/95 backdrop-blur-sm border border-pharmint-border p-6 shadow-2xl shadow-black/50 focus:outline-none">
          <Dialog.Title className="text-lg mb-6 flex justify-between text-pharmint-white font-semibold">
            Submit request for quote
            <Dialog.Close asChild>
              <XCircle className="text-pharmint-muted hover:text-pharmint-white transition-colors duration-200 inline-flex appearance-none items-center justify-center rounded-full hover:bg-pharmint-border/20 p-1 outline-none cursor-pointer" />
            </Dialog.Close>
          </Dialog.Title>

          <div className="flex flex-col gap-y-4">
            <p className="text-pharmint-muted leading-relaxed">
              You are about to request a quote for the cart. If you confirm, the
              cart will be converted to a quote.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-x-3">
            <Dialog.Close asChild>
              <Button
                variant="secondary"
                disabled={requesting}
                className="bg-background-secondary/50 border border-pharmint-border text-pharmint-white hover:bg-background-secondary/70 hover:text-accent transition-all duration-200"
              >
                Cancel
              </Button>
            </Dialog.Close>

            <Button
              onClick={handleCreateQuoteRequest}
              disabled={requesting}
              className="bg-accent hover:bg-accent-hover text-white border-accent font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {requesting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}