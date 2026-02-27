import React from "react";
import {
  User, Eye, EyeOff, CheckCircle, PlusCircle, Search, X,
  Check, Plus, AlertCircle, Calendar, Clock, MapPin,
  ChevronLeft, ChevronRight, Edit2, LogOut,
  Menu, Globe, Info, ExternalLink,
  type LucideProps,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  user: User,
  eye: Eye,
  "eye-off": EyeOff,
  "check-circle": CheckCircle,
  "plus-circle": PlusCircle,
  search: Search,
  x: X,
  check: Check,
  plus: Plus,
  "alert-circle": AlertCircle,
  calendar: Calendar,
  clock: Clock,
  "map-pin": MapPin,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "edit-2": Edit2,
  "log-out": LogOut,
  menu: Menu,
  globe: Globe,
  info: Info,
  "external-link": ExternalLink,
};

interface FeatherProps {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export function Feather({ name, size = 24, color = "currentColor", style }: FeatherProps) {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) {
    console.warn(`[Feather] Unknown icon: "${name}"`);
    return null;
  }
  return <IconComponent size={size} color={color} style={style} />;
}
