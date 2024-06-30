import { redirect } from "next/navigation"

import AirdropPage from "@/components/dev/airdropPage"

export default function AirdropRoute() {
  if (process.env.NEXT_PUBLIC_ENVIRONMENT !== "dev") {
    redirect("/")
  }

  return <AirdropPage />
}
