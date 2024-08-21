"use client";

import React, { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { generateBlip } from "./actions";

export default function MessagePage() {
  const [message, setMessage] = useState<string>("");

  const formatMessage = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  async function handleSendBlip(message: string) {
    try {
      await generateBlip(message);
    } catch (error) {
      console.error("Error generating or downloading blip:", error);
    }
  }

  return (
    <div className="main-bg mt-4 min-h-screen bg-cover bg-fixed bg-center bg-no-repeat p-4 text-foreground">
      <div className="mx-auto max-w-4xl">
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              <Image src="/blip/logo.png" alt="Blip" width={200} height={200} />
            </CardTitle>
            <p className="pt-4">Send an NFT message.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Input
                  type="text"
                  placeholder="Enter Eclipse Wallet Address"
                  className="mb-4"
                />
                <Textarea
                  placeholder="Write your message..."
                  className="mb-4 h-32"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => handleSendBlip(message)}
                >
                  Send Blip!
                </Button>
              </div>
              <div>
                <div className="relative aspect-square rounded-lg border border-border">
                  <Image
                    src="/blip/placeholder.png"
                    alt="Blip Placeholder"
                    layout="fill"
                    objectFit="contain"
                  />
                  <div className="absolute ml-[40px] mt-[80px] w-full p-4">
                    <div className="w-auto max-w-none">
                      <p className="whitespace-nowrap text-[21px] text-foreground">
                        {formatMessage(message)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="ml-2"></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
