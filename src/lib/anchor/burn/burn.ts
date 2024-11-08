/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/validator_burn.json`.
 */
/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/validator_burn.json`.
 */
export type ValidatorBurn = {
    "address": "BURN4rs11nKf5apPBLA13XHbNqcTGJFZb9vbBRNc69K7",
    "metadata": {
        "name": "validatorBurn",
        "version": "0.1.0",
        "spec": "0.1.0",
        "description": "Created with Anchor"
    },
    "instructions": [
        {
            "name": "burn",
            "discriminator": [
                116,
                110,
                29,
                56,
                107,
                219,
                42,
                93
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true
                },
                {
                    "name": "tokenAccount",
                    "writable": true
                },
                {
                    "name": "mint",
                    "writable": true
                },
                {
                    "name": "feeCollector",
                    "writable": true
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                },
                {
                    "name": "tokenProgram"
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "burnMetaplexCore",
            "discriminator": [
                25,
                21,
                192,
                32,
                22,
                229,
                24,
                81
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true
                },
                {
                    "name": "asset",
                    "writable": true
                },
                {
                    "name": "collection",
                    "writable": true,
                    "optional": true
                },
                {
                    "name": "feeCollector",
                    "writable": true
                },
                {
                    "name": "mplCoreProgram",
                    "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": []
        },
        {
            "name": "burnMetaplexNft",
            "discriminator": [
                224,
                148,
                243,
                18,
                243,
                11,
                196,
                199
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true
                },
                {
                    "name": "tokenAccount",
                    "writable": true
                },
                {
                    "name": "mint",
                    "writable": true
                },
                {
                    "name": "metadata",
                    "writable": true
                },
                {
                    "name": "masterEdition",
                    "writable": true
                },
                {
                    "name": "feeCollector",
                    "writable": true
                },
                {
                    "name": "collectionMetadata",
                    "optional": true
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                },
                {
                    "name": "metadataProgram",
                    "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
                },
                {
                    "name": "tokenProgram"
                }
            ],
            "args": []
        },
        {
            "name": "closeTokenAccount",
            "discriminator": [
                132,
                172,
                24,
                60,
                100,
                156,
                135,
                97
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "feeCollector",
                    "writable": true
                },
                {
                    "name": "tokenAccount",
                    "writable": true
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                },
                {
                    "name": "tokenProgram"
                }
            ],
            "args": []
        },
        {
            "name": "initialize",
            "discriminator": [
                175,
                175,
                109,
                31,
                13,
                152,
                155,
                237
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                },
                {
                    "name": "burnTokenFee",
                    "type": "u64"
                },
                {
                    "name": "burnNftFee",
                    "type": "u64"
                },
                {
                    "name": "closeTokenFee",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "updateConfig",
            "discriminator": [
                29,
                158,
                252,
                191,
                10,
                83,
                219,
                99
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "burnTokenFee",
                    "type": {
                        "option": "u64"
                    }
                },
                {
                    "name": "burnNftFee",
                    "type": {
                        "option": "u64"
                    }
                },
                {
                    "name": "closeTokenFee",
                    "type": {
                        "option": "u64"
                    }
                },
                {
                    "name": "isEnabled",
                    "type": {
                        "option": "bool"
                    }
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "validatorBurnConfig",
            "discriminator": [
                21,
                41,
                108,
                77,
                205,
                235,
                175,
                27
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "incorrectAuthority",
            "msg": "Incorrect Authority Signer"
        },
        {
            "code": 6001,
            "name": "invalidFeeCollector",
            "msg": "Invalid Fee Collector"
        },
        {
            "code": 6002,
            "name": "configAlreadyInitialized",
            "msg": "Config Already Initialized"
        },
        {
            "code": 6003,
            "name": "configNotInitializedOrEnabled",
            "msg": "Config Not Initialized or Enabled"
        },
        {
            "code": 6004,
            "name": "alreadyInitialized",
            "msg": "Already initialized"
        },
        {
            "code": 6005,
            "name": "closeAccountError",
            "msg": "Close Account Error"
        },
        {
            "code": 6006,
            "name": "tokenAccountNotEmpty",
            "msg": "Token Account Not Empty"
        }
    ],
    "types": [
        {
            "name": "validatorBurnConfig",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "isInitialized",
                        "type": "bool"
                    },
                    {
                        "name": "isEnabled",
                        "type": "bool"
                    },
                    {
                        "name": "burnTokenFee",
                        "type": "u64"
                    },
                    {
                        "name": "burnNftFee",
                        "type": "u64"
                    },
                    {
                        "name": "closeTokenFee",
                        "type": "u64"
                    }
                ]
            }
        }
    ]
};


export const IDL: ValidatorBurn = {
    "address": "BURN4rs11nKf5apPBLA13XHbNqcTGJFZb9vbBRNc69K7",
    "metadata": {
        "name": "validatorBurn",
        "version": "0.1.0",
        "spec": "0.1.0",
        "description": "Created with Anchor"
    },
    "instructions": [
        {
            "name": "burn",
            "discriminator": [
                116,
                110,
                29,
                56,
                107,
                219,
                42,
                93
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true
                },
                {
                    "name": "tokenAccount",
                    "writable": true
                },
                {
                    "name": "mint",
                    "writable": true
                },
                {
                    "name": "feeCollector",
                    "writable": true
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                },
                {
                    "name": "tokenProgram"
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "burnMetaplexCore",
            "discriminator": [
                25,
                21,
                192,
                32,
                22,
                229,
                24,
                81
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true
                },
                {
                    "name": "asset",
                    "writable": true
                },
                {
                    "name": "collection",
                    "writable": true,
                    "optional": true
                },
                {
                    "name": "feeCollector",
                    "writable": true
                },
                {
                    "name": "mplCoreProgram",
                    "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": []
        },
        {
            "name": "burnMetaplexNft",
            "discriminator": [
                224,
                148,
                243,
                18,
                243,
                11,
                196,
                199
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true
                },
                {
                    "name": "tokenAccount",
                    "writable": true
                },
                {
                    "name": "mint",
                    "writable": true
                },
                {
                    "name": "metadata",
                    "writable": true
                },
                {
                    "name": "masterEdition",
                    "writable": true
                },
                {
                    "name": "feeCollector",
                    "writable": true
                },
                {
                    "name": "collectionMetadata",
                    "optional": true
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                },
                {
                    "name": "metadataProgram",
                    "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
                },
                {
                    "name": "tokenProgram"
                }
            ],
            "args": []
        },
        {
            "name": "closeTokenAccount",
            "discriminator": [
                132,
                172,
                24,
                60,
                100,
                156,
                135,
                97
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "feeCollector",
                    "writable": true
                },
                {
                    "name": "tokenAccount",
                    "writable": true
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                },
                {
                    "name": "tokenProgram"
                }
            ],
            "args": []
        },
        {
            "name": "initialize",
            "discriminator": [
                175,
                175,
                109,
                31,
                13,
                152,
                155,
                237
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                },
                {
                    "name": "burnTokenFee",
                    "type": "u64"
                },
                {
                    "name": "burnNftFee",
                    "type": "u64"
                },
                {
                    "name": "closeTokenFee",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "updateConfig",
            "discriminator": [
                29,
                158,
                252,
                191,
                10,
                83,
                219,
                99
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "burnTokenFee",
                    "type": {
                        "option": "u64"
                    }
                },
                {
                    "name": "burnNftFee",
                    "type": {
                        "option": "u64"
                    }
                },
                {
                    "name": "closeTokenFee",
                    "type": {
                        "option": "u64"
                    }
                },
                {
                    "name": "isEnabled",
                    "type": {
                        "option": "bool"
                    }
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "validatorBurnConfig",
            "discriminator": [
                21,
                41,
                108,
                77,
                205,
                235,
                175,
                27
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "incorrectAuthority",
            "msg": "Incorrect Authority Signer"
        },
        {
            "code": 6001,
            "name": "invalidFeeCollector",
            "msg": "Invalid Fee Collector"
        },
        {
            "code": 6002,
            "name": "configAlreadyInitialized",
            "msg": "Config Already Initialized"
        },
        {
            "code": 6003,
            "name": "configNotInitializedOrEnabled",
            "msg": "Config Not Initialized or Enabled"
        },
        {
            "code": 6004,
            "name": "alreadyInitialized",
            "msg": "Already initialized"
        },
        {
            "code": 6005,
            "name": "closeAccountError",
            "msg": "Close Account Error"
        },
        {
            "code": 6006,
            "name": "tokenAccountNotEmpty",
            "msg": "Token Account Not Empty"
        }
    ],
    "types": [
        {
            "name": "validatorBurnConfig",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "isInitialized",
                        "type": "bool"
                    },
                    {
                        "name": "isEnabled",
                        "type": "bool"
                    },
                    {
                        "name": "burnTokenFee",
                        "type": "u64"
                    },
                    {
                        "name": "burnNftFee",
                        "type": "u64"
                    },
                    {
                        "name": "closeTokenFee",
                        "type": "u64"
                    }
                ]
            }
        }
    ]
};