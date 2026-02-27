import React from "react";

interface SpacerProps { size?: number; horizontal?: boolean }

export function Spacer({ size = 8, horizontal = false }: SpacerProps) {
  return <div style={horizontal ? { width: size } : { height: size }} />;
}
