import CollectionSection from "../collection-section"

interface BestSellersProps {
  countryCode: string
}

export default async function BestSellers({ countryCode }: BestSellersProps) {
  return (
    <CollectionSection
      handle="best-sellers"
      countryCode={countryCode}
      title="Best Sellers"
      description="Most popular pharmaceutical products across all companies - trusted by healthcare professionals"
    />
  )
}