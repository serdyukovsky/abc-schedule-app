import React from "react";
import { ScrollView } from "@/components/primitives";

export function KeyboardAwareScrollViewCompat({ children, ...props }: any) {
  return <ScrollView {...props}>{children}</ScrollView>;
}
