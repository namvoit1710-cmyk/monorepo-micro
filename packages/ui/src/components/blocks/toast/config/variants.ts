import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  XCircle
} from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info" | "loading";

export interface VariantConfig {
  bar: string;
  icon: LucideIcon;
  duration: number;
}

export const VARIANT_CONFIG: Record<ToastVariant, VariantConfig> = {
  success: {
    bar: "bg-[#256f3a]",
    icon: CheckCircle2,
    duration: 4000,
  },
  error: {
    bar: "bg-[#aa0808]",
    icon: XCircle,
    duration: 6000,
  },
  warning: {
    bar: "bg-[#e76500]",
    icon: AlertTriangle,
    duration: 6000,
  },
  info: {
    bar: "bg-[#0070f2]",
    icon: Info,
    duration: 4000,
  },
  loading: {
    bar: "bg-[#556b82]",
    icon: Loader2,
    duration: Infinity,
  },
};

export const ICON_COLOR: Record<ToastVariant, string> = {
  success: "#256f3a",
  error: "#aa0808",
  warning: "#e76500",
  info: "#0070f2",
  loading: "#556b82",
};