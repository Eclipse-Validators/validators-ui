"use client"

import TransferTokens from "@/components/transfer/TransferTokens"

export default function TransferPage() {
  return (
    <div className="main-bg min-h-screen bg-cover bg-fixed bg-center bg-no-repeat text-foreground">
      <main className="container mx-auto p-4">
        <TransferTokens />
      </main>
    </div>
  )
}
