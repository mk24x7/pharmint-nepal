import CollectionSection from "../collection-section"

interface NewArrivalsProps {
  countryCode: string
}

export default async function NewArrivals({ countryCode }: NewArrivalsProps) {
  return (
    <CollectionSection
      handle="new-arrivals"
      countryCode={countryCode}
      title="New Arrivals"
      description="Recently added pharmaceutical products - stay updated with our latest inventory additions"
    />
  )
}