import React, { createContext, ReactNode, useContext, useState } from "react";

import { FetchedTokenInfo } from "@/lib/types";

interface TransferItem {
  type: "SOL" | "SPL" | "NFT";
  amount: string;
  token?: FetchedTokenInfo;
}

interface TransferContextType {
  transferItems: TransferItem[];
  addTransferItem: (item: TransferItem) => void;
  removeTransferItem: (index: number) => void;
  clearTransferItems: () => void;
}

const TransferContext = createContext<TransferContextType | undefined>(
  undefined
);

export const TransferProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);

  const addTransferItem = (item: TransferItem) => {
    setTransferItems((prev) => [...prev, item]);
  };

  const removeTransferItem = (index: number) => {
    setTransferItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearTransferItems = () => {
    setTransferItems([]);
  };

  return (
    <TransferContext.Provider
      value={{
        transferItems,
        addTransferItem,
        removeTransferItem,
        clearTransferItems,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
};

export const useTransfer = () => {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error("useTransfer must be used within a TransferProvider");
  }
  return context;
};
