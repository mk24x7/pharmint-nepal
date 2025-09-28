import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import SearchTemplate from "@modules/search/templates"

export const metadata: Metadata = {
  title: "Search Results",
  description: "Find medicines and healthcare products",
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ 
    q?: string
    page?: string 
    category?: string
  }>
}

export default async function SearchPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { q, page, category } = searchParams

  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  if (!q) {
    notFound()
  }

  return (
    <SearchTemplate
      query={q}
      page={page ? parseInt(page) : 1}
      category={category}
      region={region}
      countryCode={params.countryCode}
    />
  )
}