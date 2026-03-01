/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/vortex.json`.
 */
export type Vortex = {
    "address": "vtxM7RzWqnpvzWxATC9yzM5Uqx1o7BMoqtqsWAYZ8RR",
    "metadata": {
        "name": "vortex",
        "version": "0.1.0",
        "spec": "0.1.0",
        "description": "Permanent NFT locker for LibrePlex tokens on Eclipse"
    },
    "instructions": [
        {
            "name": "lockNft",
            "docs": [
                "Permanently locks a LibrePlex NFT (Token2022) by transferring it",
                "into a PDA-controlled token account. There is no unlock instruction,",
                "making this irreversible."
            ],
            "discriminator": [
                20,
                204,
                200,
                74,
                120,
                226,
                115,
                6
            ],
            "accounts": [
                {
                    "name": "owner",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "nftMint"
                },
                {
                    "name": "userTokenAccount",
                    "writable": true
                },
                {
                    "name": "vault",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "nftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "vaultTokenAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "vault"
                            },
                            {
                                "kind": "account",
                                "path": "tokenProgram"
                            },
                            {
                                "kind": "account",
                                "path": "nftMint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "tokenProgram"
                },
                {
                    "name": "associatedTokenProgram",
                    "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "vault",
            "discriminator": [
                211,
                8,
                232,
                43,
                2,
                152,
                117,
                119
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "invalidNftMint",
            "msg": "The provided mint is not a valid NFT (must have supply=1, decimals=0)"
        },
        {
            "code": 6001,
            "name": "mintMismatch",
            "msg": "Token account mint does not match the provided NFT mint"
        },
        {
            "code": 6002,
            "name": "ownerMismatch",
            "msg": "Token account owner does not match the signer"
        },
        {
            "code": 6003,
            "name": "insufficientBalance",
            "msg": "Token account does not hold the NFT (amount must be 1)"
        }
    ],
    "types": [
        {
            "name": "vault",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "nftMint",
                        "type": "pubkey"
                    },
                    {
                        "name": "originalOwner",
                        "type": "pubkey"
                    },
                    {
                        "name": "lockedAt",
                        "type": "i64"
                    }
                ]
            }
        }
    ]
};


export const IDL: Vortex = {
    "address": "vtxM7RzWqnpvzWxATC9yzM5Uqx1o7BMoqtqsWAYZ8RR",
    "metadata": {
        "name": "vortex",
        "version": "0.1.0",
        "spec": "0.1.0",
        "description": "Permanent NFT locker for LibrePlex tokens on Eclipse"
    },
    "instructions": [
        {
            "name": "lockNft",
            "docs": [
                "Permanently locks a LibrePlex NFT (Token2022) by transferring it",
                "into a PDA-controlled token account. There is no unlock instruction,",
                "making this irreversible."
            ],
            "discriminator": [
                20,
                204,
                200,
                74,
                120,
                226,
                115,
                6
            ],
            "accounts": [
                {
                    "name": "owner",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "nftMint"
                },
                {
                    "name": "userTokenAccount",
                    "writable": true
                },
                {
                    "name": "vault",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "nftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "vaultTokenAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "vault"
                            },
                            {
                                "kind": "account",
                                "path": "tokenProgram"
                            },
                            {
                                "kind": "account",
                                "path": "nftMint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "tokenProgram"
                },
                {
                    "name": "associatedTokenProgram",
                    "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "vault",
            "discriminator": [
                211,
                8,
                232,
                43,
                2,
                152,
                117,
                119
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "invalidNftMint",
            "msg": "The provided mint is not a valid NFT (must have supply=1, decimals=0)"
        },
        {
            "code": 6001,
            "name": "mintMismatch",
            "msg": "Token account mint does not match the provided NFT mint"
        },
        {
            "code": 6002,
            "name": "ownerMismatch",
            "msg": "Token account owner does not match the signer"
        },
        {
            "code": 6003,
            "name": "insufficientBalance",
            "msg": "Token account does not hold the NFT (amount must be 1)"
        }
    ],
    "types": [
        {
            "name": "vault",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "nftMint",
                        "type": "pubkey"
                    },
                    {
                        "name": "originalOwner",
                        "type": "pubkey"
                    },
                    {
                        "name": "lockedAt",
                        "type": "i64"
                    }
                ]
            }
        }
    ]
};
