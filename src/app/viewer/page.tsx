"use client";

import { WalletPeeker } from "@/components/viewer/WalletPeeker";

export default function WalletPeekerPage() {
  return (
    <div className="main-bg min-h-screen bg-cover bg-fixed bg-center bg-no-repeat text-foreground">
      <main className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Viewer</h1>
        <WalletPeeker />
      </main>
    </div>
  );
}
