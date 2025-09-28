"use client"

import { useState } from "react"
import { Button } from "@medusajs/ui"
import Modal from "@modules/common/components/modal"

type PromptModalProps = {
  title: string
  description: string
  handleAction: () => void | Promise<void>
  isLoading?: boolean
  children: React.ReactNode
}

export const PromptModal = ({
  title,
  description,
  handleAction,
  isLoading = false,
  children,
}: PromptModalProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const onAction = async () => {
    await handleAction()
    setIsOpen(false)
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <Modal isOpen={isOpen} close={() => setIsOpen(false)} size="small">
        <Modal.Title>{title}</Modal.Title>
        <Modal.Description>
          <p className="text-center">{description}</p>
        </Modal.Description>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="bg-background-secondary/50 border border-pharmint-border text-pharmint-white hover:bg-background-secondary/70 hover:text-accent transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={onAction}
            disabled={isLoading}
            isLoading={isLoading}
            className="bg-accent hover:bg-accent-hover text-white"
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}