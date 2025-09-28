"use client"

import { useActionState } from "react"
import { createTransferRequest } from "@lib/data/orders"
import { Text, Heading, Input, Button, IconButton, Toaster } from "@medusajs/ui"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { CheckCircleMiniSolid, XCircleSolid } from "@medusajs/icons"
import { useEffect, useState } from "react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="grid sm:grid-cols-2 items-center gap-x-8 gap-y-4 w-full">
        <div className="flex flex-col gap-y-1">
          <Heading level="h3" className="text-lg text-pharmint-white">
            Order transfers
          </Heading>
          <Text className="text-base-regular text-pharmint-muted">
            Can&apos;t find the order you are looking for?
            <br /> Connect an order to your account.
          </Text>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-y-1 sm:items-end"
        >
          <div className="flex flex-col gap-y-2 w-full">
            <Input className="w-full bg-background-secondary/50 border border-pharmint-border text-pharmint-white placeholder:text-pharmint-muted focus:border-accent transition-colors duration-200" name="order_id" placeholder="Order ID" />
            <SubmitButton
              variant="secondary"
              className="w-fit whitespace-nowrap self-end"
            >
              Request transfer
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <Text className="text-base-regular text-red-400 text-right">
          {state.error}
        </Text>
      )}
      {showSuccess && (
        <div className="flex justify-between p-4 bg-background-secondary/50 border border-pharmint-border rounded-lg w-full self-stretch items-center backdrop-blur-sm">
          <div className="flex gap-x-2 items-center">
            <CheckCircleMiniSolid className="w-4 h-4 text-emerald-500" />
            <div className="flex flex-col gap-y-1">
              <Text className="text-medium-plus text-pharmint-white">
                Transfer for order {state.order?.id} requested
              </Text>
              <Text className="text-base-regular text-pharmint-muted">
                Transfer request email sent to {state.order?.email}
              </Text>
            </div>
          </div>
          <IconButton
            variant="transparent"
            className="h-fit"
            onClick={() => setShowSuccess(false)}
          >
            <XCircleSolid className="w-4 h-4 text-pharmint-muted hover:text-pharmint-white transition-colors duration-200" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
