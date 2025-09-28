"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { clx } from "@medusajs/ui"
import Image from "next/image"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const route = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [imageLoaded, setImageLoaded] = useState(false)
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(() => {
    const viewFromUrl = searchParams.get("view") as LOGIN_VIEW
    return viewFromUrl && Object.values(LOGIN_VIEW).includes(viewFromUrl)
      ? viewFromUrl
      : LOGIN_VIEW.SIGN_IN
  })

  useEffect(() => {
    if (searchParams.has("view")) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete("view")
      router.replace(
        `${route}${newParams.toString() ? `?${newParams.toString()}` : ""}`,
        { scroll: false }
      )
    }
  }, [searchParams, route, router])

  useEffect(() => {
    const image = new window.Image()
    image.src = "/account-block.jpg"
    image.onload = () => {
      setImageLoaded(true)
    }
  }, [])

  const updateView = (view: LOGIN_VIEW) => {
    setCurrentView(view)
    router.push(`/account?view=${view}`)
  }

  return (
    <div className="grid grid-cols-1 small:grid-cols-2 gap-2 small:gap-4 m-2 small:m-4 min-h-[calc(100vh-200px)] rounded-none small:rounded-lg overflow-hidden border-0 small:border border-pharmint-border bg-background">
      <div className="flex justify-center items-center bg-background-secondary border-0 small:border-r border-pharmint-border p-6 small:p-8 xsmall:p-12 h-full min-h-[60vh] small:min-h-full">
        {currentView === LOGIN_VIEW.SIGN_IN ? (
          <Login setCurrentView={updateView} />
        ) : (
          <Register setCurrentView={updateView} />
        )}
      </div>

      <div className="relative bg-gradient-to-br from-accent/10 to-accent/5 min-h-[25vh] small:min-h-full">
        <Image
          src="/account-block.jpg"
          alt="Pharmaceutical laboratory workspace"
          className={clx(
            "object-cover transition-opacity duration-300 w-full h-full mix-blend-overlay",
            imageLoaded ? "opacity-70" : "opacity-0"
          )}
          fill
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute bottom-4 small:bottom-8 left-4 small:left-8 right-4 small:right-8">
          <h2 className="text-xl small:text-2xl xsmall:text-3xl font-bold text-pharmint-white mb-1 small:mb-2">
            Professional Pharmaceutical Platform
          </h2>
          <p className="text-pharmint-muted text-xs small:text-sm xsmall:text-base">
            Streamline your procurement processes with our comprehensive B2B solution designed for pharmaceutical professionals.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate
