import {
    ANS_PROGRAM_ID,
    findNameHouse,
    findNftRecord,
    getAllTld,
    getHashedName,
    getNameAccountKeyWithBump,
    NameRecordHeader,
    NftRecord,
    TldParser,
} from "@onsol/tldparser";
import {
    Connection,
    GetProgramAccountsResponse,
    PublicKey,
} from "@solana/web3.js";
import { setTimeout } from "timers/promises";

const connection = new Connection('https://mainnetbeta-rpc.eclipse.xyz');

async function findAllDomainsForTld(
    connection: Connection,
    parentAccount: PublicKey,
): Promise<{ pubkey: PublicKey; nameRecordHeader: NameRecordHeader }[]> {
    const filters: any = [
        {
            memcmp: {
                offset: 8,
                bytes: parentAccount.toBase58(),
            },
        },
    ];

    const accounts: GetProgramAccountsResponse =
        await connection.getProgramAccounts(ANS_PROGRAM_ID, {
            filters: filters,
        });
    return accounts.map((a) => {
        return {
            pubkey: a.pubkey,
            nameRecordHeader: NameRecordHeader.fromAccountInfo(a.account),
        };
    });
}

export async function performReverseLookupBatched(
    connection: Connection,
    nameAccounts: PublicKey[],
    tldHouse: PublicKey,
): Promise<(string | undefined)[]> {
    let reverseLookupDomains: (string | undefined)[] = [];

    while (nameAccounts.length > 0) {
        const currentBatch = nameAccounts.splice(0, 100);

        const promises = currentBatch.map(async (nameAccount) => {
            const reverseLookupHashedName = await getHashedName(
                nameAccount.toBase58(),
            );
            const [reverseLookUpAccount] = getNameAccountKeyWithBump(
                reverseLookupHashedName,
                tldHouse,
                undefined,
            );
            return reverseLookUpAccount;
        });

        const reverseLookUpAccounts: PublicKey[] = await Promise.all(promises);
        const reverseLookupAccountInfos =
            await connection.getMultipleAccountsInfo(reverseLookUpAccounts);

        const batchDomains = reverseLookupAccountInfos.map(
            (reverseLookupAccountInfo) => {
                const domain = reverseLookupAccountInfo?.data
                    .subarray(200, reverseLookupAccountInfo?.data.length)
                    .toString();
                return domain;
            },
        );

        reverseLookupDomains = reverseLookupDomains.concat(batchDomains);
    }

    return reverseLookupDomains;
}

// onlyDomains will grab only domains and no nfts
async function getAllRegisteredDomains(
    tldExpected?: string,
    onlyDomains: boolean = false,
) {
    // get all TLDs
    const allTlds = await getAllTld(connection);

    const domains = [];
    for (const tld of allTlds) {
        if (tldExpected) {
            if (tld.tld != tldExpected) continue;
        }
        // get the parent name record for a TLD
        const parentNameRecord = await NameRecordHeader.fromAccountAddress(
            connection,
            tld.parentAccount,
        );
        if (!parentNameRecord) continue;
        if (!parentNameRecord.owner) continue;

        // get all name accounts in a specific TLD
        const allNameAccountsForTld = await findAllDomainsForTld(
            connection,
            tld.parentAccount,
        );
        await setTimeout(50);

        const [nameHouseAccount] = findNameHouse(parentNameRecord.owner);

        const nameAccountPubkeys = allNameAccountsForTld.map((a) => a.pubkey);

        const domainsReverse = await performReverseLookupBatched(
            connection,
            nameAccountPubkeys,
            parentNameRecord.owner,
        );

        let index = 0;
        for (const domain of domainsReverse) {
            const [nftRecord] = findNftRecord(
                allNameAccountsForTld[index].pubkey,
                nameHouseAccount,
            );
            let finalOwner =
                allNameAccountsForTld[index].nameRecordHeader.owner?.toString();
            if (finalOwner == nftRecord.toString() && !onlyDomains) {
                const nftRecordData = await NftRecord.fromAccountAddress(
                    connection,
                    nftRecord,
                );
                const largestAccounts =
                    await connection.getTokenLargestAccounts(
                        nftRecordData.nftMintAccount,
                    );
                if (largestAccounts.value.length > 0) {
                    const largestAccountInfo =
                        await connection.getParsedAccountInfo(
                            largestAccounts.value[0].address,
                        );
                    if (largestAccountInfo?.value?.data) {
                        finalOwner = new PublicKey(
                            // @ts-ignore
                            largestAccountInfo.value.data.parsed.info.owner,
                        ).toString();
                    }
                }
                await setTimeout(50);
            }
            domains.push({
                nameAccount: allNameAccountsForTld[index].pubkey,
                domain: `${domain}${tld.tld}`,
                owner: finalOwner,
                expiresAt:
                    allNameAccountsForTld[index].nameRecordHeader.expiresAt,
                createdAt:
                    allNameAccountsForTld[index].nameRecordHeader.createdAt,
            });
            index += 1;
        }
    }
    return domains;
}

async function main() {
    // or ".eyekon" or ".superteam" or ".monke"
    // if tldExpected is undefined it will grab all domains
    const tldExpected: string | undefined = ".turbo";
    // if set true it will grab only domains and no nfts
    const onlyDomains = false;
    const domains = await getAllRegisteredDomains(tldExpected, onlyDomains);
    console.log(JSON.stringify(domains));
    // console.log(domains?.length)
}

// get all domains registered on AllDomains
main();