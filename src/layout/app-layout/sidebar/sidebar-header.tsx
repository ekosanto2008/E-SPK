"use client";

import { SidebarHeader } from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils";
import Image from "next/image";

interface AppSidebarHeaderProps {
  showContent: boolean;
}

export default function AppSidebarHeader({
  showContent,
}: AppSidebarHeaderProps) {
  return (
    <SidebarHeader className="px-5 py-5 border-b border-gray-100 dark:border-gray-800/60">
      <Link
        href="/"
        className={cn(
          "flex items-center gap-3 transition-opacity hover:opacity-90",
          !showContent ? "justify-center" : "justify-start"
        )}
      >
        <div className="relative flex size-11 shrink-0 items-center justify-center">
          <Image
            src="/images/vector/logo-disminpersal-removebg-preview.png"
            alt="Logo Disminpersal"
            width={44}
            height={44}
            className="size-11 object-contain drop-shadow-xs"
            priority
          />
        </div>
        {showContent && (
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-800 dark:text-white leading-tight tracking-tight">
              SPK DIGITAL
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
              Disminpersal TNI AL
            </p>
          </div>
        )}
      </Link>
    </SidebarHeader>
  );
}
