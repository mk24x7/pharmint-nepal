import CollectionSection from "../collection-section"

interface EssentialMedicinesProps {
  countryCode: string
}

export default async function EssentialMedicines({ countryCode }: EssentialMedicinesProps) {
  return (
    <CollectionSection
      handle="essential-medicines"
      countryCode={countryCode}
      title="Essential Medicines"
      description="Core pharmaceutical necessities and WHO Essential Medicines List items - critical for healthcare operations"
    />
  )
}