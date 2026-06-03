"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function SiteBrand() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-90"
    >
      <Image
        src="/skillswap_log.png"
        alt=""
        width={32}
        height={32}
        className="size-8 rounded-sm object-contain"
        priority
      />
      <span className="text-lg font-bold text-primary">SkillSwap</span>
    </Link>
  );
}
