"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { AssetV1, fetchAssetsByOwner } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { base58, base64 } from "@metaplex-foundation/umi/serializers";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SendTransactionError } from "@solana/web3.js";
import { toast } from "sonner";

import { useDebounce } from "@/lib/hooks/useDebounce";
import { useEclipseDomainLookup } from "@/hooks/use-eclipse-domain-lookup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlipNftData } from "@/components/mint/blipNftCard";
import { BlipNftGrid } from "@/components/mint/blipNftGrid";

import { generateBlip, TemplateWithConfig } from "./actions";

const artistTemplates = [
  // {
  //   uri: "https://arweave.net/Opo1BMaJOEL7frhtnlsstOpeTMj2uK71KHBGpRx3LJA?ext=gif",
  //   mint: "4kmandkHVYKaJxPvNC5aQHGLhyY5AjH3DipBzzv2eAfP",
  //   artistWallet: "9DbD6nmkeiYStSn8DNuMhkezpK5P3xGLBx5RFkYKNEBx",
  //   artistName: "Ash",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://x.com/Ashes_arc",
  // },
  {
    uri: "https://arweave.net/Ot1Ju61AtjpOl2Tt5lyioOJeEi8SChjqUIuB35pKVDs?ext=gif",
    mint: "7joBw7ZoEqT4kAsmjPhwdqxmW6eAG312z9GL2GkZWQc8",
    artistWallet: "9DbD6nmkeiYStSn8DNuMhkezpK5P3xGLBx5RFkYKNEBx",
    artistName: "Ash",
    feePremiumLamports: 300_000,
    artistSocials: "https://x.com/Ashes_arc",
    config: {
      x: 163,
      y: 301,
      fontSize: 68,
      fontFamily: "Manrope",
      fillStyle: "#e1f6e0",
      shadowColor: "#729278",
      shadowBlur: 0,
      shadowOffsetX: 4,
      shadowOffsetY: 1,
    },
  },
  // {
  //   uri: "https://arweave.net/sfEUHNREXt3fme5kJkhizJDFzeLcndfIt3bgs80uRp0?ext=png",
  //   mint: "HiJuJ2qQRFVXBUr7booTU4RKqYxLcH5YXcMQmUJKTFfv",
  //   artistWallet: "61YD2RUbhDcfUpP1Uy6vzXwRoV8nkVzYJcC6NVxsBC3h",
  //   artistName: "Apotiq1",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://x.com/Apotiq1",
  // },
  {
    uri: "https://arweave.net/6s2Jv_O2sFuw12p38wMq4NTit_KwiR8ADu9YcKeNdk8?ext=png",
    mint: "8rVdhKZGGgBdTCGsfos7KJxzGgJRgFNSeUeTRW1r469n",
    artistWallet: "4iuPZBgmwqKeRF6bDdPCvdnyxB46dJrJshZsXMZHbwis",
    artistName: "94L1",
    feePremiumLamports: 300_000,
    artistSocials: "https://x.com/94l1_",
    config: {
      x: 235,
      y: 406,
      fontSize: 56,
      fontFamily: "Manrope",
      fillStyle: "#ffffff",
      shadowColor: "#000000",
      shadowBlur: 6,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
    },
  },
  {
    uri: "https://arweave.net/5wCoYqrfh0nr10sdpzHSm1uaUadmfDxdJI4TN-n4Ljk?ext=png",
    mint: "DiCVrorLafQHpkNTYvWxKYX4mYbs7Z6wjE492LZbDszp",
    artistWallet: "6smBKDhMPxf9AD3Na7GkXnt5trhwKkfSEf1aWT4y5Aka",
    artistName: "DanFarz",
    feePremiumLamports: 300_000,
    artistSocials: "https://t.me/DanFarz",
    config: {
      x: 241,
      y: 370,
      fontSize: 60,
      fontFamily: "Manrope",
      fillStyle: "#ffffff",
      shadowColor: "#000000",
      shadowBlur: 5,
      shadowOffsetX: 4,
      shadowOffsetY: -3,
    },
  },
  {
    uri: "https://arweave.net/2lALp4UClaSuMAdM9f7DqdxhfLu4tD6CzQzjDmERvEE?ext=gif",
    mint: "9roUwKvunDd2XRjV1DMfPuut4kjU5KtqJRNPXeFDmoQL",
    artistWallet: "9DbD6nmkeiYStSn8DNuMhkezpK5P3xGLBx5RFkYKNEBx",
    artistName: "Ashes",
    feePremiumLamports: 300_000,
    artistSocials: "https://x.com/Ashes_arc",
    config: {
      x: 225,
      y: 455,
      fontSize: 70,
      fontFamily: "Manrope",
      fillStyle: "#ffffff",
      shadowColor: "rgba(0, 0, 0, 0.7)",
      shadowBlur: 0,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
    },
  },
  {
    uri: "https://arweave.net/wTPoJZ5Ru0OmQRyKQHHeYTH6ww1i8GJn51aC4Q70x08?ext=png",
    mint: "2EJinsv31EQxPUw2SHmezkMYDW5fp4X31mhSeNZScZWE",
    artistWallet: "zELCQXYo3Q5ePGjLBvirRJn72B7d8bHFARvNpwekmxY",
    artistName: "Notrev",
    feePremiumLamports: 300_000,
    artistSocials: "https://x.com/NotRevv__",
    config: {
      x: 230,
      y: 341,
      fontSize: 56,
      fontFamily: "Manrope",
      fillStyle: "#000000",
      shadowColor: "#fafafa",
      shadowBlur: 6,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
    },
  },
];

export default function MessagePage() {
  const [to, setTo] = useState<string>("");
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const debouncedTo = useDebounce(to, 300);

  // Only lookup domain if input contains a period
  const { data: domainLookup, isLoading: isLookingUpDomain } =
    useEclipseDomainLookup(/\./.test(debouncedTo) ? debouncedTo : undefined);

  // Validate input and update resolved address
  useEffect(() => {
    if (!debouncedTo) {
      setResolvedAddress(null);
      return;
    }

    if (/\./.test(debouncedTo)) {
      // Handle domain
      if (domainLookup?.publicKey && !domainLookup.error) {
        setResolvedAddress(domainLookup.publicKey);
      } else {
        setResolvedAddress(null);
      }
    } else {
      // Handle direct address
      try {
        new PublicKey(debouncedTo);
        setResolvedAddress(debouncedTo);
      } catch {
        setResolvedAddress(null);
      }
    }
  }, [debouncedTo, domainLookup]);

  const isValidInput = useCallback(() => {
    if (!to) return false;

    if (/\./.test(to)) {
      return Boolean(domainLookup?.publicKey && !domainLookup.error);
    }

    try {
      new PublicKey(to);
      return true;
    } catch {
      return false;
    }
  }, [to, domainLookup]);

  const baseTemplates = [
    {
      uri: "https://arweave.net/PGGyjImnEhdicy9RMDng-vowIqbY7CpTUKi2_5XZl08?ext=png",
      mint: "B6cawaKXzRDVA7c1YdaVrgrxBKWxRN9p5ADvr1gNsN6A",
      artistWallet: "6onrnEdTbQKprwgF5VhLSRN3HH9x2JtDetVBxMoqiwmH",
      artistName: "Validators",
      feePremiumLamports: 0,
      artistSocials: "https://x.com/Validators_",
      config: {
        x: 182,
        y: 473,
        fontSize: 72,
        fontFamily: "Manrope",
        fillStyle: "#ffffff",
        shadowColor: "#000000",
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      },
    },
  ];

  const loadedTemplates = [...baseTemplates, ...artistTemplates];
  // const loadedTemplates = useMemo(() => {
  //   const baseTemplates = [
  //     {
  //       uri: "https://arweave.net/PGGyjImnEhdicy9RMDng-vowIqbY7CpTUKi2_5XZl08?ext=png",
  //       mint: "B6cawaKXzRDVA7c1YdaVrgrxBKWxRN9p5ADvr1gNsN6A",
  //       artistWallet: "6onrnEdTbQKprwgF5VhLSRN3HH9x2JtDetVBxMoqiwmH",
  //       artistName: "Validators",
  //       feePremiumLamports: 0,
  //       artistSocials: "https://x.com/Validators_",
  //       config: {
  //         x: 182,
  //         y: 473,
  //         fontSize: 72,
  //         fontFamily: "Manrope",
  //         fillStyle: "#ffffff",
  //         shadowColor: "#000000",
  //         shadowBlur: 0,
  //         shadowOffsetX: 0,
  //         shadowOffsetY: 0,
  //       },
  //     },
  //   ];

  //   // const shuffledTemplates = [...artistTemplates].sort(
  //   //   () => Math.random() - 0.5
  //   // );

  //   return [...baseTemplates, ...ar];
  // }, []);

  const [message, setMessage] = useState<string>("");
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isSending, setIsSending] = useState(false);
  const [isLoadingBlips, setIsLoadingBlips] = useState(false);
  const [walletBlipNfts, setWalletBlipNfts] = useState<BlipNftData[]>([]);
  // const [templates, setTemplates] =
  //   useState<TemplateWithConfig[]>(loadedTemplates);
  // {
  //   uri: "https://arweave.net/Tv6NY-P8jSHWgX5-t_DswyOUpQ6SsOd6rsfZXnCtU_Y?ext=png",
  //   mint: "TVogK47MS2TFYpdwj7J1qgUuKZvdo2NBz8sRUz3GN57",
  //   artistWallet: "4iuPZBgmwqKeRF6bDdPCvdnyxB46dJrJshZsXMZHbwis",
  //   artistName: "94L1",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://x.com/94l1_",
  //   config: {
  //     x: 200,
  //     y: 425,
  //     fontSize: 65,
  //     fontFamily: "Manrope",
  //     fillStyle: "#ffffff",
  //     shadowColor: "rgba(0, 0, 0, 0.7)",
  //     shadowBlur: 1,
  //     shadowOffsetX: 2,
  //     shadowOffsetY: 1,
  //   },
  // },
  // {
  //   uri: "https://arweave.net/2lALp4UClaSuMAdM9f7DqdxhfLu4tD6CzQzjDmERvEE?ext=gif",
  //   mint: "9roUwKvunDd2XRjV1DMfPuut4kjU5KtqJRNPXeFDmoQL",
  //   artistWallet: "9DbD6nmkeiYStSn8DNuMhkezpK5P3xGLBx5RFkYKNEBx",
  //   artistName: "Ashes",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://x.com/Ashes_arc",
  //   config: {
  //     x: 225,
  //     y: 455,
  //     fontSize: 70,
  //     fontFamily: "Manrope",
  //     fillStyle: "#ffffff",
  //     shadowColor: "rgba(0, 0, 0, 0.7)",
  //     shadowBlur: 0,
  //     shadowOffsetX: 5,
  //     shadowOffsetY: 5,
  //   },
  // },
  // {
  //   uri: "https://arweave.net/7570C2s21UYRjCmsoGZ2iq3QWBxj1IyPKA0dzNHdy1w?ext=gif",
  //   mint: "Dt9h8CKTYMsnt7VuBqg78phSPu2BusKc119kvYyrFT53",
  //   artistWallet: "9DbD6nmkeiYStSn8DNuMhkezpK5P3xGLBx5RFkYKNEBx",
  //   artistName: "Ashes",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://x.com/Ashes_arc",
  //   config: {
  //     x: 295,
  //     y: 341,
  //     fontSize: 70,
  //     fontFamily: "Manrope",
  //     fillStyle: "#ffffff",
  //     shadowColor: "rgba(0, 0, 0, 0.7)",
  //     shadowBlur: 2,
  //     shadowOffsetX: 3,
  //     shadowOffsetY: 2,
  //   },
  // },
  // {
  //   uri: "https://arweave.net/5mqX54T47CX9OYReHK2cWleDquiSRhuP6xPD6K2Ukf0?ext=png",
  //   mint: "CGvyjWE7g6Xs7JoK35T8UdiBnd4rSdbyxkz9CyZ3iXU9",
  //   artistWallet: "B4gTwHU3emvkFBpuht7QFzjfK8djdrsxcqMdLydk6dzs",
  //   artistName: "Makoto",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://0xmakoto.carrd.co/",
  //   config: {
  //     x: 186,
  //     y: 425,
  //     fontSize: 66,
  //     fontFamily: "Manrope",
  //     fillStyle: "#000000",
  //     shadowColor: "rgba(0, 0, 0, 0.7)",
  //     shadowBlur: 1,
  //     shadowOffsetX: 2,
  //     shadowOffsetY: 1,
  //   },
  // },
  // {
  //   uri: "https://arweave.net/xNg-bP-UtKr8XHE_iWohHHUunWJsKH7kHby8Io-AF94?ext=png",
  //   mint: "D4JEB5nPTcD6FbKC9AyWNRCm9pWWogNpT4QsS5Wyk4SN",
  //   artistWallet: "8PwNQzLXKgaMSrvrsCfsJWEw7FoCmXXM8JLQhzvD9vsQ",
  //   artistName: "MTG",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://x.com/shadowwchaserr",
  //   config: {
  //     x: 200,
  //     y: 425,
  //     fontSize: 65,
  //     fontFamily: "Manrope",
  //     fillStyle: "#ffffff",
  //     shadowColor: "rgba(0, 0, 0, 0.7)",
  //     shadowBlur: 1,
  //     shadowOffsetX: 2,
  //     shadowOffsetY: 1,
  //   },
  // },
  // {
  //   uri: "https://arweave.net/BVTWD1X4EACbUXinX2SoCzfYglF_TDDZivZO8HijB8c?ext=png",
  //   mint: "P7WjdPFgTr7GMe71jRprsHz7u6MY5qD6zhiAuX6kBPk",
  //   artistWallet: "6smBKDhMPxf9AD3Na7GkXnt5trhwKkfSEf1aWT4y5Aka",
  //   artistName: "DanFarz",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://t.me/DanFarz",
  //   config: {
  //     x: 200,
  //     y: 425,
  //     fontSize: 65,
  //     fontFamily: "Manrope",
  //     fillStyle: "#ffffff",
  //     shadowColor: "rgba(0, 0, 0, 0.7)",
  //     shadowBlur: 1,
  //     shadowOffsetX: 2,
  //     shadowOffsetY: 1,
  //   },
  // },
  // {
  //   uri: "https://arweave.net/Opo1BMaJOEL7frhtnlsstOpeTMj2uK71KHBGpRx3LJA?ext=gif",
  //   mint: "4kmandkHVYKaJxPvNC5aQHGLhyY5AjH3DipBzzv2eAfP",
  //   artistWallet: "9DbD6nmkeiYStSn8DNuMhkezpK5P3xGLBx5RFkYKNEBx",
  //   artistName: "Ash",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://x.com/Ashes_arc",
  // },
  // {
  //   uri: "https://arweave.net/Ot1Ju61AtjpOl2Tt5lyioOJeEi8SChjqUIuB35pKVDs?ext=gif",
  //   mint: "7joBw7ZoEqT4kAsmjPhwdqxmW6eAG312z9GL2GkZWQc8",
  //   artistWallet: "9DbD6nmkeiYStSn8DNuMhkezpK5P3xGLBx5RFkYKNEBx",
  //   artistName: "Ash",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://x.com/Ashes_arc",
  // },
  // {
  //   uri: "https://arweave.net/sfEUHNREXt3fme5kJkhizJDFzeLcndfIt3bgs80uRp0?ext=png",
  //   mint: "HiJuJ2qQRFVXBUr7booTU4RKqYxLcH5YXcMQmUJKTFfv",
  //   artistWallet: "61YD2RUbhDcfUpP1Uy6vzXwRoV8nkVzYJcC6NVxsBC3h",
  //   artistName: "Apotiq1",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://x.com/Apotiq1",
  // },
  // {
  //   uri: "https://arweave.net/6s2Jv_O2sFuw12p38wMq4NTit_KwiR8ADu9YcKeNdk8?ext=png",
  //   mint: "8rVdhKZGGgBdTCGsfos7KJxzGgJRgFNSeUeTRW1r469n",
  //   artistWallet: "4iuPZBgmwqKeRF6bDdPCvdnyxB46dJrJshZsXMZHbwis",
  //   artistName: "94L1",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://x.com/94l1_",
  // },
  // {
  //   uri: "https://arweave.net/5wCoYqrfh0nr10sdpzHSm1uaUadmfDxdJI4TN-n4Ljk?ext=png",
  //   mint: "DiCVrorLafQHpkNTYvWxKYX4mYbs7Z6wjE492LZbDszp",
  //   artistWallet: "6smBKDhMPxf9AD3Na7GkXnt5trhwKkfSEf1aWT4y5Aka",
  //   artistName: "DanFarz",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://t.me/DanFarz",
  // },
  // {
  //   uri: "https://arweave.net/wTPoJZ5Ru0OmQRyKQHHeYTH6ww1i8GJn51aC4Q70x08?ext=png",
  //   mint: "2EJinsv31EQxPUw2SHmezkMYDW5fp4X31mhSeNZScZWE",
  //   artistWallet: "zELCQXYo3Q5ePGjLBvirRJn72B7d8bHFARvNpwekmxY",
  //   artistName: "Notrev",
  //   feePremiumLamports: 300_000,
  //   artistSocials: "https://x.com/NotRevv__",
  // },

  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateWithConfig | null>(loadedTemplates[0]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const formatMessage = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const umi = createUmi(connection.rpcEndpoint);

  useEffect(() => {
    async function loadBlips() {
      if (!wallet?.publicKey) {
        return;
      }

      setIsLoadingBlips(true);

      const fetchCoreAssets = async () => {
        if (!wallet?.publicKey) {
          return [];
        }
        const ownedAssets = await fetchAssetsByOwner(
          umi,
          publicKey(wallet.publicKey.toBase58()),
          {
            skipDerivePlugins: false,
          }
        );
        console.log("ownedAssets", ownedAssets);
        const ownedBlips = ownedAssets.filter(
          (asset) =>
            asset.updateAuthority.address ===
            publicKey("7MWzy1jbS3KC561EnY6DBixqToVwMfDqd7eXcGXZkj2A")
        );
        return ownedBlips;
      };

      const mappedBlips = async (assets: AssetV1[]): Promise<BlipNftData[]> => {
        const blipDataPromises = assets.map(async (asset) => {
          try {
            const response = await fetch(asset.uri);
            if (!response.ok) {
              throw new Error(`Failed to fetch JSON from ${asset.uri}`);
            }
            const data = await response.json();
            return {
              address: asset.publicKey.toString(),
              metadata: {
                image: data.image,
                attributes: data.attributes || [],
              },
            } as BlipNftData;
          } catch (error) {
            console.error(
              `Error processing asset ${asset.publicKey.toString()}:`,
              error
            );
            return null; // Skip this asset if there's an error
          }
        });

        const blipData = await Promise.all(blipDataPromises);
        // Filter out any null values resulting from fetch errors
        return blipData.filter((nft): nft is BlipNftData => nft !== null);
      };

      const blipNfts = await mappedBlips(await fetchCoreAssets());

      setWalletBlipNfts(
        blipNfts.filter((nft): nft is BlipNftData => nft !== null)
      );
      setIsLoadingBlips(false);
    }

    // async function loadTemplates() {
    //   setIsLoadingTemplates(true);
    //   const templates = await getConfigTemplates();
    //   setTemplates(templates);
    //   if (templates.length > 0) {
    //     setSelectedTemplate(templates[0]);
    //   }
    //   setIsLoadingTemplates(false);
    // }
    // loadTemplates();

    loadBlips();
  }, [wallet.publicKey]);

  async function handleSendBlip(
    template: TemplateWithConfig,
    message: string,
    to: string
  ) {
    if (!wallet || !wallet.publicKey || !wallet.signAllTransactions) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your wallet.",
      });
      return;
    }

    let targetAddress = to;
    if (/\./.test(to) && domainLookup?.publicKey) {
      targetAddress = domainLookup.publicKey;
    }

    try {
      new PublicKey(targetAddress);
    } catch (error) {
      toast.error("Invalid Recipient Address", {
        description: "Please enter a valid Solana address or domain.",
      });
      return;
    }

    if (!message) {
      toast.error("No Message Provided", {
        description: "Please enter a message for your Blip!",
      });
      return;
    }

    setIsSending(true);
    const toastId = toast.loading("Generating your Blip image...");

    umi.use(walletAdapterIdentity(wallet, true));

    let txnSignature: string | null = null;
    try {
      const from = wallet.publicKey.toString();
      const response = await generateBlip(
        template,
        message,
        targetAddress,
        from
      );
      if (!response.data || response.error) {
        toast.error("Error generating Blip!", {
          id: toastId,
          description: response.error ?? "Unknown error",
        });
        setIsSending(false);
        return;
      }

      toast.loading("Sending transaction...", { id: toastId });

      // @ts-ignore
      const deserializedTxnAsU8 = base64.serialize(response.serializedTxn);
      const deserializedTxn = umi.transactions.deserialize(deserializedTxnAsU8);
      const signedTxn = await umi.identity.signTransaction(deserializedTxn);
      txnSignature = base58.deserialize(
        await umi.rpc.sendTransaction(signedTxn)
      )[0];

      toast.success(`Successfully sent Blip!`, {
        id: toastId,
        description: "You can view your transacton on the Eclipse Explorer",
        action: {
          label: "View Transactions",
          onClick: () =>
            window.open(
              `${process.env.NEXT_PUBLIC_EXPLORER!}/tx/${txnSignature}`,
              "_blank"
            ),
        },
      });
    } catch (error) {
      console.error(`Error SENDING blip (txn sig: ${txnSignature}):`, error);
      toast.error("Error sending Blip!", {
        id: toastId,
        description: error instanceof Error ? error.message : "Unknown error",
      });
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(connection);
        console.log(error.logs, logs);
      }
    } finally {
      setIsSending(false);
    }
  }

  const [clickCount, setClickCount] = useState(0);
  const clickTimeout = useRef<NodeJS.Timeout>();

  const handleTemplateClick = async () => {
    setClickCount((prev) => prev + 1);

    // Reset click count after 1 second
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
    }
    clickTimeout.current = setTimeout(() => setClickCount(0), 1000);

    // If we've reached 3 clicks
    if (clickCount === 2) {
      // We check for 2 because this click will make it 3
      setClickCount(0);
      if (!selectedTemplate || !message) {
        toast.error("Please select a template and enter a message first");
        return;
      }

      const toastId = toast.loading("Generating preview image...");
      try {
        const response = await generateBlip(
          selectedTemplate,
          message,
          "preview",
          "preview"
        );
        if (response?.error) {
          toast.error("Failed to generate preview", { id: toastId });
          return;
        }

        // Handle the preview data on the client side
        if (response.data?.preview) {
          const { buffer, contentType, extension } = response.data;
          // Convert base64 string to Uint8Array
          // @ts-ignore
          const binaryString = atob(buffer);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob([bytes], { type: contentType });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `blip-preview.${extension}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          toast.success("Preview generated! Check your downloads folder.", {
            id: toastId,
          });
        }
      } catch (error) {
        toast.error("Failed to generate preview", { id: toastId });
        console.error(error);
      }
    }
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const updateCanvas = async () => {
      const canvas = canvasRef.current;
      if (!canvas || !selectedTemplate?.uri) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const templateImg = new (window.Image as any)();
      templateImg.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        templateImg.onload = () => {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw template
          ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

          // Apply text configurations from template config
          const config = selectedTemplate.config;
          if (config) {
            ctx.fillStyle = config.fillStyle;
            ctx.shadowColor = config.shadowColor;
            ctx.shadowBlur = config.shadowBlur;
            ctx.shadowOffsetX = config.shadowOffsetX;
            ctx.shadowOffsetY = config.shadowOffsetY;
            ctx.font = `${config.fontSize}px ${config.fontFamily}`;

            // Draw text lines
            const lines = message.split("\n");
            lines.forEach((line, index) => {
              ctx.fillText(line, config.x, config.y + index * config.fontSize);
            });
          }
          resolve(true);
        };
        templateImg.onerror = reject;
        templateImg.src = selectedTemplate.uri;
      });
    };

    updateCanvas();
  }, [selectedTemplate, message]);

  return (
    <>
      <div className="main-bg mt-4 min-h-screen bg-cover bg-fixed bg-center bg-no-repeat p-4 text-foreground">
        <div className="mx-auto max-w-4xl">
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-center text-center text-2xl font-bold">
                <Image
                  src="/blip/logo.png"
                  alt="Blip"
                  width={200}
                  height={200}
                />
              </CardTitle>
              <p className="flex items-center justify-center pt-4">
                Want to send a message to a wallet on Eclipse?
              </p>
              <p className="flex items-center justify-center">
                Say you want to buy a NFT, or send a special message to an
                enemy, or just say hi, with a Blip&nbsp;
                <Image
                  src="/logo/small.webp"
                  alt="Validators"
                  width={20}
                  height={20}
                />
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-4 w-full space-y-2 rounded-lg border border-border bg-background/50 p-4">
                    <p className="pb-2 text-center font-medium">
                      Select Template
                    </p>
                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                      {isLoadingTemplates
                        ? Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className="aspect-square w-full animate-pulse rounded-lg bg-muted"
                              />
                            ))
                        : loadedTemplates.map((template) => (
                            <button
                              key={template.mint}
                              onClick={() => setSelectedTemplate(template)}
                              className={`group relative flex w-full flex-col items-center rounded-lg border transition-all hover:opacity-90 ${
                                selectedTemplate?.mint === template.mint
                                  ? "border-primary shadow-sm"
                                  : "border-border"
                              }`}
                            >
                              {template.artistName !== "Validators" && (
                                <div className="absolute -right-3 -top-2 z-[999] rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                                  New!
                                </div>
                              )}
                              <div className="relative z-0 aspect-square w-full">
                                <Image
                                  src={template.uri}
                                  alt={`${template.artistName} Template`}
                                  layout="fill"
                                  objectFit="contain"
                                  className="p-1"
                                />
                              </div>
                              <span className="py-1 text-xs">
                                {template.artistName}
                              </span>
                            </button>
                          ))}
                    </div>
                  </div>

                  <Input
                    type="text"
                    placeholder="Enter Eclipse Wallet Address or Domain"
                    className={`mb-2 ${
                      to &&
                      (isLookingUpDomain
                        ? "border-yellow-500"
                        : isValidInput()
                          ? "border-green-500"
                          : "border-red-500")
                    }`}
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    disabled={isLoadingTemplates}
                  />
                  {to && (
                    <div className="text-sm">
                      {isLookingUpDomain ? (
                        <p className="text-yellow-500">Looking up domain...</p>
                      ) : /\./.test(to) ? (
                        domainLookup?.publicKey ? (
                          <p className="text-green-500">
                            Resolved address:{" "}
                            {domainLookup.publicKey.slice(0, 4)}...
                            {domainLookup.publicKey.slice(-4)}
                          </p>
                        ) : (
                          <p className="text-red-500">
                            Invalid or unregistered domain
                          </p>
                        )
                      ) : isValidInput() ? (
                        <p className="text-green-500">Valid Solana address</p>
                      ) : (
                        <p className="text-red-500">Invalid Solana address</p>
                      )}
                    </div>
                  )}
                  <Textarea
                    placeholder="Write your message..."
                    className="mb-4 h-32"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoadingTemplates}
                  />
                  {wallet?.publicKey ? (
                    <Button
                      className="w-full"
                      variant="default"
                      onClick={() => {
                        if (!selectedTemplate) {
                          toast.error("No template selected", {
                            description: "Please select a template",
                          });
                          return;
                        }
                        handleSendBlip(selectedTemplate, message, to);
                      }}
                      disabled={
                        isSending || !wallet?.publicKey || !isValidInput()
                      }
                      loading={isSending}
                      loadingText={isSending ? "Sending Transaction" : ""}
                    >
                      Send Blip!
                    </Button>
                  ) : (
                    <div className="text-center">
                      Connect wallet to send a Blip
                    </div>
                  )}
                </div>
                <div>
                  <div
                    onClick={handleTemplateClick}
                    className="relative aspect-square rounded-lg border border-border bg-[#8b283c]/20"
                  >
                    {selectedTemplate?.uri && (
                      <canvas
                        ref={canvasRef}
                        width={1280}
                        height={1280}
                        className="h-full w-full cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2 rounded-lg border border-border bg-background/50 p-4 text-center text-sm">
                <p className="font-medium">Blip Transaction Fees</p>
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div>
                    <span className="text-muted-foreground">Total Cost:</span>{" "}
                    <code className="font-semibold text-primary">
                      ~0.000738 ETH
                    </code>
                    <span className="ml-2 text-muted-foreground">
                      (includes mint and Metaplex fees)
                    </span>
                  </div>
                  {selectedTemplate?.artistName !== "Validators" && (
                    <div className="text-xs text-muted-foreground">
                      A portion of the fee will go to{" "}
                      {selectedTemplate?.artistName}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h1 className="text-2xl font-bold">Your Blips</h1>
            <div className="mt-4">
              {wallet?.publicKey ? (
                <BlipNftGrid nfts={walletBlipNfts} loading={isLoadingBlips} />
              ) : (
                "Connect your wallet to check for Blips!"
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
