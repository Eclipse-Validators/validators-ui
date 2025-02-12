import React from "react";

import { Label } from "./label";

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({
  label,
  value,
  onChange,
  className = "",
}: ColorPickerProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 rounded-md border border-[#ff4d94]/30"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-full cursor-pointer appearance-none rounded-md border border-[#ff4d94]/30 bg-[#8b283c]/20 p-1"
        />
      </div>
    </div>
  );
}
