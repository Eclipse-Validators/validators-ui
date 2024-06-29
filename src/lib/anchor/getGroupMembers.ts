import { Connection, PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { LibreplexEditions } from "./editions/libreplex_editions";
import { PROGRAM_ID_GROUP_EXTENSIONS } from "./constants";
import bs58 from "bs58";
import { sha256 } from "js-sha256";
import { decodeMember2022 } from "./members";

export async function getGroupMembers(
    connection: Connection,
    groupId: PublicKey
) {
    try {
        const members = await connection.getProgramAccounts(
            PROGRAM_ID_GROUP_EXTENSIONS,
            {
                filters: [
                    {
                        memcmp: {
                            offset: 0,
                            bytes: bs58.encode(
                                sha256.array("spl_token_group_interface:member").slice(0, 8)
                            ),
                        },
                    },
                    {
                        memcmp: {
                            offset: 44,
                            bytes: groupId.toBase58(),
                        },
                    },
                ],
            }
        );

        const membersDecoded = members.map((item) => ({
            member: item.pubkey.toBase58(),
            mint: decodeMember2022(item.account, item.pubkey)?.item?.mint.toBase58()
        }));

        return membersDecoded;
    }
    catch (err) {
        console.error("Error fetching group members:", err);
        return [];
    }
}