"use client"

import { createQuoteMessage } from "@lib/data/quotes"
import { StoreCreateQuoteMessage, StoreQuoteResponse } from "@/types/quote"
import { zodResolver } from "@hookform/resolvers/zod"
import { AdminOrderLineItem, AdminOrderPreview } from "@medusajs/types"
import { Button, clx, Container, Heading, Select, Textarea } from "@medusajs/ui"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { QuoteTableItem } from "./quote-table"

export const CreateQuoteMessageForm = z.object({
  text: z.string().min(1),
  item_id: z.string().nullish(),
})

const defaultValues = {
  text: "",
  item_id: undefined,
}

const QuoteMessages = ({
  quote,
  preview,
}: {
  quote: StoreQuoteResponse["quote"]
  preview: AdminOrderPreview
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues,
    resolver: zodResolver(CreateQuoteMessageForm),
  })

  const [isCreatingMessage, setIsCreatingMessage] = useState(false)
  const handleCreateMessage = (data: StoreCreateQuoteMessage) => {
    setIsCreatingMessage(true)
    createQuoteMessage(quote.id, data).finally(() => {
      reset(defaultValues)
      setIsCreatingMessage(false)
    })
  }

  const originalItemsMap = useMemo(() => {
    return new Map<string, AdminOrderLineItem>(
      quote.draft_order?.items?.map((item: AdminOrderLineItem) => [
        item.id,
        item,
      ])
    )
  }, [quote.draft_order])

  const previewItemsMap = useMemo(() => {
    return new Map<string, AdminOrderLineItem>(
      preview?.items?.map((item: AdminOrderLineItem) => [item.id, item])
    )
  }, [preview])

  return (
    <Container className="bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl divide-y divide-pharmint-border p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h3" className="text-pharmint-white">Messages</Heading>
      </div>

      <div>
        {quote.messages?.map((message) => (
          <div
            key={message.id}
            className={clx("px-6 py-4 text-sm flex flex-col gap-y-2", {
              "bg-background-secondary/30 mx-5 my-3 rounded-lg": !!message.customer_id,
            })}
          >
            <div className="font-medium font-sans text-sm text-pharmint-muted">
              {!!message.admin &&
                `${message.admin.first_name} ${message.admin.last_name}`}

              {!!message.customer &&
                `${message.customer.first_name} ${message.customer.last_name}`}
            </div>

            {!!message.item_id && (
              <div className="border border-dashed border-pharmint-border rounded-md my-2 px-4 py-2">
                <QuoteTableItem
                  key={message.item_id}
                  item={previewItemsMap.get(message.item_id)!}
                  originalItem={originalItemsMap.get(message.item_id)}
                  currencyCode={quote.draft_order.currency_code}
                />
              </div>
            )}

            <div className="text-pharmint-white">{message.text}</div>
          </div>
        ))}
      </div>

      <div className="px-4 pt-5 pb-3">
        <form
          onSubmit={handleSubmit(handleCreateMessage)}
          className="flex flex-col gap-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-x-1">
                <label className="font-sans text-sm font-medium text-pharmint-white">
                  Pick Quote Item
                </label>
              </div>
              <span className="text-sm text-pharmint-muted">
                Select a quote item to write a message around
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <Controller
                name="item_id"
                control={control}
                render={({ field: { onChange, ref, value, ...field } }) => (
                  <Select {...field} onValueChange={onChange} value={value || undefined}>
                    <Select.Trigger className="bg-background-secondary/50 border border-pharmint-border text-pharmint-white hover:bg-background-secondary/70 transition-colors w-full min-w-0" ref={ref}>
                      <Select.Value placeholder="Select Item" className="truncate text-left block" />
                    </Select.Trigger>

                    <Select.Content className="bg-background-secondary border border-pharmint-border z-50">
                      {preview?.items && preview.items.length > 0 ? (
                        preview.items.map((item) => {
                          const itemName = item.variant_sku || item.title || `Item ${item.id.slice(-4)}`;
                          return (
                            <Select.Item
                              key={item.id}
                              value={item.id}
                              className="text-pharmint-white hover:bg-background-secondary/70 focus:bg-background-secondary/70 cursor-pointer"
                              title={itemName}
                            >
                              <span className="truncate max-w-xs block">{itemName}</span>
                            </Select.Item>
                          );
                        })
                      ) : (
                        <Select.Item
                          value=""
                          disabled
                          className="text-pharmint-muted cursor-not-allowed"
                        >
                          No items available
                        </Select.Item>
                      )}
                    </Select.Content>
                  </Select>
                )}
              />
              {errors.item_id?.message && <p className="text-red-400 text-sm mt-1">{errors.item_id?.message}</p>}
            </div>
          </div>

          <Textarea
            {...register("text")}
            className="bg-background-secondary/50 border border-pharmint-border text-pharmint-white placeholder:text-pharmint-muted focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="Type your message..."
          />
          {errors.text?.message && <p className="text-red-400 text-sm">{errors.text?.message}</p>}

          <Button
            size="small"
            type="submit"
            className="self-end bg-accent hover:bg-accent-hover text-white font-semibold disabled:opacity-50"
            disabled={isCreatingMessage}
          >
            {isCreatingMessage ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </Container>
  )
}

export default QuoteMessages
