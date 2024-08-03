"use client";

import React, { createContext, useContext, useMemo } from "react";
import { Connection } from "@solana/web3.js";

const GlobalConnectionContext = createContext<Connection | null>(null);

export const GlobalConnectionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const connection = useMemo(() => {
    return new Connection(
      process.env.NEXT_PUBLIC_NETWORK ?? "https://mainnetbeta-rpc.eclipse.xyz"
    );
  }, []);

  return (
    <GlobalConnectionContext.Provider value={connection}>
      {children}
    </GlobalConnectionContext.Provider>
  );
};

export const useGlobalConnection = (): Connection => {
  const context = useContext(GlobalConnectionContext);
  if (!context) {
    throw new Error(
      "useGlobalConnection must be used within a GlobalConnectionProvider"
    );
  }
  return context;
};
