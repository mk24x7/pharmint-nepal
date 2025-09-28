"use client"

import { Button } from "@medusajs/ui"
import React from "react"
import { useFormStatus } from "react-dom"

export function SubmitButton({
  children,
  variant = "primary",
  className,
  disabled = false,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "transparent" | "danger" | null
  className?: string
  disabled?: boolean
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      size="large"
      className={`bg-accent hover:bg-accent-hover text-white border-accent font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent disabled:hover:scale-100 ${className}`}
      type="submit"
      isLoading={pending}
      disabled={disabled || pending}
      variant={variant || "primary"}
      data-testid={dataTestId}
    >
      {children}
    </Button>
  )
}
