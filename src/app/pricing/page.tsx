import { PricingTable } from '@clerk/nextjs'

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center  min-h-screen p-2 m-4">
      <PricingTable />
    </div>
  )
}