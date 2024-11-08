import { NextResponse } from 'next/server'

export async function GET() {
  const securityTxt = `Contact: mailto:security@validators.wtf
Expires: 2025-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://validators.wtf/.well-known/security.txt`

  return new NextResponse(securityTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
} 