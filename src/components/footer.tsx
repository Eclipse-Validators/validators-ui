import Link from 'next/link'
import { Twitter } from 'lucide-react'
import Image from 'next/image'

export function Footer() {
    return (
        <footer className="border-t">
            <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <Image src="/logo/validatorswordmark.png" alt="Validators" width={100} height={100} />
                </div>
                <div className="flex items-center space-x-4">
                    <Link href="https://twitter.com/@Validators_" target="_blank" rel="noreferrer">
                        <Twitter className="h-5 w-5" />
                    </Link>
                    <Link href="https://discord.gg/8cjJ55hKUz" target="_blank" rel="noreferrer">
                        <Image
                            src="icons/discord.svg"
                            alt="Discord"
                            width={20}
                            height={20}
                            className="text-foreground"
                        />
                    </Link>
                </div>
            </div>
        </footer>
    )
}