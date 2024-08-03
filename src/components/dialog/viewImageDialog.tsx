import { useState } from "react";
import Image from "next/image";
import { Download, X } from "lucide-react";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface ViewImageDialogProps {
  name: string;
  image: string;
}

export function ViewImageDialog({ name, image }: ViewImageDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name || "nft"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <>
      <Image
        src={image}
        alt={name}
        className="absolute left-0 top-0 h-full w-full cursor-pointer object-cover"
        onClick={() => setIsOpen(true)}
        width={800}
        height={800}
      />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Image
              src={image}
              alt={name}
              className="w-full rounded-lg"
              width={800}
              height={800}
            />
            <Button
              variant="ghost"
              className="absolute bottom-4 right-4"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
