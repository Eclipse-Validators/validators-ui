"use client";

import React from "react";
import { PublicKey } from "@solana/web3.js";

import { GroupMembersProvider } from "@/components/providers/GroupMembersContext";
import VortexLock from "./VortexLock";

export default function VortexLockWrapper() {
    const deploymentId = new PublicKey(
        process.env.NEXT_PUBLIC_DEPLOYMENTID ?? ""
    );

    return (
        <GroupMembersProvider deploymentId={deploymentId}>
            <VortexLock />
        </GroupMembersProvider>
    );
}
