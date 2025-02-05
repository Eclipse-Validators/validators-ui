/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/blip_radar.json`.
 */
export type BlipRadar = {
  address: "rdr1DeFWkwG6nQfammDLTzRT6uW32t7yEHWCmcr49Df";
  metadata: {
    name: "blipRadar";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "addTemplate";
      discriminator: [122, 237, 121, 173, 11, 15, 113, 122];
      accounts: [
        {
          name: "config";
          writable: true;
        },
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "mint";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "uri";
          type: "string";
        },
        {
          name: "artistWallet";
          type: "pubkey";
        },
        {
          name: "artistName";
          type: "string";
        },
        {
          name: "artistBasisPoints";
          type: "u16";
        },
        {
          name: "artistSocials";
          type: "string";
        },
      ];
    },
    {
      name: "initConfig";
      discriminator: [23, 235, 115, 232, 168, 96, 1, 231];
      accounts: [
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "feeLamports";
          type: "u64";
        },
        {
          name: "feeShares";
          type: {
            vec: {
              defined: {
                name: "feeShare";
              };
            };
          };
        },
      ];
    },
    {
      name: "sendBlip";
      discriminator: [31, 195, 67, 8, 119, 108, 224, 12];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "receiver";
        },
        {
          name: "feeEscrow";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [102, 101, 101, 95, 101, 115, 99, 114, 111, 119];
              },
            ];
          };
        },
        {
          name: "asset";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "collection";
          writable: true;
        },
        {
          name: "collectionAuthority";
          signer: true;
        },
        {
          name: "mplCoreProgram";
          address: "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "assetJsonUri";
          type: "string";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "blipConfig";
      discriminator: [81, 166, 254, 21, 136, 134, 193, 229];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "invalidAuthority";
      msg: "Invalid Authority";
    },
    {
      code: 6001;
      name: "invalidFeeDestination";
      msg: "Invalid Fee Destination";
    },
    {
      code: 6002;
      name: "tooManyFeeShares";
      msg: "Too many fee shares";
    },
    {
      code: 6003;
      name: "invalidFeeBasisPoints";
      msg: "Invalid fee basis points";
    },
    {
      code: 6004;
      name: "incorrectAuthority";
      msg: "Incorrect Authority";
    },
    {
      code: 6005;
      name: "noFeeShareRecipients";
      msg: "No fee share recipients";
    },
    {
      code: 6006;
      name: "feeShareRecipientNotWritable";
      msg: "Fee share recipient not writable";
    },
    {
      code: 6007;
      name: "invalidFeeShareRecipient";
      msg: "Invalid fee share recipient";
    },
    {
      code: 6008;
      name: "calculationError";
      msg: "Calculation error";
    },
    {
      code: 6009;
      name: "uriTooLong";
      msg: "URI exceeds maximum length of 120 characters";
    },
    {
      code: 6010;
      name: "maxTemplatesReached";
      msg: "Maximum number of templates reached";
    },
    {
      code: 6011;
      name: "invalidMintOwner";
      msg: "Invalid Mint Owner";
    },
  ];
  types: [
    {
      name: "blipConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "feeLamports";
            type: "u64";
          },
          {
            name: "feeShares";
            type: {
              vec: {
                defined: {
                  name: "feeShare";
                };
              };
            };
          },
          {
            name: "templates";
            type: {
              vec: {
                defined: {
                  name: "template";
                };
              };
            };
          },
        ];
      };
    },
    {
      name: "feeShare";
      type: {
        kind: "struct";
        fields: [
          {
            name: "basisPoints";
            type: "u16";
          },
          {
            name: "destination";
            type: "pubkey";
          },
        ];
      };
    },
    {
      name: "template";
      type: {
        kind: "struct";
        fields: [
          {
            name: "uri";
            type: {
              array: ["u8", 120];
            };
          },
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "artistWallet";
            type: "pubkey";
          },
          {
            name: "artistName";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "artistBasisPoints";
            type: "u16";
          },
          {
            name: "artistSocials";
            type: {
              array: ["u8", 60];
            };
          },
        ];
      };
    },
  ];
};

export const IDL: BlipRadar = {
  address: "rdr1DeFWkwG6nQfammDLTzRT6uW32t7yEHWCmcr49Df",
  metadata: {
    name: "blipRadar",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "addTemplate",
      discriminator: [122, 237, 121, 173, 11, 15, 113, 122],
      accounts: [
        {
          name: "config",
          writable: true,
        },
        {
          name: "authority",
          writable: true,
          signer: true,
        },
        {
          name: "mint",
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "uri",
          type: "string",
        },
        {
          name: "artistWallet",
          type: "pubkey",
        },
        {
          name: "artistName",
          type: "string",
        },
        {
          name: "artistBasisPoints",
          type: "u16",
        },
        {
          name: "artistSocials",
          type: "string",
        },
      ],
    },
    {
      name: "initConfig",
      discriminator: [23, 235, 115, 232, 168, 96, 1, 231],
      accounts: [
        {
          name: "authority",
          writable: true,
          signer: true,
        },
        {
          name: "config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "feeLamports",
          type: "u64",
        },
        {
          name: "feeShares",
          type: {
            vec: {
              defined: {
                name: "feeShare",
              },
            },
          },
        },
      ],
    },
    {
      name: "sendBlip",
      discriminator: [31, 195, 67, 8, 119, 108, 224, 12],
      accounts: [
        {
          name: "payer",
          writable: true,
          signer: true,
        },
        {
          name: "receiver",
        },
        {
          name: "feeEscrow",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [102, 101, 101, 95, 101, 115, 99, 114, 111, 119],
              },
            ],
          },
        },
        {
          name: "asset",
          writable: true,
          signer: true,
        },
        {
          name: "config",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "collection",
          writable: true,
        },
        {
          name: "collectionAuthority",
          signer: true,
        },
        {
          name: "mplCoreProgram",
          address: "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "assetJsonUri",
          type: "string",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "blipConfig",
      discriminator: [81, 166, 254, 21, 136, 134, 193, 229],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "invalidAuthority",
      msg: "Invalid Authority",
    },
    {
      code: 6001,
      name: "invalidFeeDestination",
      msg: "Invalid Fee Destination",
    },
    {
      code: 6002,
      name: "tooManyFeeShares",
      msg: "Too many fee shares",
    },
    {
      code: 6003,
      name: "invalidFeeBasisPoints",
      msg: "Invalid fee basis points",
    },
    {
      code: 6004,
      name: "incorrectAuthority",
      msg: "Incorrect Authority",
    },
    {
      code: 6005,
      name: "noFeeShareRecipients",
      msg: "No fee share recipients",
    },
    {
      code: 6006,
      name: "feeShareRecipientNotWritable",
      msg: "Fee share recipient not writable",
    },
    {
      code: 6007,
      name: "invalidFeeShareRecipient",
      msg: "Invalid fee share recipient",
    },
    {
      code: 6008,
      name: "calculationError",
      msg: "Calculation error",
    },
    {
      code: 6009,
      name: "uriTooLong",
      msg: "URI exceeds maximum length of 120 characters",
    },
    {
      code: 6010,
      name: "maxTemplatesReached",
      msg: "Maximum number of templates reached",
    },
    {
      code: 6011,
      name: "invalidMintOwner",
      msg: "Invalid Mint Owner",
    },
  ],
  types: [
    {
      name: "blipConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "feeLamports",
            type: "u64",
          },
          {
            name: "feeShares",
            type: {
              vec: {
                defined: {
                  name: "feeShare",
                },
              },
            },
          },
          {
            name: "templates",
            type: {
              vec: {
                defined: {
                  name: "template",
                },
              },
            },
          },
        ],
      },
    },
    {
      name: "feeShare",
      type: {
        kind: "struct",
        fields: [
          {
            name: "basisPoints",
            type: "u16",
          },
          {
            name: "destination",
            type: "pubkey",
          },
        ],
      },
    },
    {
      name: "template",
      type: {
        kind: "struct",
        fields: [
          {
            name: "uri",
            type: {
              array: ["u8", 120],
            },
          },
          {
            name: "mint",
            type: "pubkey",
          },
          {
            name: "artistWallet",
            type: "pubkey",
          },
          {
            name: "artistName",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "artistBasisPoints",
            type: "u16",
          },
          {
            name: "artistSocials",
            type: {
              array: ["u8", 60],
            },
          },
        ],
      },
    },
  ],
};
