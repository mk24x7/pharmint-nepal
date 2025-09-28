"use server"

import { removeAuthToken } from "@lib/data/cookies"
import { getCacheTag } from "@lib/data/cookies"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

export async function clearExpiredToken() {
  try {
    await removeAuthToken()
    
    // Clear customer cache
    const customerCacheTag = await getCacheTag("customers")
    if (customerCacheTag) {
      revalidateTag(customerCacheTag)
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log("Expired token cleared successfully")
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to clear expired token:", error)
    return { success: false, error: String(error) }
  }
}

export async function clearTokenAndRedirect(countryCode: string = "ph") {
  await clearExpiredToken()
  redirect(`/${countryCode}/account`)
}