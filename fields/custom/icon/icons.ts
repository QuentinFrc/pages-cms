import type { LucideIcon } from "lucide-react";
import {
  Home,
  Star,
  Heart,
  Smile,
  Settings,
} from "lucide-react";

type IconOption = {
  value: string;
  label: string;
  Icon: LucideIcon;
};

const ICON_OPTIONS: IconOption[] = [
  {
    value: "home",
    label: "Home",
    Icon: Home,
  },
  {
    value: "star",
    label: "Star",
    Icon: Star,
  },
  {
    value: "heart",
    label: "Heart",
    Icon: Heart,
  },
  {
    value: "smile",
    label: "Smile",
    Icon: Smile,
  },
  {
    value: "settings",
    label: "Settings",
    Icon: Settings,
  },
];

export { ICON_OPTIONS };
export type { IconOption };
