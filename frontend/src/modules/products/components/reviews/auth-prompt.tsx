"use client"

import React from "react"
import { Button } from "@medusajs/ui"

interface AuthPromptProps {
  onSignIn?: () => void
}

const AuthPrompt: React.FC<AuthPromptProps> = ({
  onSignIn
}) => {
  return (
    <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-6 text-center space-y-4">
      <div className="w-12 h-12 mx-auto text-ui-fg-muted">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-ui-fg-base mb-2">
          Sign in to leave a review
        </h3>
        <p className="text-sm text-ui-fg-subtle mb-4">
          Only customers who have purchased this product can write reviews
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onSignIn}
          className="w-full sm:w-auto min-w-[160px]"
        >
          Sign In
        </Button>
        
        <div className="text-xs text-ui-fg-subtle space-y-1">
          <div className="flex items-center justify-center gap-1">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Verified purchase required</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Reviews are moderated</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>One review per product</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPrompt