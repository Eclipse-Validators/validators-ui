"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"

import { decodeEditions } from "@/lib/anchor/editions/accounts"
import { getGroupMembers } from "@/lib/anchor/getGroupMembers"

import { useEditionsProgram } from "./EditionsProgramContext"

interface GroupMember {
  member: string
  mint?: string
  owner?: string
}

interface GroupMembersContextType {
  members: GroupMember[]
  hashlist: Set<string>
  groupId: PublicKey | null
  isLoading: boolean
  refreshMembers: () => Promise<void>
}

const GroupMembersContext = createContext<GroupMembersContextType | undefined>(
  undefined
)

export function GroupMembersProvider({
  children,
  deploymentId,
}: {
  children: React.ReactNode
  deploymentId: PublicKey
}) {
  const [members, setMembers] = useState<GroupMember[]>([])
  const [hashlist, setHashlist] = useState<Set<string>>(new Set())
  const [groupId, setGroupId] = useState<PublicKey | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { connection } = useConnection()
  const { program } = useEditionsProgram()

  const fetchMembers = useCallback(async () => {
    if (!program) return

    setIsLoading(true)
    try {
      // Fetch the deployment account data only once
      const accountData = await connection.getAccountInfo(deploymentId)
      if (!accountData) {
        throw Error(`Deployment ${deploymentId.toBase58()} not found`)
      }

      const deploymentObj = decodeEditions(program)(
        accountData.data,
        deploymentId
      )
      if (!deploymentObj || !deploymentObj.item) {
        throw new Error("No deployment data")
      }

      const fetchedGroupId = deploymentObj.item.group
      setGroupId(fetchedGroupId)

      const fetchedMembers = await getGroupMembers(connection, fetchedGroupId)
      const groupMembers = fetchedMembers.map((member) => ({
        member: member.member,
        mint: member.mint,
        owner: member.owner
      }))
      console.log('groupMembers', groupMembers);
      setMembers(groupMembers)
      const newHashlist = new Set(
        fetchedMembers
          .map((member) => member.mint)
          .filter((y): y is string => y !== undefined)
      )
      setHashlist(newHashlist)
    } catch (error) {
      console.error("Error fetching group members:", error)
    } finally {
      setIsLoading(false)
    }
  }, [deploymentId, connection, program])

  useEffect(() => {
    if (program) {
      fetchMembers()
    }
  }, [fetchMembers, program])

  const refreshMembers = useCallback(async () => {
    if (groupId) {
      setIsLoading(true)
      try {
        const fetchedMembers = await getGroupMembers(connection, groupId)
        setMembers(fetchedMembers)

        // Update hashlist
        const newHashlist = new Set(
          fetchedMembers
            .map((member) => member.mint)
            .filter((y): y is string => y !== undefined)
        )
        setHashlist(newHashlist)
      } catch (error) {
        console.error("Error refreshing group members:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }, [connection, groupId])

  return (
    <GroupMembersContext.Provider
      value={{ members, hashlist, groupId, isLoading, refreshMembers }}
    >
      {children}
    </GroupMembersContext.Provider>
  )
}

export function useGroupMembers() {
  const context = useContext(GroupMembersContext)
  if (context === undefined) {
    throw new Error(
      "useGroupMembers must be used within a GroupMembersProvider"
    )
  }
  return context
}
