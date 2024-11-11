import {
    ANS_PROGRAM_ID,
    findNameHouse,
    findNftRecord,
    getAllTld,
    getHashedName,
    getNameAccountKeyWithBump,
    NameRecordHeader,
    NftRecord,
} from "@onsol/tldparser";
import { Connection, PublicKey } from "@solana/web3.js";
import { setTimeout } from "timers/promises";
import { getDomains } from "./get-domains";

async function findAllDomainsForTld(
    connection: Connection,
    parentAccount: PublicKey,
) {
    const accounts = await connection.getProgramAccounts(ANS_PROGRAM_ID, {
        filters: [{
            memcmp: {
                offset: 8,
                bytes: parentAccount.toBase58(),
            },
        }],
    });
    return accounts.map(a => ({
        pubkey: a.pubkey,
        nameRecordHeader: NameRecordHeader.fromAccountInfo(a.account),
    }));
}

async function performReverseLookupBatched(
    connection: Connection,
    nameAccounts: PublicKey[],
    tldHouse: PublicKey,
): Promise<(string | undefined)[]> {
    const reverseLookupDomains: (string | undefined)[] = [];
    const batchSize = 100;

    for (let i = 0; i < nameAccounts.length; i += batchSize) {
        const batch = nameAccounts.slice(i, i + batchSize);
        const lookupAccounts = await Promise.all(
            batch.map(async nameAccount => {
                const hashedName = await getHashedName(nameAccount.toBase58());
                const [account] = getNameAccountKeyWithBump(hashedName, tldHouse, undefined);
                return account;
            })
        );

        const accountInfos = await connection.getMultipleAccountsInfo(lookupAccounts);
        const domains = accountInfos.map(info =>
            info?.data.subarray(200, info.data.length).toString()
        );

        reverseLookupDomains.push(...domains);
    }

    return reverseLookupDomains;
}

async function main() {
    const connection = new Connection('https://mainnetbeta-rpc.eclipse.xyz');
    console.log('Fetching domains...');

    try {
        // Get just .eclipse domains
        const test = await getDomains();
        const tld = test[0].tld.toString();
        const domains = await getAllRegisteredDomains(connection, tld, true);

        // Print first 5 for testing
        console.log('\nFirst 5 .eclipse domains:');
        domains.slice(0, 5).forEach(domain => {
            console.log(`Domain: ${domain.domain}`);
            console.log(`Owner: ${domain.owner}`);
            console.log('---');
        });

        console.log(`\nTotal domains found: ${domains.length}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getAllRegisteredDomains(
    connection: Connection,
    tldExpected?: string,
    onlyDomains: boolean = false,
) {
    const allTlds = await getAllTld(connection);
    const domains = [];

    for (const tld of allTlds) {
        if (tldExpected && tld.tld !== tldExpected) continue;

        const parentNameRecord = await NameRecordHeader.fromAccountAddress(
            connection,
            tld.parentAccount,
        );
        if (!parentNameRecord?.owner) continue;

        const allNameAccountsForTld = await findAllDomainsForTld(connection, tld.parentAccount);
        await setTimeout(50);

        const [nameHouseAccount] = findNameHouse(parentNameRecord.owner);
        const nameAccountPubkeys = allNameAccountsForTld.map(a => a.pubkey);

        const domainsReverse = await performReverseLookupBatched(
            connection,
            nameAccountPubkeys,
            parentNameRecord.owner,
        );

        for (let i = 0; i < domainsReverse.length; i++) {
            const domain = domainsReverse[i];
            let finalOwner = allNameAccountsForTld[i].nameRecordHeader.owner?.toString();

            if (!onlyDomains) {
                const [nftRecord] = findNftRecord(allNameAccountsForTld[i].pubkey, nameHouseAccount);
                if (finalOwner === nftRecord.toString()) {
                    const nftRecordData = await NftRecord.fromAccountAddress(connection, nftRecord);
                    const largestAccounts = await connection.getTokenLargestAccounts(nftRecordData.nftMintAccount);

                    if (largestAccounts.value.length > 0) {
                        const largestAccountInfo = await connection.getParsedAccountInfo(largestAccounts.value[0].address);
                        if (largestAccountInfo?.value?.data) {
                            // @ts-ignore
                            finalOwner = new PublicKey(largestAccountInfo.value.data.parsed.info.owner).toString();
                        }
                    }
                    await setTimeout(50);
                }
            }

            domains.push({
                nameAccount: allNameAccountsForTld[i].pubkey,
                domain: `${domain}${tld.tld}`,
                owner: finalOwner,
                expiresAt: allNameAccountsForTld[i].nameRecordHeader.expiresAt,
                createdAt: allNameAccountsForTld[i].nameRecordHeader.createdAt,
            });
        }
    }
    return domains;
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    }); 