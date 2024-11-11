import { getAllTld } from "@onsol/tldparser";
import { Connection } from "@solana/web3.js";

export async function getDomains() {
    const connection = new Connection('https://mainnetbeta-rpc.eclipse.xyz');

    const allTlds = await getAllTld(connection);
    console.log('All TLDs:', allTlds);
    return allTlds;
}

getDomains()
    .then(() => process.exit(0))
    .catch(console.error); 